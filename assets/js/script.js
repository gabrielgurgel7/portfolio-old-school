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

const toggleThemeBtn = document.querySelector("#theme-toggle");
const body = document.body;

// FUNÇÃO ALTERNAR TEMA
toggleThemeBtn.addEventListener("click", () => {
  body.classList.toggle("dark-theme");
  const isDark = body.classList.contains("dark-theme");
  toggleThemeBtn.innerHTML = isDark
    ? '<i id="theme-icon" data-lucide="sun"></i>'
    : '<i id="theme-icon" data-lucide="moon"></i>';
  lucide.createIcons();
});

const DATA_PATH = "data/projects.json";

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

// Gera e baixa o JSON com o novo projeto já incluído
const downloadJSON = async (newProject) => {
  const projects = await fetchProjects();
  projects.push(newProject);

  const blob = new Blob([JSON.stringify(projects, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "projects.json";
  a.click();
  URL.revokeObjectURL(url);
};

// FUNÇÃO CRIAR CARD
const createCard = (data) => {
  const { title, link, gitHub, imageSrc, technologies } = data;

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
      <div class="elipse-container glass flex-center circle">
        <a
          class="explorer-link"
          href="${link}"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i data-lucide="arrow-up-right"></i>
        </a>
      </div>
    </header>
    <main>
      <div class="img-container-project">
        <img src="${imageSrc}" alt="${title}">
      </div>
    </main>
    <footer class="project-footer">
      <ul class="tech-list">${techItems}</ul>
      <div class="project-links flex-center">
        <div class="interactive-btns">
        <button class="joy-button circle">
          <i id="theme-icon" data-lucide="thumbs-up"></i>
        </button>
        <button class="joy-button">
          <i id="theme-icon" data-lucide="message-circle"></i>
        </button>
      </div>
      <div class="explore-project">
        <a
          class="link-project button-link flex-center"
          href="${gitHub}"
          target="_blank"
          rel="noopener noreferrer"
          >GitHub</a
        >
      </div>
    </footer>
  `;

  document.getElementById("container-projects").appendChild(card);

  if (imageSrc) {
    const img = card.querySelector("img");
    getDominantColor(img).then((color) => {
      const header = card.querySelector(".project-header");
      header.style.backgroundColor = color;
      // opcional: ajusta a cor do texto para contrastar
      header.style.color = "#ffffff";
    });
  }

  lucide.createIcons();
};

// CARREGA E RENDERIZA OS PROJETOS DO JSON
const renderProjects = async () => {
  const projects = await fetchProjects();
  projects.forEach((project) => createCard(project));
};

// EXTRAI COR DOMINANTE DE UMA IMAGEM
const getDominantColor = (imgElement) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 50; // escala pequena = mais rápido
    canvas.height = 50;

    const draw = () => {
      ctx.drawImage(imgElement, 0, 0, 50, 50);
      const data = ctx.getImageData(0, 0, 50, 50).data;

      const colorMap = {};
      for (let i = 0; i < data.length; i += 4) {
        const r = Math.round(data[i] / 32) * 32;
        const g = Math.round(data[i + 1] / 32) * 32;
        const b = Math.round(data[i + 2] / 32) * 32;
        const brightness = (r + g + b) / 3;

        // Ignora cores muito claras ou muito escuras
        if (brightness < 30 || brightness > 220) continue;

        const key = `${r},${g},${b}`;
        colorMap[key] = (colorMap[key] || 0) + 1;
      }

      const dominant = Object.entries(colorMap).sort((a, b) => b[1] - a[1])[0];

      resolve(dominant ? `rgb(${dominant[0]})` : "#1d1d1d");
    };

    if (imgElement.complete) {
      draw();
    } else {
      imgElement.onload = draw;
      imgElement.onerror = () => resolve("#1d1d1d");
    }
  });
};

// INPUTS DO FORMULÁRIO
const projectTitle = document.querySelector("#project-title");
const projectDate = document.querySelector("#creation-date");
const descripitonProject = document.querySelector("#description");
const projectTechnologies = document.querySelector("#technologies");
const projectImage = document.querySelector("#project-image");
const projectLink = document.querySelector("#link-project");
const gitHubLink = document.querySelector("#link-github");
const createProjectButton = document.querySelector("#create-project-btn");

renderProjects();
lucide.createIcons();
