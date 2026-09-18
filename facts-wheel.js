(function () {
  const FACTS = [
    {
      slug: "pets",
      label: "Pets",
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm7 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM5 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm14 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-7 8c-2.9 0-5.5-1.34-5.5-3.6 0-1.9 1.4-2.9 2.4-3.7.8-.65 1.4-1.1 1.4-1.9a1.7 1.7 0 0 1 3.4 0c0 .8.6 1.25 1.4 1.9 1 .8 2.4 1.8 2.4 3.7 0 2.26-2.6 3.6-5.5 3.6Z"/></svg>',
      text: "I have two white chihuahuas, Pearl and Pippa, and a tabby cat named Cleo.",
      photo: "assets/photos/fact-pets.jpg",
    },
    {
      slug: "soccer",
      label: "Club soccer",
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 7.5 15.5 10l-1.3 4h-4.4l-1.3-4L12 7.5Z" fill="currentColor"/><path d="M12 3v4.5M12 20.5V17M4 9l3.5 1M20 9l-3.5 1M6 17l2.5-2.5M18 17l-2.5-2.5" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>',
      text: "I played club soccer for Colorado School of Mines for all four years of undergrad.",
      photo: "assets/photos/fact-soccer.jpg",
    },
    {
      slug: "hobbies",
      label: "Hobbies",
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><circle cx="12" cy="12" r="2"/></svg>',
      text: "In my free time I play chess, ski, play soccer, read, and work out.",
      photo: "assets/photos/fact-hobbies.jpg",
    },
    {
      slug: "arsenal",
      label: "Arsenal",
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12l1.5 4-2 1.5V21H8.5V8.5l-2-1.5L6 3Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
      text: "My favorite Arsenal player is Bukayo Saka.",
      photo: "assets/photos/fact-arsenal.jpg",
    },
    {
      slug: "cube",
      label: "Rubik's cube",
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4 9.3h16M4 14.7h16M9.3 4v16M14.7 4v16" stroke="currentColor" stroke-width="1.2"/></svg>',
      text: "I can solve a Rubik's cube.",
      photo: "assets/photos/fact-cube.jpg",
    },
    {
      slug: "rocket-league",
      label: "Rocket League",
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10v3a5 5 0 0 1-5 5 5 5 0 0 1-5-5V4Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M7 5H4v1a3 3 0 0 0 3 3M17 5h3v1a3 3 0 0 1-3 3M10 12v3M14 12v3M8 19h8M10 15h4v4h-4v-4Z" stroke="currentColor" stroke-width="1.4" fill="none"/></svg>',
      text: "I'm Grand Champion 3 in Rocket League.",
      photo: "assets/photos/fact-rl.jpg",
    },
    {
      slug: "golf",
      label: "Golf",
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4l11 4.5L6 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><ellipse cx="6" cy="21" rx="4" ry="1.2" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>',
      text: "I started golfing this summer.",
      photo: "assets/photos/fact-golf.jpg",
    },
  ];

  function init() {
    const wheel = document.querySelector("[data-facts-wheel]");
    const ring = document.querySelector("[data-facts-ring]");
    const list = document.querySelector("[data-facts-list]");
    if (!wheel || !ring || !list) return;

    const nameFace = wheel.querySelector('[data-face="name"]');
    const factFace = wheel.querySelector('[data-face="fact"]');
    const factImg = factFace.querySelector(".facts-wheel__photo");
    const factText = factFace.querySelector(".facts-wheel__text");

    ring.innerHTML = FACTS.map(
      (fact, i) => `
      <button type="button" class="facts-wheel__segment" style="--angle: ${
        i * (360 / FACTS.length)
      }deg" data-index="${i}" aria-label="${fact.label}">${fact.icon}</button>`
    ).join("");

    list.innerHTML = FACTS.map(
      (fact) => `
      <li>
        <details class="facts-list__item">
          <summary>${fact.icon}${fact.label}</summary>
          <div class="facts-list__body">
            <img src="${fact.photo}" alt="" onerror="this.parentElement.style.display='none'">
            <p>${fact.text}</p>
          </div>
        </details>
      </li>`
    ).join("");

    function showFact(fact) {
      factImg.style.display = "";
      factImg.src = fact.photo;
      factText.textContent = fact.text;
      nameFace.hidden = true;
      factFace.hidden = false;
    }

    function showName() {
      nameFace.hidden = false;
      factFace.hidden = true;
    }

    ring.querySelectorAll(".facts-wheel__segment").forEach((btn) => {
      const fact = FACTS[Number(btn.dataset.index)];
      btn.addEventListener("mouseenter", () => showFact(fact));
      btn.addEventListener("focus", () => showFact(fact));
      btn.addEventListener("click", () => showFact(fact));
    });

    ring.addEventListener("mouseleave", showName);
    ring.addEventListener("focusout", (e) => {
      if (!ring.contains(e.relatedTarget)) showName();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
