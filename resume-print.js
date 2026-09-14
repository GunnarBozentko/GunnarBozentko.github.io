(async function () {
  const el = document.getElementById("resume-content");

  function formatDate(d) {
    if (!d) return "";
    const monthMatch = d.match(/^(\d{4})-(\d{2})$/);
    if (monthMatch) {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${months[parseInt(monthMatch[2], 10) - 1]} ${monthMatch[1]}`;
    }
    return d;
  }

  function formatDates(start, end) {
    const s = formatDate(start);
    const e = formatDate(end);
    if (!s && !e) return "";
    if (s && !e) return `${s} – Present`;
    if (!s && e) return e;
    return `${s} – ${e}`;
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

  function renderSkillLine(r) {
    const items = (r.description || "")
      .split(";")
      .map((b) => b.trim())
      .filter(Boolean)
      .join(", ");
    return `<p class="skill-line"><strong>${r.title}:</strong> ${items}</p>`;
  }

  try {
    const res = await fetch("data/resume.csv");
    const text = await res.text();
    const rows = parseCSV(text).filter(
      (r) => r.title || r.organization || r.description
    );

    if (rows.length === 0) {
      el.innerHTML = `<div class="empty-state">No resume data yet.</div>`;
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
      .map((section) => {
        const isSkills = section === "Skills";
        const body = isSkills
          ? bySection[section].map(renderSkillLine).join("")
          : bySection[section].map(renderEntry).join("");
        return `
        <section class="resume-section">
          <h2>${section}</h2>
          ${body}
        </section>`;
      })
      .join("");
  } catch (err) {
    el.innerHTML = `<div class="empty-state">Couldn't load the resume data. If you're previewing this by double-clicking the file, run <code>python3 -m http.server 8000</code> instead.</div>`;
  }
})();
