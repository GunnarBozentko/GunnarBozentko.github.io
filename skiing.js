(async function () {
  const el = document.getElementById("ski-content");

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

    el.innerHTML = `
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
    `;
  } catch (err) {
    el.innerHTML = `<div class="empty-state">Couldn't load the ski log. If you're previewing this by double-clicking the file, run <code>python3 -m http.server 8000</code> instead — the browser blocks local file loads otherwise.</div>`;
  }
})();
