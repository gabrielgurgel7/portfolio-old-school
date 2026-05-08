const toggleThemeBtn = document.querySelector("#theme-toggle");
const body = document.body;
const DATA_PATH = "data/projects.json";

// FUNÇÃO ALTERNAR TEMA
toggleThemeBtn.addEventListener("click", () => {
  body.classList.toggle("light-theme");
  const isLight = body.classList.contains("light-theme");
  toggleThemeBtn.innerHTML = isLight
    ? '<i id="theme-icon" data-lucide="moon"></i>'
    : '<i id="theme-icon" data-lucide="sun"></i>';
  lucide.createIcons();
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
          class="cta-btn-link cta-btn-projects flex-center"
          href="${gitHub}"
          target="_blank"
          rel="noopener noreferrer"
          >GitHub</a
        >
        <a
          href="${link}"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="cta-btn-link primary-button flex-center">
            <i data-lucide="arrow-up-right"></i>
          </div>
        </a>
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

renderProjects();
lucide.createIcons();
