(async function () {
  const el = document.getElementById("resume-content");

  function formatDates(start, end) {
    if (!start && !end) return "";
    if (start && !end) return `${start} – Present`;
    if (!start && end) return end;
    return `${start} – ${end}`;
  }

  function renderEntry(r) {
    const dates = formatDates(r.start_date, r.end_date);
    const bullets = (r.description || "")
      .split(";")
      .map((b) => b.trim())
      .filter(Boolean);

    const header = r.title || r.organization
      ? `
        <div class="resume-entry-header">
          <h3>${r.title || ""}</h3>
          ${dates ? `<span class="resume-entry-dates">${dates}</span>` : ""}
        </div>
        ${r.organization ? `<p class="resume-entry-org">${r.organization}${r.location ? ` &middot; ${r.location}` : ""}</p>` : ""}
      `
      : "";

    const list = bullets.length
      ? `<ul>${bullets.map((b) => `<li>${b}</li>`).join("")}</ul>`
      : "";

    return `<div class="resume-entry">${header}${list}</div>`;
  }

  try {
    const res = await fetch("data/resume.csv");
    const text = await res.text();
    const rows = parseCSV(text).filter(
      (r) => r.title || r.organization || r.description
    );

    if (rows.length === 0) {
      el.innerHTML = `
        <div class="empty-state">
          Nothing here yet. Add rows to <code>data/resume.csv</code> and
          they'll show up here, grouped by section.
        </div>`;
      return;
    }

    const sections = [];
    const bySection = {};
    for (const r of rows) {
      const key = r.section || "Other";
      if (!bySection[key]) {
        bySection[key] = [];
        sections.push(key);
      }
      bySection[key].push(r);
    }

    el.innerHTML = sections
      .map(
        (section) => `
        <section class="resume-section">
          <h2>${section}</h2>
          ${bySection[section].map(renderEntry).join("")}
        </section>`
      )
      .join("");

    window.initScrollGradient && window.initScrollGradient();
  } catch (err) {
    el.innerHTML = `<div class="empty-state">Couldn't load the resume data. If you're previewing this by double-clicking the file, run <code>python3 -m http.server 8000</code> instead — the browser blocks local file loads otherwise.</div>`;
  }
})();
