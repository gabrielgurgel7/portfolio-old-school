const toggleThemeBtn = document.querySelector("#theme-toggle");
const body = document.body;
const DATA_PATH = "data/projects.json";
const clickSound = new Audio("assets/sounds/single_click_keyboard.mp3");

// FUNÇÃO ALTERNAR TEMA
toggleThemeBtn.addEventListener("click", () => {
  toggleThemeBtn.addEventListener("click", () => {
    body.classList.toggle("light-theme");
    const isLight = body.classList.contains("light-theme");
    toggleThemeBtn.setAttribute(
      "aria-label",
      isLight ? "Ativar tema escuro" : "Ativar tema claro",
    );
    toggleThemeBtn.innerHTML = isLight
      ? '<i data-lucide="moon"></i>'
      : '<i data-lucide="sun"></i>';
    lucide.createIcons();
  });
});

// CARREGA E RENDERIZA OS PROJETOS DO JSON
const renderProjects = async () => {
  const projects = await fetchProjects();
  projects.forEach((project) => createCard(project));
};

// Lê o JSON do servidor (retorna [] se ainda não existir)
const fetchProjects = async () => {
  try {
    const res = await fetch(DATA_PATH);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
};

// FUNÇÃO CRIAR CARD
const createCard = (data) => {
  const { title, link, gitHub, imageSrc, technologies, description } = data;

  const card = document.createElement("article");
  card.classList.add("project-card");

  const techItems = technologies
    ? technologies
        .split(",")
        .map(
          (t) =>
            `<li><p class="texto-blend"><small>${t.trim()}</small></p></li>`,
        )
        .join("")
    : "";

  card.innerHTML = `
    <header class="project-header">
      <h3>${title}</h3>  
    </header>
    <main>
      <div class="img-container-project">
        <img src="${imageSrc}" alt="${title}">
      </div>
    </main>
    <footer class="project-footer">
      <ul class="tech-list">${techItems}</ul>
      <p><small>${description}</small></p>
      <div class="explore-project">
        <a
          class="cta-btn-link cta-btn-projects btn-sound flex-center"
          href="${gitHub}"
          target="_blank"
          rel="noopener noreferrer"
          >GitHub</a
        >
        <a class="btn-sound" href="${link}" target="_blank" rel="noopener noreferrer" aria-label="Ver projeto">
          <div class="cta-btn-link primary-button flex-center">
            <i data-lucide="arrow-up-right"></i>
          </div>
        </a>
      </div>
    </footer>
  `;

  document.getElementById("container-projects").appendChild(card);
  lucide.createIcons();
};

// FUNÇÃO FECHAR (GLOBAL)
const closeTab = (e) => {
  const closeable = e.currentTarget.closest(".closeable");
  const dialog = e.currentTarget.closest("dialog");

  if (dialog) {
    dialog.close();
  } else if (closeable) {
    closeable.classList.add("hidden");
  }
};

// FUNÇÃO BOTÃO FECHAR (GLOBAL)
document.querySelectorAll(".close-button").forEach((closeButton) => {
  closeButton.addEventListener("click", (e) => {
    e.preventDefault();
    closeTab(e);
  });
});

// FECHA QUALQUER DIALOG AO CLICAR NO BACKDROP
document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });
});

// FUNÇÃO AUDIO DE "CLICK" NOS BOTÕES
document.addEventListener(
  "click",
  (e) => {
    if (e.target.closest(".btn-sound")) {
      clickSound.play();
    }
  },
  true,
);

renderProjects();
lucide.createIcons();
