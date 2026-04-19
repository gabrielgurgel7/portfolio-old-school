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

const loginModal = document.getElementById("login");
const loginLink = document.getElementById("login-link");
const modalProject = document.getElementById("modal-create-project");

// FUNÇÃO ABRIR LOGIN
loginLink.addEventListener("click", (e) => {
  e.preventDefault();
  loginModal.showModal();
});

// FECHA QUALQUER DIALOG AO CLICAR NO BACKDROP
document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });
});

// FUNÇÃO ABRIR GERENCIADOR DE PROJETOS
document
  .getElementById("open-modal-project")
  ?.addEventListener("click", (e) => {
    e.preventDefault();
    modalProject.showModal();
  });

const user = document.querySelector("#login-user");
const password = document.querySelector("#login-password");
const enterButton = document.querySelector(".login-button");
const manageProjects = document.querySelector("#manage-projects");

// FUNÇÃO LOGIN
enterButton.addEventListener("click", (e) => {
  e.preventDefault();

  const userName = user.value.trim();
  const userPassword = password.value.trim();

  if (!userName && !userPassword) {
    alert("Erro: preencha os campos obrigatórios.");
  } else if (!userName) {
    alert("Nome é obrigatório.");
  } else if (!userPassword) {
    alert("Senha é obrigatória.");
  } else if (userName.toLowerCase() === "gab" && userPassword === "123") {
    manageProjects.classList.remove("hidden");
    perfilOnline(userName);
    loginModal.close();
  } else {
    alert("Usuário ou senha incorretos.");
  }
});

const containerPerfil = document.querySelector(".container-perfil");
const userStatus = document.querySelector(".user-status");

// FUNÇÃO PERFIL ONLINE
const perfilOnline = (userName) => {
  const firstLetter = userName[0].toUpperCase();
  const letter = document.createElement("p");
  letter.innerHTML = firstLetter;
  containerPerfil.appendChild(letter);
  userStatus.classList.add("online-user");
};

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

// ─── BANCO DE DADOS: projects.json ───────────────────────────────────────────
//
// Os projetos vivem em data/projects.json no repositório.
//
// FLUXO PARA ADICIONAR UM PROJETO:
//   1. Faça login e abra o modal "Criar projeto"
//   2. Preencha e clique em "Criar projeto"
//   3. O card aparece na página E o arquivo projects.json atualizado
//      é baixado automaticamente para o seu computador
//   4. Substitua data/projects.json no repositório pelo arquivo baixado
//   5. git add data/projects.json && git commit -m "add project" && git push
//   6. Pronto — o projeto aparece no site publicado

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

// FUNÇÃO CRIAR PROJETO
createProjectButton.addEventListener("click", (e) => {
  e.preventDefault();

  const title = projectTitle.value;
  const date = projectDate.value;
  const description = descripitonProject.value;
  const technologies = projectTechnologies.value;
  const link = projectLink.value;
  const gitHub = gitHubLink.value;
  const file = projectImage.files[0];

  const handleCard = async (imageSrc) => {
    const project = {
      title,
      date,
      description,
      technologies,
      link,
      gitHub,
      imageSrc,
    };

    createCard(project);
    await downloadJSON(project);

    document.querySelector("#create-project-form").reset();
    modalProject.close();

    showDownloadNotice();
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => handleCard(e.target.result);
    reader.readAsDataURL(file);
  } else {
    handleCard("");
  }
});

// AVISO PÓS-DOWNLOAD — lembra o usuário de fazer push
const showDownloadNotice = () => {
  if (document.getElementById("json-notice")) return;

  const notice = document.createElement("div");
  notice.id = "json-notice";
  notice.innerHTML = `
    <strong>projects.json baixado.</strong>
    Substitua <code>data/projects.json</code> no repositório e faça push para publicar.
    <button id="json-notice-close" aria-label="Fechar aviso">✕</button>
  `;
  document.body.appendChild(notice);

  document.getElementById("json-notice-close").addEventListener("click", () => {
    notice.remove();
  });
};

renderProjects();
lucide.createIcons();
