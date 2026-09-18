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

  // One row per resort in the CSV now (no per-visit date/notes tracking).
  function buildResorts(rows) {
    return rows
      .map((r) => ({
        resort: (r.resort || "").trim(),
        state_or_country: r.state_or_country || "",
        lat: toNumber(r.lat),
        lon: toNumber(r.lon),
        elevation_ft: toNumber(r.elevation_ft),
      }))
      .filter((r) => r.resort);
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

    el.innerHTML = renderMapSection(mappable) + renderChartSection(chartable);

    // The map container must exist in the DOM (set via innerHTML above)
    // before Leaflet can measure it and place tiles.
    if (mappable.length > 0) {
      initMap(mappable, maxResort);
    }

    window.initScrollGradient && window.initScrollGradient();
  } catch (err) {
    el.innerHTML = `<div class="empty-state">Couldn't load the ski log. If you're previewing this by double-clicking the file, run <code>python3 -m http.server 8000</code> instead; the browser blocks local file loads otherwise.</div>`;
  }
})();
