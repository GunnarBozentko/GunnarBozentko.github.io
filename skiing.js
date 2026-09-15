(async function () {
  const el = document.getElementById("ski-content");

  const STAR_SVG =
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#ef0107" d="M12 1.5l3.09 6.26 6.91 1-5 4.87 1.18 6.87L12 17.27l-6.18 3.25L7 13.63l-5-4.87 6.91-1z"/></svg>';

  function toNumber(v) {
    if (v == null) return null;
    const s = String(v).trim();
    if (s === "") return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  // The CSV mixes per-visit rows (date, notes — can repeat per resort) with
  // per-resort facts (lat, lon, elevation — should be constant). Dedup by
  // resort name before mapping/charting; the table below still renders the
  // raw per-visit rows untouched.
  function buildResorts(rows) {
    const byName = new Map();
    for (const r of rows) {
      const name = (r.resort || "").trim();
      if (!name) continue;
      const key = name.toLowerCase();
      const lat = toNumber(r.lat);
      const lon = toNumber(r.lon);
      const elev = toNumber(r.elevation_ft);
      const existing = byName.get(key);
      if (!existing) {
        byName.set(key, {
          resort: name,
          state_or_country: r.state_or_country || "",
          lat,
          lon,
          elevation_ft: elev,
        });
      } else {
        if (existing.lat == null) existing.lat = lat;
        if (existing.lon == null) existing.lon = lon;
        if (existing.elevation_ft == null) existing.elevation_ft = elev;
      }
    }
    return [...byName.values()];
  }

  function renderTable(rows) {
    const body = rows
      .map(
        (r) => `
        <tr>
          <td>${r.resort || ""}</td>
          <td>${r.state_or_country || ""}</td>
          <td>${r.date || ""}</td>
          <td>${r.notes || ""}</td>
        </tr>`
      )
      .join("");

    return `
      <section class="ski-section">
        <h2>Log</h2>
        <div class="table-wrap">
          <table class="ski-table">
            <thead>
              <tr>
                <th>Resort</th>
                <th>Where</th>
                <th>Date</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>${body}</tbody>
          </table>
        </div>
        <p class="muted" style="margin-top: 1rem;">${rows.length} place${rows.length === 1 ? "" : "s"} logged.</p>
      </section>`;
  }

  function renderMapSection(mappable) {
    if (mappable.length === 0) {
      return `
        <section class="ski-section">
          <h2>Map</h2>
          <div class="empty-state">
            Add lat/lon to <code>data/ski-log.csv</code> to see resorts on the map.
          </div>
        </section>`;
    }

    return `
      <section class="ski-section">
        <h2>Map</h2>
        <div id="ski-map" class="ski-map"></div>
      </section>`;
  }

  function initMap(mappable, maxResort) {
    const map = L.map("ski-map", { scrollWheelZoom: false });

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 16,
        attribution:
          "Esri, HERE, Garmin, &copy; OpenStreetMap contributors, and the GIS user community",
      }
    ).addTo(map);

    const dotIcon = L.divIcon({
      className: "",
      html: '<span class="ski-marker-dot"></span>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      popupAnchor: [0, -8],
    });

    const starIcon = L.divIcon({
      className: "ski-marker-star",
      html: STAR_SVG,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -16],
    });

    const markers = mappable.map((resort) => {
      const isMax = resort === maxResort;
      const marker = L.marker([resort.lat, resort.lon], {
        icon: isMax ? starIcon : dotIcon,
      }).addTo(map);

      const elevText =
        resort.elevation_ft != null
          ? `${resort.elevation_ft.toLocaleString()} ft`
          : "";

      marker.bindPopup(`
        <strong>${resort.resort}</strong><br>
        ${resort.state_or_country || ""}${elevText ? ` &middot; ${elevText}` : ""}
        ${isMax ? "<br><em>Highest logged</em>" : ""}
      `);

      return marker;
    });

    if (mappable.length === 1) {
      map.setView([mappable[0].lat, mappable[0].lon], 10);
    } else {
      map.fitBounds(L.featureGroup(markers).getBounds(), {
        padding: [32, 32],
        maxZoom: 11,
      });
    }
  }

  function renderChartSection(chartable) {
    if (chartable.length === 0) {
      return `
        <section class="ski-section">
          <h2>Elevation</h2>
          <div class="empty-state">
            Add elevation_ft to <code>data/ski-log.csv</code> to chart summit elevations.
          </div>
        </section>`;
    }

    const maxElevation = chartable[0].elevation_ft;

    const rows = chartable
      .map((resort, i) => {
        const isMax = i === 0;
        const width = Math.max(4, (resort.elevation_ft / maxElevation) * 100);
        return `
          <div class="elev-row">
            <span class="elev-label">${resort.resort}${isMax ? STAR_SVG : ""}</span>
            <span class="elev-bar-track">
              <span class="elev-bar${isMax ? " elev-bar--max" : ""}" style="width:${width}%"></span>
            </span>
            <span class="elev-value">${resort.elevation_ft.toLocaleString()} ft</span>
          </div>`;
      })
      .join("");

    return `
      <section class="ski-section">
        <h2>Elevation</h2>
        <div class="elev-chart">${rows}</div>
      </section>`;
  }

  try {
    const res = await fetch("data/ski-log.csv");
    const text = await res.text();
    const rows = parseCSV(text);

    if (rows.length === 0) {
      el.innerHTML = `
        <div class="empty-state">
          No places logged yet. Add rows to <code>data/ski-log.csv</code>
          and they'll show up here.
        </div>`;
      return;
    }

    const resorts = buildResorts(rows);
    const mappable = resorts.filter((r) => r.lat != null && r.lon != null);
    const chartable = resorts
      .filter((r) => r.elevation_ft != null)
      .sort((a, b) => b.elevation_ft - a.elevation_ft);
    const maxResort = chartable[0] ?? null;

    el.innerHTML =
      renderMapSection(mappable) +
      renderChartSection(chartable) +
      renderTable(rows);

    // The map container must exist in the DOM (set via innerHTML above)
    // before Leaflet can measure it and place tiles.
    if (mappable.length > 0) {
      initMap(mappable, maxResort);
    }

    window.initScrollGradient && window.initScrollGradient();
  } catch (err) {
    el.innerHTML = `<div class="empty-state">Couldn't load the ski log. If you're previewing this by double-clicking the file, run <code>python3 -m http.server 8000</code> instead — the browser blocks local file loads otherwise.</div>`;
  }
})();
