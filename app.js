(() => {
  "use strict";

  const modules = Array.isArray(window.MODULES) ? window.MODULES : [];
  const content = window.PLATFORM_CONTENT || {};
  const main = document.querySelector("#main-content");
  const glossary = content.glossary || {};
  const byId = new Map(modules.map((module) => [module.id, module]));
  const STORAGE = {
    logs: "tableroArduino.studentLogs.v1",
    projects: "tableroArduino.projects.v1",
    activities: "tableroArduino.teacherActivities.v1",
    rubric: "tableroArduino.rubric.v1",
    observations: "tableroArduino.observations.v1",
    theme: "tableroArduino.theme.v1",
    builder: "tableroArduino.builderSelection.v1"
  };
  const state = {
    builderSelection: new Set(readStorage(STORAGE.builder, [])),
    catalog: {query: "", category: "", signal: "", difficulty: ""}
  };
  const rootUrl = new URL(document.querySelector("base")?.getAttribute("href") || "./", location.href);

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value = "") => String(value).replace(/[&<>"]/g, (char) => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[char]));
  const slug = (value = "") => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const icon = (name) => `<svg aria-hidden="true"><use href="#icon-${esc(name)}"></use></svg>`;
  const unique = (values) => [...new Set(values.filter(Boolean))];

  function readStorage(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    updateProgress();
  }

  function formatDate(value) {
    if (!value) return "[PENDIENTE]";
    return new Intl.DateTimeFormat("es-CO", {dateStyle: "medium"}).format(new Date(`${value}T12:00:00`));
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function toast(message) {
    const element = $("#toast");
    element.textContent = message;
    element.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => element.classList.remove("show"), 2400);
  }

  function downloadText(filename, text, type = "text/plain;charset=utf-8") {
    const url = URL.createObjectURL(new Blob([text], {type}));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast("Código copiado al portapapeles.");
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      toast("Código copiado al portapapeles.");
    }
  }

  function termify(text) {
    let safe = esc(text);
    const terms = Object.keys(glossary).sort((a, b) => b.length - a.length);
    if (!terms.length) return safe;
    const pattern = new RegExp(`\\b(${terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "g");
    return safe.replace(pattern, (match) => `<button class="term-button" data-term="${esc(match)}">${esc(match)}</button>`);
  }

  function routeInfo() {
    if (location.hash.startsWith("#/")) {
      const [path, query = ""] = location.hash.slice(2).split("?");
      return {parts: path.split("/").filter(Boolean), query: new URLSearchParams(query)};
    }
    const parts = location.pathname.split("/").filter(Boolean);
    const moduleIndex = parts.lastIndexOf("modulos");
    if (moduleIndex >= 0 && parts[moduleIndex + 1]) return {parts: ["modulos", parts[moduleIndex + 1]], query: new URLSearchParams(location.search)};
    return {parts: ["inicio"], query: new URLSearchParams(location.search)};
  }

  function moduleHref(id) {
    return `#/modulos/${encodeURIComponent(id)}`;
  }

  function permanentModuleUrl(id) {
    if (location.protocol === "file:") return new URL(`index.html#/modulos/${id}`, rootUrl).href;
    return new URL(`modulos/${id}/`, rootUrl).href;
  }

  function pageShell({eyebrow = "", title, lede = "", body, className = ""}) {
    return `<div class="page ${className}">
      <header class="page-head">
        ${eyebrow ? `<span class="eyebrow">${esc(eyebrow)}</span>` : ""}
        <h1>${esc(title)}</h1>
        ${lede ? `<p class="lede">${esc(lede)}</p>` : ""}
      </header>
      ${body}
    </div>`;
  }

  function moduleCard(module) {
    const categories = module.category.slice(0, 2).map((item) => `<span class="tag">${esc(item)}</span>`).join("");
    return `<article class="module-card">
      <a class="module-image" href="${moduleHref(module.id)}" aria-label="Abrir ficha de ${esc(module.name)}">
        <img src="${esc(module.imageUrl)}" alt="Imagen del ${esc(module.name)} incluida en la guía" loading="lazy">
        <span class="difficulty">${esc(module.difficulty)}</span>
      </a>
      <div class="module-body">
        <div><span class="eyebrow">${esc(module.model)}</span><h3><a href="${moduleHref(module.id)}">${esc(module.name)}</a></h3></div>
        <p>${esc(module.purpose)}</p>
        <div class="tag-row">${categories}<span class="tag">${esc(module.signalType)}</span></div>
        <a class="button secondary small" href="${moduleHref(module.id)}">Ver guía completa</a>
      </div>
    </article>`;
  }

  function renderHome() {
    const p = content.project;
    const methodology = content.methodology.map((item) => `<article class="method-card"><span class="step">${item.step}</span><div><h3>${esc(item.name)}</h3><p>${esc(item.text)}</p></div></article>`).join("");
    const reviewed = modules.filter((module) => module.codeStatus === "revisado").length;
    const features = [
      ["modulos", "Explorar módulos", "Busca por nombre, señal, pin, protocolo o dificultad.", "analog"],
      ["constructor", "Construir un proyecto", "Combina módulos y detecta conflictos antes de conectar.", "builder"],
      ["bitacora", "Registrar el proceso", "Guarda hipótesis, intentos, errores, cambios y reflexiones.", "code"],
      ["docente", "Preparar una clase", "Configura actividades, observables y rúbricas editables.", "safety"]
    ].map(([route, title, text, iconName]) => `<a class="feature-card" href="#/${route}"><span class="icon-wrap">${icon(iconName)}</span><h3>${title}</h3><p>${text}</p><span class="text-link">Abrir →</span></a>`).join("");
    main.innerHTML = `<div class="page">
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">Plataforma web educativa · trabajo de grado</span>
          <h1>${esc(p.name)} <span>${esc(p.subtitle)}</span></h1>
          <p class="lede">${esc(p.description)}</p>
          <div class="hero-actions">



<button
  class="button button-video"
  type="button"
  data-scroll-target="video-intro">
  <svg aria-hidden="true">
    <use href="#icon-video"></use>
  </svg>
  Ver video introductorio
</button>



            <a class="button" href="#/bitacora">Soy estudiante</a>
            <a class="button secondary" href="#/docente">Soy docente</a>
            <a class="button ghost" href="#/modulos">Explorar módulos</a>
            <a class="button ghost" href="#/constructor">Construir un proyecto</a>
            <a class="button ghost" href="#/primeros-pasos">Primeros pasos</a>
            <a class="button ghost" href="downloads/GUIA%20PARA%20LA%20WEB.docx" download>${icon("download")} Descargar guía</a>
          </div>
        </div>
        <figure class="hero-visual">
          <img src="${esc(p.heroImage)}" alt="Vista principal del tablero modular Arduino proporcionada en el anexo">
          <figcaption class="hero-note"><span>Imagen del anexo almacenada localmente</span><strong>Licencia ${esc(p.imageLicenseStatus)}</strong></figcaption>
        </figure>
      </section>




<section id="video-intro" class="video-intro">
  <div class="video-intro__contenido">

    <span class="video-intro__etiqueta">COMIENZA AQUÍ</span>

    <h2>Conoce el tablero y la plataforma</h2>

    <p>
      Observa este recorrido introductorio para conocer el tablero modular,
      la organización de sus componentes y las principales herramientas
      disponibles en la plataforma.
    </p>

    <div class="video-intro__marco">
      <iframe
        src="https://www.youtube-nocookie.com/embed/k_s3V2s-Aig"
        title="Video introductorio del Tablero Modular Arduino"
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen>
      </iframe>
    </div>

    <div class="video-intro__informacion">
      <span>Duración aproximada: 15 minutos</span>

      <a
        href="https://youtu.be/k_s3V2s-Aig"
        target="_blank"
        rel="noopener noreferrer">
        Abrir en YouTube
      </a>
    </div>

    <details class="video-intro__resumen">
      <summary>¿Qué encontrarás en este video?</summary>

      <ul>
        <li>Presentación del tablero modular.</li>
        <li>Organización del Arduino, la protoboard y los módulos.</li>
        <li>Recorrido por las secciones de la plataforma.</li>
        <li>Forma de consultar conexiones, códigos y retos.</li>
        <li>Recomendaciones para comenzar a trabajar.</li>
      </ul>
    </details>

  </div>
</section>




      <section class="section" aria-labelledby="method-title"><div class="section-head"><div><span class="eyebrow">Metodología</span><h2 id="method-title">Siete acciones para aprender creando</h2></div><p>El código es un punto de partida. La evidencia está en lo que predices, pruebas, corriges y explicas.</p></div><div class="method-grid">${methodology}</div></section>
      <section class="section"><div class="stat-grid"><article class="stat-card"><strong>${modules.length}</strong><span>componentes con ficha dinámica</span></article><article class="stat-card"><strong>${reviewed}</strong><span>ejemplos revisados, probados físicamente</span></article><article class="stat-card"><strong>100%</strong><span>de imágenes del anexo disponibles localmente</span></article></div></section>
      <section class="section"><div class="section-head"><div><span class="eyebrow">Rutas de uso</span><h2>Empieza según tu objetivo</h2></div></div><div class="feature-grid">${features}</div></section>
      <section class="section callout warning"><span>${icon("safety")}</span><div><h3>Antes de conectar</h3><p>Consulta la página de seguridad. Los relés con corriente alterna, el láser, el interruptor de mercurio y las pruebas con llama requieren supervisión docente.</p><a class="text-link" href="#/seguridad">Revisar seguridad →</a></div></section>
    </div>`;
  }

  function renderFirstSteps() {
    const steps = [
      ["Revisa seguridad", "Identifica el nivel de riesgo y no energices mientras cambias cables."],
      ["Conoce Arduino y la protoboard", "Ubica 5V, 3.3V, GND, A0–A5, D0–D13, RX/TX y SDA/SCL."],
      ["Elige un módulo sencillo", "Empieza con una entrada o salida de bajo riesgo y consulta todos sus pines."],
      ["Predice", "Escribe qué debería ocurrir antes de cargar el código."],
      ["Conecta cable por cable", "Justifica alimentación, tierra y señal. Compara el pin físico con el declarado."],
      ["Prueba y registra", "Observa el resultado, anota el error y cambia una sola variable."],
      ["Explica", "Describe la entrada, el procesamiento, la salida y la evidencia que respalda tu decisión."]
    ];
    const body = `<div class="timeline">${steps.map((item, index) => `<article class="timeline-item"><span class="timeline-marker">${index + 1}</span><div class="timeline-copy"><h3>${esc(item[0])}</h3><p>${esc(item[1])}</p></div></article>`).join("")}</div>
      <section class="section feature-grid"><a class="feature-card" href="#/seguridad"><span class="icon-wrap">${icon("safety")}</span><h3>Seguridad</h3><p>Revisa advertencias antes de usar el tablero.</p></a><a class="feature-card" href="#/conceptos"><span class="icon-wrap">${icon("analog")}</span><h3>Conceptos básicos</h3><p>Aprende el vocabulario de pines y señales.</p></a><a class="feature-card" href="#/modulos"><span class="icon-wrap">${icon("board")}</span><h3>Primer módulo</h3><p>Elige una ficha de nivel principiante.</p></a><a class="feature-card" href="#/bitacora"><span class="icon-wrap">${icon("code")}</span><h3>Bitácora</h3><p>Documenta hipótesis, intentos y resultados.</p></a></section>`;
    main.innerHTML = pageShell({eyebrow: "Ruta inicial", title: "Primeros pasos", lede: "Una secuencia breve para pasar de reconocer el tablero a explicar una prueba con evidencia.", body, className: "narrow"});
  }

  function renderBoard() {
    const categories = [
      ["Sensores analógicos", "ENTRADA ANALÓGICA"], ["Sensores digitales", "ENTRADA DIGITAL"],
      ["Sensores híbridos", "ENTRADA HÍBRIDA AO/DO"], ["Actuadores", "ACTUADOR"],
      ["Visualización", "VISUALIZACIÓN"], ["Comunicación", "COMUNICACIÓN"]
    ];
    main.innerHTML = pageShell({
      eyebrow: "Mapa físico y funcional",
      title: "Conoce el tablero",
      lede: "El tablero reúne un controlador, una zona de conexión y módulos de entrada, salida, visualización y comunicación. La clasificación no reduce todo a analógico o digital.",
      body: `<figure class="hero-visual"><img src="${esc(content.project.heroImage)}" alt="Vista principal del tablero modular suministrada en el anexo"><figcaption class="hero-note"><span>Imagen principal del anexo</span><strong>Licencia VERIFICADA(imagen del autor)</strong></figcaption></figure>
      <section class="section"><div class="section-head"><div><span class="eyebrow">Elementos base</span><h2>Control y conexiones</h2></div></div><div class="module-grid">${[byId.get("arduino-uno"), byId.get("protoboard")].map(moduleCard).join("")}</div></section>
      <section class="section"><div class="section-head"><div><span class="eyebrow">Clasificación funcional</span><h2>Explora por el papel del componente</h2></div></div><div class="feature-grid">${categories.map(([name, category]) => `<a class="feature-card" href="#/modulos?category=${encodeURIComponent(category)}"><span class="icon-wrap">${icon(category.includes("COMUNICACIÓN") ? "comms" : category.includes("ACTUADOR") || category.includes("VISUAL") ? "output" : "input")}</span><h3>${name}</h3><p>${modules.filter((module) => module.category.includes(category)).length} fichas relacionadas.</p></a>`).join("")}</div></section>
      <section class="section callout"><span>${icon("board")}</span><div><h3>Una guía que se lee y se prueba</h3><p>Usa la imagen para ubicar el módulo y la ficha para justificar cada pin, ejecutar una prueba mínima y registrar el proceso.</p><a class="button secondary small" href="#/primeros-pasos">Comenzar paso a paso</a></div></section>`
    });
  }

  function renderConcepts() {
  const cards = content.concepts.map((item) => `
    <article class="concept-card" id="concept-${slug(item.term)}">
      <h3>${esc(item.term)}</h3>
      <p>${termify(item.simple)}</p>

      <details>
        <summary>Quiero saber más</summary>
        <p>${termify(item.detail)}</p>
      </details>
    </article>
  `).join("");

  main.innerHTML = pageShell({
    eyebrow: "Base conceptual",
    title: "Arduino y conceptos eléctricos",
    lede: "Definiciones para principiantes con una explicación técnica desplegable cuando necesitas profundizar.",

    body: `
      <section
        class="section panel arduino-video-section"
        aria-labelledby="arduino-video-title">

        <div class="section-head">
          <div>
            <span class="eyebrow">VIDEO EXPLICATIVO</span>
            <h2 id="arduino-video-title">
              Conoce la placa Arduino UNO
            </h2>
          </div>
        </div>

        <p class="arduino-video-description">
          En este video conocerás las principales partes de la placa Arduino
          UNO, sus pines de alimentación, entradas analógicas, pines digitales,
          conexiones especiales y una prueba práctica.
        </p>

        <div class="arduino-video-frame">
          <iframe
            src="https://www.youtube-nocookie.com/embed/uc2vMSrBtgs"
            title="Explicación general de la placa Arduino UNO"
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen>
          </iframe>
        </div>

        <div class="arduino-video-footer">
          <span>Contenido: explicación y prueba de Arduino UNO</span>

          <a
            class="text-link"
            href="https://youtu.be/uc2vMSrBtgs"
            target="_blank"
            rel="noopener noreferrer">
            Abrir en YouTube →
          </a>
        </div>

        <div class="video-chapters" aria-label="Capítulos del video">
          <div>
            <strong>00:11</strong>
            <span>Pines de alimentación</span>
          </div>

          <div>
            <strong>01:52</strong>
            <span>Pines analógicos</span>
          </div>

          <div>
            <strong>04:39</strong>
            <span>Pines digitales</span>
          </div>

          <div>
            <strong>09:18</strong>
            <span>Pines especiales, USB y entrada de voltaje</span>
          </div>

          <div>
            <strong>10:46</strong>
            <span>Prueba práctica de conexión</span>
          </div>
        </div>

      </section>

      <section class="section" aria-labelledby="conceptos-title">
        <div class="section-head">
          <div>
            <span class="eyebrow">CONCEPTOS FUNDAMENTALES</span>
            <h2 id="conceptos-title">Consulta cada concepto</h2>
          </div>
        </div>

        <div class="concept-grid">
          ${cards}
        </div>
      </section>
    `
  });
}

  function renderCatalog(queryParams = new URLSearchParams()) {
    state.catalog.query = queryParams.get("q") || state.catalog.query || "";
    state.catalog.category = queryParams.get("category") || state.catalog.category || "";
    const categories = unique(modules.flatMap((module) => module.category)).sort();
    const difficulties = unique(modules.map((module) => module.difficulty)).sort();
    main.innerHTML = pageShell({
      eyebrow: "Inventario dinámico",
      title: "Explorar módulos",
      lede: "Los 46 componentes del anexo se generan desde un único modelo de datos. Una misma ficha puede pertenecer a varias categorías.",
      body: `<div class="toolbar" aria-label="Filtros del catálogo">
        <label class="field"><span>Buscar</span><span class="search-input">${icon("search")}<input id="catalog-search" type="search" value="${esc(state.catalog.query)}" placeholder="Nombre, KY-018, A0, temperatura…"></span></label>
        <div class="filter-row">
          <label class="field"><span>Categoría</span><select id="filter-category"><option value="">Todas</option>${categories.map((item) => `<option ${state.catalog.category === item ? "selected" : ""}>${esc(item)}</option>`).join("")}</select></label>
          <label class="field"><span>Señal / protocolo</span><select id="filter-signal"><option value="">Todas</option>${["Analógico", "Digital", "I2C", "Serial", "PWM"].map((item) => `<option ${state.catalog.signal === item ? "selected" : ""}>${item}</option>`).join("")}</select></label>
          <label class="field"><span>Dificultad</span><select id="filter-difficulty"><option value="">Todas</option>${difficulties.map((item) => `<option ${state.catalog.difficulty === item ? "selected" : ""}>${esc(item)}</option>`).join("")}</select></label>
        </div>
      </div>
      <div class="results-summary"><span id="catalog-count"></span><button class="button ghost small" id="clear-filters">Limpiar filtros</button></div>
      <div class="module-grid" id="catalog-grid"></div>`
    });
    const update = () => {
      const needle = state.catalog.query.trim().toLocaleLowerCase("es");
      const filtered = modules.filter((module) => {
        const haystack = [module.name, module.model, module.signalType, module.difficulty, module.voltage, module.purpose, ...module.category, ...module.pins.flatMap((pin) => [pin.pin, pin.connectTo, pin.meaning])].join(" ").toLocaleLowerCase("es");
        return (!needle || haystack.includes(needle)) && (!state.catalog.category || module.category.includes(state.catalog.category)) && (!state.catalog.signal || haystack.includes(state.catalog.signal.toLocaleLowerCase("es"))) && (!state.catalog.difficulty || module.difficulty === state.catalog.difficulty);
      });
      $("#catalog-count").textContent = `${filtered.length} de ${modules.length} componentes`;
      $("#catalog-grid").innerHTML = filtered.length ? filtered.map(moduleCard).join("") : `<div class="empty-state"><h3>No encontramos coincidencias</h3><p>Prueba otro nombre, pin, categoría o protocolo.</p></div>`;
    };
    $("#catalog-search").addEventListener("input", (event) => { state.catalog.query = event.target.value; update(); });
    $("#filter-category").addEventListener("change", (event) => { state.catalog.category = event.target.value; update(); });
    $("#filter-signal").addEventListener("change", (event) => { state.catalog.signal = event.target.value; update(); });
    $("#filter-difficulty").addEventListener("change", (event) => { state.catalog.difficulty = event.target.value; update(); });
    $("#clear-filters").addEventListener("click", () => { state.catalog = {query: "", category: "", signal: "", difficulty: ""}; renderCatalog(); });
    update();
  }

  function sourceMarkup(module) {
    const sourceLink = module.sourceUrl.startsWith("http") ? `<a href="${esc(module.sourceUrl)}" target="_blank" rel="noopener">Fuente de la imagen</a>` : `<span>[PENDIENTE]</span>`;
    return `<div class="source-box"><dl>
      <dt>Imagen mostrada</dt><dd><a href="${esc(module.originalImageUrl)}" target="_blank" rel="noopener">URL del recurso visual del anexo</a></dd>
      <dt>Página original</dt><dd>${sourceLink}</dd>
      <dt>Título</dt><dd>${esc(module.sourceTitle)}</dd><dt>Autor</dt><dd>${esc(module.sourceAuthor)}</dd>
      <dt>Licencia</dt><dd>${esc(module.sourceLicense)}</dd><dt>Estado</dt><dd><span class="status-chip warning">${esc(module.licenseStatus)}</span></dd>
      <dt>Acceso</dt><dd>${esc(module.accessDate)}</dd>
    </dl></div>`;
  }



  function videoMarkup(module) {
  const video = module.video || {};

  // Muestra el aviso mientras no exista un video.
  if (video.status !== "disponible" || !video.src) {
    return `
      <div
        class="video-placeholder"
        data-video-status="pendiente"
        data-video-src="">

        <p>Video explicativo pendiente de anexar.</p>

        <p>
          Aquí se incorporará posteriormente el video de conexión,
          programación y prueba del módulo.
        </p>
      </div>
    `;
  }

  // Reproduce videos MP4 almacenados localmente.
  const isLocalVideo =
    video.type === "mp4" ||
    /\.mp4(?:$|\?)/i.test(video.src);

  if (isLocalVideo) {
    return `
      <div
        class="video-player"
        data-video-status="disponible"
        data-video-src="${esc(video.src)}">

        <video controls preload="metadata">
          <source
            src="${esc(video.src)}"
            type="video/mp4">

          ${
            video.subtitles
              ? `
                <track
                  kind="subtitles"
                  src="${esc(video.subtitles)}"
                  srclang="es"
                  label="Español"
                  default>
              `
              : ""
          }

          Tu navegador no puede reproducir este video.
        </video>
      </div>
    `;
  }

  // Extrae automáticamente el ID de enlaces de YouTube.
  const youtubeId = video.src.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/i
  )?.[1];

  const embed = youtubeId
    ? `https://www.youtube-nocookie.com/embed/${youtubeId}`
    : video.src;

  // Muestra el video de YouTube dentro de la plataforma.
  return `
    <div
      class="video-player"
      data-video-status="disponible"
      data-video-src="${esc(video.src)}">

      <iframe
        src="${esc(embed)}"
        title="Video explicativo de ${esc(module.name)}"
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen>
      </iframe>

    </div>
  `;
}

  function renderModule(moduleId) {
    const module = byId.get(moduleId);
    if (!module) return renderNotFound();
    document.title = `${module.name} · Tablero Modular Arduino`;
    const pinRows = module.pins.map((pin) => `<tr><td class="pin-name">${esc(pin.pin)}</td><td>${esc(pin.meaning)}</td><td>${esc(pin.type)}</td><td><code>${esc(pin.connectTo)}</code></td><td>${termify(pin.explanation)}</td></tr>`).join("");
    const connectionSteps = module.arduinoConnections.map((item, index) => `<li><strong>Cable ${index + 1}: ${esc(item.from)} → ${esc(item.to)}</strong><br><span class="muted">${termify(item.why)}</span></li>`).join("");
    const libraries = module.libraries.length ? module.libraries.map((item) => `<li><strong>${esc(item.name)}</strong>: ${esc(item.install)}</li>`).join("") : `<li>No se indica una librería adicional para este ejemplo.</li>`;
    const troubles = module.troubleshooting.map((item) => `<article class="trouble-card"><h3>${esc(item.problem)}</h3><dl><dt>Posible causa</dt><dd>${esc(item.possibleCause)}</dd><dt>Cómo comprobarlo</dt><dd>${esc(item.check)}</dd><dt>Solución</dt><dd>${esc(item.solution)}</dd></dl></article>`).join("");
    const challenges = module.challenges.map((item) => `<article class="challenge-card"><span class="challenge-number">RETO ${item.level} · ${esc(item.type)}</span><p>${esc(item.prompt)}</p>${item.hints ? `<details><summary>Ver pistas progresivas</summary><ol>${item.hints.map((hint) => `<li>${esc(hint)}</li>`).join("")}</ol></details>` : ""}</article>`).join("");
    const codeStatusClass = module.codeStatus === "revisado" ? "reviewed" : "pending";
    const codeStatusText = module.codeStatus === "revisado" ? "REVISADO · PROBADO FÍSICAMENTE" : "POR VALIDAR";
    const inconsistencies = module.inconsistencies.length ? `<div class="callout danger"><span>⚠</span><div><h3>Información pendiente de validación técnica</h3><ul>${module.inconsistencies.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></div></div>` : "";
    const related = module.relatedModules.map((id) => byId.get(id)).filter(Boolean).map(moduleCard).join("");
    const safetyClass = module.safety.level.includes("SUPERVISIÓN") ? "danger" : module.safety.level === "PRECAUCIÓN" ? "warning" : "";
    main.innerHTML = `<div class="page">
      <nav class="breadcrumbs" aria-label="Migas de pan"><a href="#/inicio">Inicio</a><span>›</span><a href="#/modulos">Módulos</a><span>›</span><span aria-current="page">${esc(module.name)}</span></nav>
      <article>
        <header class="module-hero">
          <div class="module-hero-image"><img src="${esc(module.imageUrl)}" alt="Diagrama o imagen del ${esc(module.name)} suministrada en el anexo"></div>
          <div class="module-hero-copy">
            <span class="eyebrow">${esc(module.model)}</span><h1>${esc(module.name)}</h1><p class="lede">${esc(module.description)}</p>
            <div class="tag-row">${module.category.map((item) => `<span class="tag">${esc(item)}</span>`).join("")}</div>
            <div class="meta-grid"><div class="meta-item"><span>Señal</span><strong>${esc(module.signalType)}</strong></div><div class="meta-item"><span>Dificultad</span><strong>${esc(module.difficulty)}</strong></div><div class="meta-item"><span>Voltaje</span><strong>${esc(module.voltage)}</strong></div><div class="meta-item"><span>Código</span><strong>${esc(module.codeStatus)}</strong></div></div>
            <div class="cluster module-actions"><button class="button" data-action="print">${icon("print")} Imprimir ficha</button><button class="button secondary" data-download-ino="${esc(module.id)}">${icon("download")} Descargar .ino</button><button class="button ghost" data-action="copy-url">Copiar URL para QR</button></div>
            <p class="tiny">URL permanente preparada: <span id="permanent-url">${esc(permanentModuleUrl(module.id))}</span></p>
          </div>
        </header>
        <div class="module-content">
          <section class="module-section half"><h2>¿Qué es?</h2><p>${esc(module.description)}</p></section>
          <section class="module-section half"><h2>¿Para qué sirve?</h2><p>${esc(module.purpose)}</p></section>
          <section class="module-section"><h2>¿Qué aprenderás?</h2><ul>${module.learningObjectives.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></section>
          <section class="module-section"><h2>Conoce sus pines</h2><p class="muted">La tabla explica la función y el porqué de cada conexión; no se limita a indicar origen y destino.</p><div class="table-wrap"><table><thead><tr><th>Pin del módulo</th><th>Significado</th><th>Tipo</th><th>Conectar a</th><th>Explicación</th></tr></thead><tbody>${pinRows}</tbody></table></div></section>
          <section class="module-section"><h2>Diagrama de conexión</h2><div class="diagram-card"><img src="${esc(module.imageUrl)}" alt="Diagrama de conexión del ${esc(module.name)} proporcionado en el anexo">${sourceMarkup(module)}</div></section>
          <section class="module-section half"><h2>Conexión paso a paso</h2><ol>${connectionSteps}</ol></section>
          <section class="module-section half"><h2>Antes de conectar</h2><div class="callout ${safetyClass}"><span>${icon("safety")}</span><div><h3>${esc(module.safety.level)}</h3><ul>${module.safety.warnings.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></div></div></section>
          <section class="module-section"><h2>Código base</h2><div class="code-shell"><div class="code-toolbar"><span class="status-chip ${codeStatusClass}">${codeStatusText}</span><div class="cluster"><button class="button" data-copy-code="${esc(module.id)}">${icon("code")} Copiar código</button><button class="button" data-download-ino="${esc(module.id)}">${icon("download")} Descargar .ino</button></div></div><pre><code>${esc(module.baseCode)}</code></pre></div><div class="code-status-note callout warning"><span>!</span><div><strong>Estado del ejemplo: ${esc(module.codeStatus)}</strong><p>“Revisado” significa que se inspeccionó su estructura; no equivale a una prueba con el hardware. La placa usada es Arduino UNO.</p></div></div><h3 style="margin-top:1rem">Librerías necesarias</h3><ul>${libraries}</ul>${inconsistencies}</section>
          <section class="module-section"><h2>Explicación del código</h2><div class="explanation-grid"><div class="explanation-item"><strong>Variables y pines</strong><p>Guardan los números de pin y los valores que cambian. Deben coincidir con la tabla de conexiones.</p></div><div class="explanation-item"><strong>setup()</strong><p>Se ejecuta una vez. Configura pines, comunicación Serial y librerías porque el sistema necesita un estado inicial conocido.</p></div><div class="explanation-item"><strong>loop()</strong><p>Se repite. Allí se leen entradas, se toman decisiones y se actualizan salidas.</p></div><div class="explanation-item"><strong>Lecturas</strong><p>digitalRead() obtiene HIGH/LOW; analogRead() obtiene un valor variable. La ficha indica qué tipo usa el ejemplo.</p></div><div class="explanation-item"><strong>Condicionales</strong><p>if/else elige una respuesta según el dato. Primero comprueba si el módulo es activo en HIGH o en LOW.</p></div><div class="explanation-item"><strong>Librerías y funciones</strong><p>Encapsulan protocolos o tareas repetidas. Se instalan y configuran antes de llamar sus funciones.</p></div></div></section>
          <section class="module-section half"><h2>¿Qué debería ocurrir?</h2><p>${esc(module.expectedResult)}</p><h3 style="margin-top:1rem">Calibración</h3><p class="muted">${esc(module.calibration)}</p></section>
          <section class="module-section half"><h2>Prueba rápida</h2><p>${esc(module.quickTest)}</p></section>
          <section class="module-section"><h2>Solución de problemas</h2><div class="trouble-grid">${troubles}</div></section>
          <section class="module-section"><h2>Retos</h2><div class="challenge-grid">${challenges}</div></section>
          <section class="module-section half"><h2>Preguntas de reflexión</h2><ul>${module.reflectionQuestions.map((item) => `<li>${esc(item)}</li>`).join("")}</ul><a class="button secondary small" href="#/bitacora">Responder en la bitácora</a></section>
          <section class="module-section half"><h2>Pensamiento computacional observable</h2><dl class="stack-sm">${Object.entries(module.computationalThinking).map(([key, value]) => `<div><dt class="eyebrow">${esc(key)}</dt><dd style="margin:0">${esc(value)}</dd></div>`).join("")}</dl></section>
          <section class="module-video" aria-labelledby="video-${esc(module.id)}">
            <h3 id="video-${esc(module.id)}">Video explicativo</h3>
            ${videoMarkup(module)}
            <div class="video-meta"><span>Transcripción: ${esc(module.video.transcript || "[PENDIENTE]")}</span><span>Subtítulos: ${esc(module.video.subtitles || "[PENDIENTE]")}</span><span>Duración: ${esc(module.video.duration || "[PENDIENTE]")}</span><span>Grabación: ${esc(module.video.recordingDate || "[PENDIENTE]")}</span></div>
          </section>
          ${related ? `<section class="module-section"><h2>Módulos relacionados</h2><div class="module-grid">${related}</div></section>` : ""}
        </div>
      </article>
    </div>`;
    bindModuleActions(module);
  }

  function bindModuleActions(module) {
    $$(`[data-copy-code="${CSS.escape(module.id)}"]`).forEach((button) => button.addEventListener("click", () => copyText(module.baseCode)));
    $$(`[data-download-ino="${CSS.escape(module.id)}"]`).forEach((button) => button.addEventListener("click", () => downloadText(`${module.id}.ino`, module.baseCode)));
    $("[data-action='print']")?.addEventListener("click", () => window.print());
    $("[data-action='copy-url']")?.addEventListener("click", () => copyText(permanentModuleUrl(module.id)));
  }

  function moduleMatchesBuilder(module, needle) {
    return [module.name, module.model, module.signalType, ...module.category].join(" ").toLocaleLowerCase("es").includes(needle.toLocaleLowerCase("es"));
  }

  function parseBoardPins(connection) {
    return unique(String(connection).toUpperCase().match(/\b(?:D(?:[0-9]|1[0-3])|A[0-5])\b/g) || []);
  }

  function analyzeProject(selected) {
    const pinUse = new Map();
    const connections = [];
    selected.forEach((module) => module.pins.forEach((pin) => {
      connections.push({module: module.name, moduleId: module.id, ...pin});
      parseBoardPins(pin.connectTo).forEach((boardPin) => {
        if (!pinUse.has(boardPin)) pinUse.set(boardPin, []);
        pinUse.get(boardPin).push({module, pin});
      });
    }));
    const allDigital = Array.from({length: 12}, (_, index) => `D${index + 2}`);
    const allAnalog = Array.from({length: 6}, (_, index) => `A${index}`);
    const allPins = [...allDigital, ...allAnalog];
    const used = new Set(pinUse.keys());
    const available = allPins.filter((pin) => !used.has(pin));
    const conflicts = [];
    for (const [pin, uses] of pinUse) {
      if (uses.length < 2) continue;
      const allI2C = ["A4", "A5"].includes(pin) && uses.every(({module}) => module.category.includes("I2C"));
      if (allI2C) {
        conflicts.push({level: "warning", title: `${pin} compartido por I2C`, text: `${uses.map(({module}) => module.name).join(", ")}. Compartir SDA/SCL es normal; confirma direcciones y alimentación.`});
      } else {
        const alternatives = (pin.startsWith("A") ? allAnalog : allDigital).filter((candidate) => !used.has(candidate));
        conflicts.push({level: "error", title: `⚠️ CONFLICTO DE PIN · ${pin}`, text: `${uses.map(({module}) => module.name).join(", ")}. ${alternatives[0] ? `Alternativa posible para revisar: ${alternatives[0]}.` : "No hay un pin libre equivalente identificado."} No se cambia automáticamente.`});
      }
    }
    [...pinUse.keys()].filter((pin) => ["D0", "D1"].includes(pin)).forEach((pin) => conflicts.push({level: "warning", title: `${pin} reservado para serial`, text: "Puede interferir con la carga del programa y el Monitor Serie."}));
    const i2cGroups = new Map();
    selected.filter((module) => module.i2cAddress).forEach((module) => {
      const address = module.i2cAddress.match(/0x[0-9A-F]+/i)?.[0];
      if (address) {
        if (!i2cGroups.has(address)) i2cGroups.set(address, []);
        i2cGroups.get(address).push(module.name);
      }
    });
    i2cGroups.forEach((names, address) => { if (names.length > 1) conflicts.push({level: "error", title: `Dirección I2C repetida · ${address}`, text: `${names.join(", ")}. Confirma si alguna dirección puede configurarse.`}); });
    const ids = new Set(selected.map((module) => module.id));
    if (ids.has("sg90") && (ids.has("ky-006") || ids.has("ky-005") || ids.has("ky-022"))) conflicts.push({level: "warning", title: "Posible incompatibilidad de temporizadores", text: "Servo, tone() e IRremote pueden compartir temporizadores según la versión. Esta combinación debe validarse con las versiones reales."});
    if (selected.some((module) => ["sg90", "rele-1-canal"].includes(module.id)) && selected.length > 2) conflicts.push({level: "warning", title: "Alimentación por verificar", text: "El anexo no cuantifica corriente. Un motor o relé junto con otros módulos puede requerir una fuente adecuada y tierra común."});
    if (!conflicts.length) conflicts.push({level: "ok", title: "Sin conflictos directos detectados", text: "Aun así, revisa niveles lógicos, alimentación, direcciones, bibliotecas y prueba cada módulo por separado."});
    return {pinUse, connections, available, conflicts};
  }

  function projectCode(selected, analysis) {
    const includeMap = {"AccelStepper": "AccelStepper.h", "Wire": "Wire.h", "Adafruit GFX": "Adafruit_GFX.h", "Adafruit SSD1306": "Adafruit_SSD1306.h", "Servo": "Servo.h", "LedControl": "LedControl.h", "DHT sensor library": "DHT.h", "LiquidCrystal I2C": "LiquidCrystal_I2C.h", "IRremote": "IRremote.hpp", "SoftwareSerial": "SoftwareSerial.h", "OneWire": "OneWire.h", "DallasTemperature": "DallasTemperature.h"};
    const libraries = unique(selected.flatMap((module) => module.libraries.map((item) => item.name)));
    const declarations = [];
    analysis.pinUse.forEach((uses, pin) => uses.forEach(({module, pin: modulePin}, index) => declarations.push(`const int PIN_${slug(module.id).replace(/-/g, "_").toUpperCase()}_${slug(modulePin.pin).replace(/-/g, "_").toUpperCase()}${index ? `_${index + 1}` : ""} = ${pin};`)));
    return `/*
  Código inicial generado por la plataforma.
  Debe ser revisado y probado antes de utilizarlo.
  Módulos: ${selected.map((module) => module.name).join(", ")}
*/

// ===== LIBRERÍAS =====
${libraries.length ? libraries.map((name) => `#include <${includeMap[name] || `${name}.h`}>`).join("\n") : "// No se identificaron librerías adicionales."}

// ===== PINES =====
${declarations.length ? declarations.join("\n") : "// [PENDIENTE] Definir pines."}

// ===== DECLARACIONES =====
// Crea aquí objetos y variables de estado para cada módulo.

void setup() {
  Serial.begin(9600);

  // Configura cada pin como INPUT u OUTPUT según su ficha.
  // Inicializa aquí las librerías.
}

void loop() {
  // 1. Leer entradas.
  // 2. Procesar condiciones.
  // 3. Actualizar salidas.
  // 4. Registrar evidencia útil en el Monitor Serie.
}

// ===== FUNCIONES =====
// Divide aquí las tareas: leer sensores, tomar decisiones y controlar salidas.
`;
  }

  function renderBuilder() {
    const selectionItems = modules.map((module) => `<label class="selection-item" data-builder-item="${esc(module.id)}"><input type="checkbox" value="${esc(module.id)}" ${state.builderSelection.has(module.id) ? "checked" : ""}><img src="${esc(module.imageUrl)}" alt="" loading="lazy"><span><strong>${esc(module.name)}</strong><small>${esc(module.signalType)} · ${esc(module.difficulty)}</small></span></label>`).join("");
    main.innerHTML = pageShell({
      eyebrow: "Herramienta interactiva",
      title: "Construye tu proyecto",
      lede: "Selecciona módulos para generar conexiones, pines ocupados, advertencias, checklist y una plantilla inicial de Arduino.",
      body: `<div class="callout warning"><span>!</span><div><strong>Código inicial generado</strong><p>Debe ser revisado y probado antes de utilizarlo. La herramienta no promete que cualquier combinación funcione automáticamente ni cambia conexiones críticas sin explicarlo.</p></div></div>
      <div class="builder-layout section">
        <section class="panel selector-panel"><div class="selection-tools"><label class="field"><span>Buscar componente</span><input id="builder-search" type="search" placeholder="HC-SR04, OLED, buzzer…"></label><div class="cluster spaced"><strong id="builder-count">0 seleccionados</strong><button class="button ghost small" id="clear-builder">Limpiar</button></div></div><div class="selection-list">${selectionItems}</div></section>
        <section class="builder-results" id="builder-results"></section>
      </div>`
    });
    const update = () => {
      writeStorage(STORAGE.builder, [...state.builderSelection]);
      $("#builder-count").textContent = `${state.builderSelection.size} seleccionados`;
      updateBuilderResults();
    };
    $$(".selection-item input").forEach((input) => input.addEventListener("change", () => { input.checked ? state.builderSelection.add(input.value) : state.builderSelection.delete(input.value); update(); }));
    $("#builder-search").addEventListener("input", (event) => { const needle = event.target.value.trim(); $$('[data-builder-item]').forEach((item) => { item.hidden = !moduleMatchesBuilder(byId.get(item.dataset.builderItem), needle); }); });
    $("#clear-builder").addEventListener("click", () => { state.builderSelection.clear(); $$(".selection-item input").forEach((input) => { input.checked = false; }); update(); });
    update();
  }


document.addEventListener("click", function (event) {
  const boton = event.target.closest("[data-scroll-target]");

  if (!boton) return;

  const idDestino = boton.dataset.scrollTarget;
  const destino = document.getElementById(idDestino);

  if (destino) {
    destino.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
});


  function updateBuilderResults() {
    const target = $("#builder-results");
    const selected = [...state.builderSelection].map((id) => byId.get(id)).filter(Boolean);
    if (!selected.length) {
      target.innerHTML = `<div class="empty-state"><h3>Selecciona al menos un módulo</h3><p>Aquí aparecerán la tabla de conexiones, los conflictos y el código inicial.</p></div>`;
      return;
    }
    const analysis = analyzeProject(selected);
    const code = projectCode(selected, analysis);
    const connectionRows = analysis.connections.map((item) => `<tr><td>${esc(item.module)}</td><td class="pin-name">${esc(item.pin)}</td><td><code>${esc(item.connectTo)}</code></td><td>${esc(item.why)}</td></tr>`).join("");
    const pinBlocks = [...Array.from({length: 12}, (_, index) => `D${index + 2}`), ...Array.from({length: 6}, (_, index) => `A${index}`)].map((pin) => {
      const uses = analysis.pinUse.get(pin) || [];
      const shared = ["A4", "A5"].includes(pin) && uses.length > 1 && uses.every(({module}) => module.category.includes("I2C"));
      return `<div class="pin-block ${uses.length ? shared ? "shared" : "used" : ""}"><strong>${pin}</strong><small>${uses.length ? uses.map(({module}) => module.name).join(", ") : "Disponible"}</small></div>`;
    }).join("");
    const conflicts = analysis.conflicts.map((item) => `<div class="conflict ${item.level === "error" ? "" : item.level}"><strong>${esc(item.title)}</strong><p>${esc(item.text)}</p></div>`).join("");
    const libraries = unique(selected.flatMap((module) => module.libraries.map((item) => item.name)));
    target.innerHTML = `<section class="panel"><div class="section-head"><div><span class="eyebrow">Resumen</span><h2>Proyecto con ${selected.length} módulos</h2></div></div><div class="tag-row">${selected.map((module) => `<a class="tag" href="${moduleHref(module.id)}">${esc(module.name)}</a>`).join("")}</div></section>
      <section class="panel"><h3>Detector de conflictos</h3><div class="conflict-list">${conflicts}</div></section>
      <section class="panel"><h3>Pines ocupados y disponibles</h3><div class="pin-map">${pinBlocks}</div><p class="tiny" style="margin-top:.6rem">Disponibles detectados: ${esc(analysis.available.join(", ") || "ninguno")}. A4/A5 pueden compartirse únicamente como bus I2C.</p></section>
      <section class="panel"><h3>Tabla de conexiones</h3><div class="table-wrap"><table><thead><tr><th>Módulo</th><th>Pin</th><th>Arduino</th><th>Por qué</th></tr></thead><tbody>${connectionRows}</tbody></table></div></section>
      <section class="panel"><h3>Librerías necesarias</h3><p>${libraries.length ? esc(libraries.join(", ")) : "No se identificaron librerías adicionales."}</p><h3 style="margin-top:1rem">Alimentación requerida</h3><p>${selected.filter((module) => module.voltage.includes("5V")).length} módulos indican 5 V; ${selected.filter((module) => module.voltage.includes("3.3")).length} mencionan 3.3 V. La corriente total está <strong>[POR VALIDAR]</strong>.</p></section>
      <section class="panel"><h3>Checklist antes de probar</h3><div class="check-grid">${["Revisé el nivel de riesgo de cada módulo.", "Desconecté la alimentación para mover cables.", "Todos los GND necesarios comparten referencia.", "Los pines del código coinciden con la tabla.", "Revisé conflictos de pin, I2C, serial y librerías.", "Probaré cada módulo por separado.", "Registraré hipótesis, intentos y cambios."].map((item) => `<label class="check-card"><input type="checkbox"><span>${item}</span></label>`).join("")}</div></section>
      <section class="panel"><div class="cluster spaced"><h3>Plantilla inicial de código</h3><div class="cluster"><button class="button secondary small" id="copy-project-code">Copiar</button><button class="button small" id="download-project-code">Descargar .ino</button></div></div><div class="code-shell" style="margin-top:.7rem"><pre><code>${esc(code)}</code></pre></div><p class="tiny">Código inicial generado. Debe ser revisado y probado antes de utilizarlo.</p></section>
      <section class="panel"><h3>Guardar proyecto</h3><div class="form-grid two"><label class="field"><span>Nombre del proyecto</span><input id="project-name" placeholder="Ej.: Alerta de distancia"></label><label class="field"><span>Problema que intentas resolver</span><input id="project-problem" placeholder="Describe la situación"></label></div><button class="button" id="save-project" style="margin-top:.7rem">Guardar localmente</button></section>`;
    $("#copy-project-code").addEventListener("click", () => copyText(code));
    $("#download-project-code").addEventListener("click", () => downloadText("proyecto-inicial.ino", code));
    $("#save-project").addEventListener("click", () => {
      const name = $("#project-name").value.trim();
      if (!name) return toast("Escribe un nombre para guardar el proyecto.");
      const projects = readStorage(STORAGE.projects, []);
      projects.unshift({id: crypto.randomUUID?.() || String(Date.now()), name, problem: $("#project-problem").value.trim(), modules: selected.map((module) => module.id), code, date: today()});
      writeStorage(STORAGE.projects, projects);
      toast("Proyecto guardado en este dispositivo.");
    });
  }

  function renderProjects() {
    const cards = content.projects.map((project) => `<article class="project-card"><span class="eyebrow">Proyecto integrador</span><h2>${esc(project.title)}</h2><div><strong>Problema</strong><p class="muted">${esc(project.problem)}</p></div><div><strong>Objetivo</strong><p class="muted">${esc(project.objective)}</p></div><div><strong>Restricciones</strong><ul>${project.restrictions.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></div><div><strong>Módulos sugeridos</strong><div class="module-links">${project.suggestedModules.map((id) => byId.get(id)).filter(Boolean).map((module) => `<a href="${moduleHref(module.id)}">${esc(module.name)}</a>`).join("")}</div></div><div class="hints">${project.hints.map((hint) => `<details><summary></summary><p>${esc(hint)}</p></details>`).join("")}</div><details><summary>VER SOLUCIÓN</summary><p>${esc(project.solution)}</p></details></article>`).join("");
    main.innerHTML = pageShell({eyebrow: "Resolver antes de copiar", title: "Proyectos y retos integradores", lede: "Cada proyecto comienza con un problema, restricciones, planificación y pruebas. Las pistas aparecen de forma progresiva.", body: `<div class="card-grid">${cards}</div><section class="section callout"><span>${icon("builder")}</span><div><h3>¿Quieres combinar otros módulos?</h3><p>Usa el constructor para revisar pines, bibliotecas y conflictos antes de escribir la solución.</p><a class="button secondary small" href="#/constructor">Abrir constructor</a></div></section>`});
  }

  function renderStudentLog() {
    const logs = readStorage(STORAGE.logs, []);
    const saved = logs.length ? logs.map((log) => `<article class="saved-card"><header><div><span class="eyebrow">${esc(log.studentId || "Sin código")}</span><h3>${esc(log.project || "Proyecto sin nombre")}</h3></div><button class="button danger small" data-delete-log="${esc(log.id)}">Eliminar</button></header><dl><dt>Fecha</dt><dd>${esc(formatDate(log.date))}</dd><dt>Hipótesis</dt><dd>${esc(log.hypothesis)}</dd><dt>Problema</dt><dd>${esc(log.problemFound)}</dd><dt>Intentos</dt><dd>${esc(log.attempts)}</dd><dt>Cambio</dt><dd>${esc(log.change)}</dd><dt>Resultado</dt><dd>${esc(log.result)}</dd><dt>Reflexión</dt><dd>${esc(log.reflection)}</dd></dl></article>`).join("") : `<div class="empty-state"><h3>Aún no hay evidencias</h3><p>Completa la bitácora después de una prueba o intento.</p></div>`;
    main.innerHTML = pageShell({
      eyebrow: "Modo estudiante · almacenamiento local",
      title: "Bitácora del proceso",
      lede: "Guarda evidencias de cómo pensaste, probaste, encontraste errores y mejoraste. No escribas datos personales innecesarios; usa códigos como EST-001.",
      body: `<div class="research-banner"><strong>Privacidad del prototipo</strong><p>La información se guarda en localStorage dentro de este navegador. No se envía a una base de datos. Exporta una copia si necesitas moverla a otro equipo.</p></div>
      <form class="panel section" id="student-log-form">
        <div class="form-grid two"><label class="field"><span>Código del estudiante</span><input name="studentId" placeholder="EST-001" pattern="[A-Za-z0-9_-]+"></label><label class="field"><span>Fecha</span><input name="date" type="date" value="${today()}"></label><label class="field"><span>Proyecto</span><input name="project" required></label><label class="field"><span>Número de intentos</span><input name="attempts" type="number" min="0" value="1"></label></div>
        <div class="form-grid two" style="margin-top:.8rem"><label class="field"><span>Hipótesis inicial</span><textarea name="hypothesis" required></textarea></label><label class="field"><span>Plan</span><textarea name="plan"></textarea></label><label class="field"><span>Componentes seleccionados</span><textarea name="components"></textarea></label><label class="field"><span>Código inicial</span><textarea name="initialCode"></textarea></label><label class="field"><span>Problema encontrado</span><textarea name="problemFound" required></textarea></label><label class="field"><span>Cambio realizado</span><textarea name="change" required></textarea></label><label class="field"><span>Resultado</span><textarea name="result" required></textarea></label><label class="field"><span>Explicación final</span><textarea name="finalExplanation"></textarea></label><label class="field"><span>Reflexión: ¿qué aprendiste y qué mejorarías?</span><textarea name="reflection" required></textarea></label></div>
        <div class="cluster" style="margin-top:.8rem"><button class="button" type="submit">Guardar evidencia</button><button class="button ghost" type="reset">Limpiar formulario</button></div>
      </form>
      <section class="section"><div class="section-head"><div><span class="eyebrow">Evidencias guardadas</span><h2>${logs.length} registros en este dispositivo</h2></div><div class="cluster"><button class="button secondary small" id="export-logs">Exportar JSON</button><button class="button ghost small" data-action="print">Imprimir</button></div></div><div class="saved-grid">${saved}</div></section>`
    });
    $("#student-log-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(event.currentTarget));
      const next = readStorage(STORAGE.logs, []);
      next.unshift({...values, id: crypto.randomUUID?.() || String(Date.now()), savedAt: new Date().toISOString()});
      writeStorage(STORAGE.logs, next);
      toast("Evidencia guardada en este dispositivo.");
      renderStudentLog();
    });
    $$('[data-delete-log]').forEach((button) => button.addEventListener("click", () => {
      if (!confirm("¿Eliminar esta evidencia guardada localmente?")) return;
      writeStorage(STORAGE.logs, readStorage(STORAGE.logs, []).filter((log) => log.id !== button.dataset.deleteLog));
      renderStudentLog();
    }));
    $("#export-logs").addEventListener("click", () => downloadText(`bitacora-${today()}.json`, JSON.stringify(readStorage(STORAGE.logs, []), null, 2), "application/json"));
    $("[data-action='print']").addEventListener("click", () => window.print());
  }

  function defaultRubric() {
    const scale = content.rubricScale;
    return content.ctDimensions.map((dimension) => ({id: dimension.id, name: dimension.name, descriptors: scale.map((level) => `${level.label}: descriptor editable para ${dimension.name.toLowerCase()}.`)}));
  }

  function rubricTable(rubric) {
    return `<div class="table-wrap"><table class="rubric-table"><thead><tr><th>Dimensión editable</th>${content.rubricScale.map((level) => `<th>${level.value} · ${esc(level.label)}</th>`).join("")}<th>Acción</th></tr></thead><tbody>${rubric.map((row, rowIndex) => `<tr data-rubric-row="${rowIndex}"><td><textarea data-rubric-name>${esc(row.name)}</textarea></td>${row.descriptors.map((descriptor, index) => `<td><textarea data-rubric-descriptor="${index}">${esc(descriptor)}</textarea></td>`).join("")}<td><button class="button danger small" data-remove-dimension="${rowIndex}">Quitar</button></td></tr>`).join("")}</tbody></table></div>`;
  }

  function renderTeacher() {
    const activity = content.defaultTeacherActivity;
    let rubric = readStorage(STORAGE.rubric, defaultRubric());
    const moduleOptions = modules.map((module) => `<label class="check-card"><input type="checkbox" name="modules" value="${esc(module.id)}"><span>${esc(module.name)}</span></label>`).join("");
    main.innerHTML = pageShell({
      eyebrow: "Modo docente",
      title: "Planifica, acompaña y observa",
      lede: "Crea una ficha de actividad, consulta errores frecuentes y edita una rúbrica sin convertirla en un instrumento definitivo de investigación.",
      body: `<div class="research-banner"><strong>Modo investigación opcional</strong><p>Organiza evidencias del proceso, pero no afirma que la rúbrica esté validada. Las dimensiones y descriptores deben ajustarse al marco teórico y al instrumento aprobado.</p></div>
      <section class="panel section"><div class="section-head"><div><span class="eyebrow">Ruta de clase</span><h2>Constructor de ficha docente</h2></div><button class="button ghost small" id="print-teacher">${icon("print")} Imprimir ficha</button></div>
        <form id="teacher-form"><div class="form-grid two"><label class="field"><span>Título</span><input name="title" value="${esc(activity.title)}"></label><label class="field"><span>Tiempo aproximado</span><input name="duration" value="${esc(activity.duration)}"></label><label class="field"><span>Conocimientos previos</span><textarea name="priorKnowledge">${esc(activity.priorKnowledge)}</textarea></label><label class="field"><span>Objetivos de aprendizaje</span><textarea name="objectives">Identificar los pines. Justificar las conexiones. Probar, depurar y explicar.</textarea></label><label class="field"><span>Preguntas antes de comenzar</span><textarea name="before">${esc(activity.before.join("\n"))}</textarea></label><label class="field"><span>Preguntas durante la actividad</span><textarea name="during">${esc(activity.during.join("\n"))}</textarea></label><label class="field"><span>Preguntas después</span><textarea name="after">${esc(activity.after.join("\n"))}</textarea></label><label class="field"><span>Errores frecuentes</span><textarea name="commonErrors">${esc(activity.commonErrors.join("\n"))}</textarea></label><label class="field"><span>Indicadores observables</span><textarea name="observables">${esc(activity.observables.join("\n"))}</textarea></label><label class="field"><span>Observaciones</span><textarea name="notes"></textarea></label></div>
        <details style="margin-top:.8rem"><summary>Seleccionar módulos necesarios</summary><div class="check-grid" style="padding:.75rem">${moduleOptions}</div></details>
        <button class="button" type="submit" style="margin-top:.8rem">Guardar ficha localmente</button></form>
      </section>
      <section class="section panel" id="rubric-section"><div class="section-head"><div><span class="eyebrow">Configurable</span><h2>Constructor de rúbrica</h2></div><div class="cluster"><button class="button ghost small" id="add-dimension">Añadir dimensión</button><button class="button small" id="save-rubric">Guardar rúbrica</button></div></div><p class="muted">Escala inicial: 1 Inicial · 2 En desarrollo · 3 Logrado · 4 Avanzado. Todo el contenido es editable.</p><div id="rubric-container">${rubricTable(rubric)}</div></section>
      <section class="section panel"><h2>Registrar observación</h2><form id="observation-form"><div class="form-grid two"><label class="field"><span>Código del estudiante</span><input name="studentId" placeholder="EST-001"></label><label class="field"><span>Fecha</span><input name="date" type="date" value="${today()}"></label><label class="field"><span>Actividad</span><input name="activity"></label><label class="field"><span>Evidencia observable</span><textarea name="evidence" required></textarea></label><label class="field"><span>Interpretación provisional</span><textarea name="interpretation"></textarea></label><label class="field"><span>Próxima pregunta o apoyo</span><textarea name="nextStep"></textarea></label></div><button class="button" type="submit" style="margin-top:.8rem">Guardar observación</button></form></section>
      <section class="section panel"><div class="section-head"><div><span class="eyebrow">Exportación</span><h2>Modo investigación</h2></div><button class="button secondary" id="export-research">Exportar evidencias locales</button></div><p>El archivo reúne bitácoras y observaciones sin añadir una interpretación automática ni afirmar validez del instrumento.</p></section>`
    });
    $("#teacher-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const values = Object.fromEntries(form);
      values.modules = form.getAll("modules");
      values.id = crypto.randomUUID?.() || String(Date.now());
      values.date = today();
      const list = readStorage(STORAGE.activities, []);
      list.unshift(values);
      writeStorage(STORAGE.activities, list);
      toast("Ficha docente guardada localmente.");
    });
    $("#print-teacher").addEventListener("click", () => window.print());
    const refreshRubric = () => { $("#rubric-container").innerHTML = rubricTable(rubric); bindRemove(); };
    const collectRubric = () => $$('[data-rubric-row]').map((row, index) => ({id: rubric[index]?.id || `custom-${Date.now()}-${index}`, name: $("[data-rubric-name]", row).value.trim() || "Dimensión sin nombre", descriptors: $$('[data-rubric-descriptor]', row).map((field) => field.value.trim())}));
    const bindRemove = () => $$('[data-remove-dimension]').forEach((button) => button.addEventListener("click", () => { rubric = collectRubric().filter((_, index) => index !== Number(button.dataset.removeDimension)); refreshRubric(); }));
    bindRemove();
    $("#add-dimension").addEventListener("click", () => { rubric = collectRubric(); rubric.push({id: `custom-${Date.now()}`, name: "Nueva dimensión", descriptors: content.rubricScale.map((level) => `${level.label}: [PENDIENTE]`)}); refreshRubric(); });
    $("#save-rubric").addEventListener("click", () => { rubric = collectRubric(); writeStorage(STORAGE.rubric, rubric); toast("Rúbrica configurable guardada."); });
    $("#observation-form").addEventListener("submit", (event) => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); const list = readStorage(STORAGE.observations, []); list.unshift({...values, id: crypto.randomUUID?.() || String(Date.now()), savedAt: new Date().toISOString()}); writeStorage(STORAGE.observations, list); toast("Observación guardada localmente."); event.currentTarget.reset(); });
    $("#export-research").addEventListener("click", () => downloadText(`evidencias-investigacion-${today()}.json`, JSON.stringify({notice: "Prototipo configurable; no constituye un instrumento validado.", studentLogs: readStorage(STORAGE.logs, []), observations: readStorage(STORAGE.observations, []), rubric: readStorage(STORAGE.rubric, defaultRubric())}, null, 2), "application/json"));
  }

  function renderComputationalThinking() {
    const cards = content.ctDimensions.map((dimension) => `<article class="content-card"><span class="eyebrow">Acción observable</span><h3>${esc(dimension.name)}</h3><p class="muted">${esc(dimension.description)}</p><div class="callout" style="margin-top:.7rem"><span>?</span><div><strong>Pregunta orientadora</strong><p>${esc({decomposition: "¿El estudiante separa sensores, procesamiento, actuadores y pruebas?", patterns: "¿Compara intentos y reconoce comportamientos que se repiten?", abstraction: "¿Distingue el dato relevante del ruido?", algorithms: "¿Organiza instrucciones y decisiones en orden?", debugging: "¿Identifica una causa y cambia una variable por intento?", evaluation: "¿Compara el resultado con el criterio y propone una mejora?"}[dimension.id])}</p></div></div></article>`).join("");
    main.innerHTML = pageShell({eyebrow: "Pensamiento computacional", title: "Observar acciones, no solo resultados", lede: "Las dimensiones iniciales son configurables. La plataforma registra evidencias del proceso sin afirmar que constituyan un instrumento validado.", body: `<div class="feature-grid">${cards}</div><section class="section panel"><h2>Actividad de observación</h2><ol><li>El estudiante predice el resultado antes de conectar.</li><li>Divide el sistema en entrada, procesamiento y salida.</li><li>Ejecuta una prueba y registra el primer error.</li><li>Cambia una sola variable y explica por qué.</li><li>Compara el resultado con el criterio y propone una mejora.</li></ol><a class="button secondary" href="#/bitacora">Registrar en la bitácora</a></section>`});
  }

  function renderTroubleshooting() {
    const flow = [
      ["Detén y observa", "Desconecta si hay calor, olor, ruido extraño o riesgo."],
      ["Describe el problema", "Escribe qué esperabas y qué ocurrió, sin interpretar todavía."],
      ["Comprueba alimentación", "Verifica voltaje, polaridad y tierra común."],
      ["Comprueba un cable", "Contrasta el pin físico, la tabla y el código."],
      ["Lee el primer error", "Si no compila, corrige primero el mensaje inicial del IDE."],
      ["Reduce el sistema", "Prueba un módulo y una función mínima."],
      ["Cambia una variable", "Registra el intento antes de modificar otra cosa."],
      ["Explica la evidencia", "Di qué observación apoya o descarta la causa."]
    ];
    main.innerHTML = pageShell({eyebrow: "Depuración guiada", title: "Solución de problemas", lede: "Un error no es solo un obstáculo: es evidencia para formular y comprobar una causa.", body: `<div class="timeline">${flow.map((item, index) => `<article class="timeline-item"><span class="timeline-marker">${index + 1}</span><div class="timeline-copy"><h3>${esc(item[0])}</h3><p>${esc(item[1])}</p></div></article>`).join("")}</div><section class="section trouble-grid">${[{p:"No aparecen valores",c:"Monitor Serie cerrado, baudios incorrectos, pin o GND.",q:"Abrir el monitor, igualar baudios y comprobar una conexión por vez.",s:"Corregir el elemento comprobado."},{p:"La pantalla permanece negra",c:"Dirección I2C, contraste, alimentación o librería.",q:"Ejecutar un escáner I2C y revisar SDA/SCL.",s:"Usar la dirección encontrada y probar el ejemplo mínimo."},{p:"No encuentra la librería",c:"No está instalada o el nombre/API no coincide.",q:"Leer el include y el primer error.",s:"Instalar la biblioteca indicada y revisar su versión."},{p:"Caracteres extraños",c:"Velocidad serial diferente.",q:"Comparar Serial.begin() con el Monitor Serie.",s:"Usar la misma velocidad en ambos."}].map((item) => `<article class="trouble-card"><h3>${item.p}</h3><dl><dt>Posible causa</dt><dd>${item.c}</dd><dt>Cómo comprobarlo</dt><dd>${item.q}</dd><dt>Solución</dt><dd>${item.s}</dd></dl></article>`).join("")}</section>`});
  }

  function renderSafety() {
    const cards = content.safetyTopics.map((item) => `<article class="safety-card" data-level="${esc(item.level)}"><span class="status-chip ${item.level.includes("SUPERVISIÓN") ? "pending" : item.level === "PRECAUCIÓN" ? "warning" : "reviewed"}">${esc(item.level)}</span><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></article>`).join("");
    main.innerHTML = pageShell({eyebrow: "Antes de usar el tablero", title: "Seguridad", lede: "La baja tensión no elimina todos los riesgos. El nivel de supervisión depende del módulo y de la carga conectada.", body: `<div class="callout danger"><span>${icon("safety")}</span><div><h3>Regla principal</h3><p>Desconecta la energía antes de mover cables. Las conexiones de corriente alterna no son una práctica autónoma para estudiantes.</p></div></div><div class="safety-grid section">${cards}</div>`});
  }

  function renderGlossary() {
    const items = Object.entries(glossary).sort(([a], [b]) => a.localeCompare(b, "es")).map(([term, definition]) => `<article class="concept-card" id="term-${slug(term)}"><h3>${esc(term)}</h3><p>${esc(definition)}</p></article>`).join("");
    main.innerHTML = pageShell({eyebrow: "Consulta rápida", title: "Glosario interactivo", lede: "Pulsa los términos resaltados en otras páginas para ver su significado sin perder el contexto.", body: `<div class="concept-grid">${items}</div>`});
  }

  function renderDownloads() {
    const projects = readStorage(STORAGE.projects, []);
    main.innerHTML = pageShell({eyebrow: "Usar, imprimir y respaldar", title: "Descargas", lede: "La impresión utiliza un diseño A4 que oculta navegación y conserva texto, tablas, diagramas, código, advertencias y fuentes.", body: `<div class="feature-grid"><a class="feature-card" href="downloads/GUIA%20PARA%20LA%20WEB.docx" download><span class="icon-wrap">${icon("download")}</span><h3>Descargar guía completa</h3><p>Documento original suministrado como anexo.</p></a><button class="feature-card" data-action="print"><span class="icon-wrap">${icon("print")}</span><h3>Imprimir guía o guardar PDF</h3><p>Usa el diálogo del navegador para guardar en PDF A4.</p></button><a class="feature-card" href="#/modulos"><span class="icon-wrap">${icon("board")}</span><h3>Descargar ficha de módulo</h3><p>Abre una ficha y usa “Imprimir ficha”.</p></a><a class="feature-card" href="#/docente"><span class="icon-wrap">${icon("code")}</span><h3>Descargar actividad</h3><p>Completa la ficha docente y usa la vista de impresión.</p></a></div><section class="section panel"><h2>Respaldar proyectos guardados</h2><p>Hay ${projects.length} proyectos en este dispositivo.</p><button class="button secondary" id="export-projects">Exportar proyectos JSON</button></section>`});
    $("[data-action='print']").addEventListener("click", () => window.print());
    $("#export-projects").addEventListener("click", () => downloadText(`proyectos-${today()}.json`, JSON.stringify(projects, null, 2), "application/json"));
  }

  function renderReferences() {
    const uniqueSources = new Map();
    modules.forEach((module) => { if (module.sourceUrl.startsWith("http") && !uniqueSources.has(module.sourceUrl)) uniqueSources.set(module.sourceUrl, module); });
    const items = [...uniqueSources.values()].sort((a, b) => a.name.localeCompare(b.name, "es")).map((module) => `<article class="reference-item"><strong>${esc(module.name)}</strong><a href="${esc(module.sourceUrl)}" target="_blank" rel="noopener">${esc(module.sourceUrl)}</a><p class="tiny">Autor: ${esc(module.sourceAuthor)} · Licencia: ${esc(module.sourceLicense)} · Estado: ${esc(module.licenseStatus)} · Acceso: ${esc(module.accessDate)}</p></article>`).join("");
    main.innerHTML = pageShell({eyebrow: "Trazabilidad", title: "Referencias y créditos", lede: "La URL usada para mostrar cada imagen está separada de la página original. No se inventaron autores, licencias ni permisos.", body: `<div class="callout warning"><span>!</span><div><h3>Licencias pendientes</h3><p>El anexo no especifica autor ni licencia de las imágenes. Todas permanecen con estado POR VERIFICAR hasta una revisión documental.</p></div></div><div class="reference-list section">${items}</div>`});
  }

  function renderAbout() {
    const inconsistencies = modules.flatMap((module) => module.inconsistencies.map((text) => ({module, text})));
    main.innerHTML = pageShell({eyebrow: "Trabajo de grado", title: "Acerca del proyecto", lede: "La plataforma convierte el tablero modular en una experiencia de aprendizaje y en un soporte configurable para observar procesos de pensamiento computacional.", body: `<div class="feature-grid"><article class="content-card"><span class="eyebrow">Arquitectura</span><h3>PWA sin compilación</h3><p class="muted">HTML semántico, CSS responsive, JavaScript modular por funciones, datos separados y service worker.</p></article><article class="content-card"><span class="eyebrow">Modelo</span><h3>Una plantilla, 46 fichas</h3><p class="muted">El catálogo se genera desde modules.js/modules.json; no existen 46 páginas mantenidas manualmente.</p></article><article class="content-card"><span class="eyebrow">Persistencia</span><h3>Local primero</h3><p class="muted">Bitácoras, actividades, rúbricas y proyectos usan localStorage y pueden exportarse.</p></article><article class="content-card"><span class="eyebrow">Offline</span><h3>Recursos esenciales locales</h3><p class="muted">Las 47 imágenes del anexo se guardaron localmente; los videos externos no se prometen offline.</p></article></div>
      <section class="section panel"><h2>Decisiones pedagógicas</h2><ul><li>Progresión: reproducir → modificar → crear.</li><li>Explicar el porqué de cada pin y no solo copiar conexiones.</li><li>Registrar hipótesis, errores, intentos, cambios y explicaciones.</li><li>Tratar las dimensiones de pensamiento computacional y la rúbrica como configurables.</li><li>No mostrar la solución completa de los retos de creación desde el inicio.</li></ul></section>
      <section class="section panel"><h2>Inconsistencias detectadas en el anexo</h2><div class="trouble-grid">${inconsistencies.map(({module, text}) => `<article class="trouble-card"><h3>${esc(module.name)}</h3><p>${esc(text)}</p></article>`).join("")}<article class="trouble-card"><h3>Fuentes visuales</h3><p>Las 47 imágenes se enlazaban de forma externa y no estaban incrustadas. Autor y licencia no aparecen en el documento.</p></article><article class="trouble-card"><h3>Estado de prueba</h3><p>Ningún ejemplo se declara probado físicamente dentro del anexo; por eso no se usa el estado “probado”.</p></article></div></section>
      <section class="section panel"><h2>Alcance de investigación</h2><p>La plataforma organiza evidencias y observaciones, pero no sustituye el marco teórico, la validación ni la aprobación del instrumento de investigación.</p></section>`});
  }

  function renderNotFound() {
    document.title = "Página no encontrada · Tablero Modular Arduino";
    main.innerHTML = pageShell({eyebrow: "404", title: "No encontramos esta página", lede: "La ruta puede estar incompleta o el identificador del módulo no existe.", body: `<div class="cluster"><a class="button" href="#/inicio">Volver al inicio</a><a class="button secondary" href="#/modulos">Explorar módulos</a></div>`, className: "narrow"});
  }

  function render() {
    const {parts, query} = routeInfo();
    const route = parts[0] || "inicio";
    if (route !== "modulos" || parts.length < 2) document.title = `${({inicio: "Inicio", "primeros-pasos": "Primeros pasos", conceptos: "Conceptos", modulos: "Módulos", constructor: "Constructor", proyectos: "Proyectos", bitacora: "Bitácora", docente: "Modo docente", pensamiento: "Pensamiento computacional", "solucion-problemas": "Solución de problemas", seguridad: "Seguridad", glosario: "Glosario", descargas: "Descargas", referencias: "Referencias", acerca: "Acerca"}[route] || "Plataforma")} · Tablero Modular Arduino`;
    const routes = {
      inicio: renderHome,
      tablero: renderBoard,
      "arduino-uno": () => renderModule("arduino-uno"),
      protoboard: () => renderModule("protoboard"),
      "sensores-analogicos": () => { state.catalog.category = "ENTRADA ANALÓGICA"; renderCatalog(); },
      "sensores-digitales": () => { state.catalog.category = "ENTRADA DIGITAL"; renderCatalog(); },
      "sensores-hibridos": () => { state.catalog.category = "ENTRADA HÍBRIDA AO/DO"; renderCatalog(); },
      actuadores: () => { state.catalog.category = "ACTUADOR"; renderCatalog(); },
      visualizacion: () => { state.catalog.category = "VISUALIZACIÓN"; renderCatalog(); },
      comunicacion: () => { state.catalog.category = "COMUNICACIÓN"; renderCatalog(); },
      "primeros-pasos": renderFirstSteps,
      conceptos: renderConcepts,
      constructor: renderBuilder,
      proyectos: renderProjects,
      bitacora: renderStudentLog,
      docente: renderTeacher,
      pensamiento: renderComputationalThinking,
      "solucion-problemas": renderTroubleshooting,
      seguridad: renderSafety,
      glosario: renderGlossary,
      descargas: renderDownloads,
      referencias: renderReferences,
      "referencias-creditos": renderReferences,
      acerca: renderAbout,
      "proyecto-grado": renderAbout,
      retos: renderProjects,
      "modo-estudiante": renderStudentLog,
      "modo-docente": renderTeacher
    };
    if (route === "modulos" && parts[1]) renderModule(decodeURIComponent(parts[1]));
    else if (route === "modulos") renderCatalog(query);
    else (routes[route] || renderNotFound)();
    updateActiveNav(route);
    closeNav();
    main.focus({preventScroll: true});
    window.scrollTo({top: 0, behavior: "instant"});
  }

  function updateActiveNav(route) {
    $$('[data-route]').forEach((link) => link.classList.toggle("active", link.dataset.route === route));
  }

  function closeNav() {
    document.body.classList.remove("nav-open");
    $("#menu-button").setAttribute("aria-expanded", "false");
  }

  function updateProgress() {
    const count = readStorage(STORAGE.logs, []).length + readStorage(STORAGE.projects, []).length + readStorage(STORAGE.observations, []).length;
    $("#progress-label").textContent = `${count} ${count === 1 ? "evidencia guardada" : "evidencias guardadas"}`;
  }

  function globalSearch(value) {
    const needle = value.trim().toLocaleLowerCase("es");
    const matches = needle ? modules.filter((module) => [module.name, module.model, module.purpose, module.signalType, ...module.category, ...module.pins.flatMap((pin) => [pin.pin, pin.connectTo])].join(" ").toLocaleLowerCase("es").includes(needle)).slice(0, 12) : modules.slice(0, 8);
    $("#global-results").innerHTML = matches.length ? matches.map((module) => `<a class="search-result" href="${moduleHref(module.id)}"><img src="${esc(module.imageUrl)}" alt=""><span><strong>${esc(module.name)}</strong><small>${esc(module.signalType)} · ${esc(module.category[0])}</small></span><span>→</span></a>`).join("") : `<div class="empty-state"><p>Sin resultados. Prueba un nombre, pin o protocolo.</p></div>`;
  }

  function setupGlobalUI() {
    const theme = readStorage(STORAGE.theme, "") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
    $("#theme-button").addEventListener("click", () => { const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark"; document.documentElement.dataset.theme = next; writeStorage(STORAGE.theme, next); });
    $("#menu-button").addEventListener("click", () => { const open = document.body.classList.toggle("nav-open"); $("#menu-button").setAttribute("aria-expanded", String(open)); });
    $("#nav-close").addEventListener("click", closeNav);
    $("#nav-backdrop").addEventListener("click", closeNav);
    const searchDialog = $("#search-dialog");
    const openSearch = () => { searchDialog.showModal(); globalSearch(""); setTimeout(() => $("#global-search").focus(), 50); };
    $("#search-trigger").addEventListener("click", openSearch);
    $("#global-search").addEventListener("input", (event) => globalSearch(event.target.value));
    $("#global-results").addEventListener("click", (event) => { if (event.target.closest("a")) searchDialog.close(); });
    $$('[data-close-dialog]').forEach((button) => button.addEventListener("click", () => document.getElementById(button.dataset.closeDialog).close()));
    document.addEventListener("keydown", (event) => { if (event.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { event.preventDefault(); openSearch(); } });
    document.addEventListener("click", (event) => {
      const termButton = event.target.closest("[data-term]");
      if (!termButton) return;
      const key = Object.keys(glossary).find((term) => term.toLocaleLowerCase("es") === termButton.dataset.term.toLocaleLowerCase("es"));
      $("#glossary-title").textContent = key || termButton.dataset.term;
      $("#glossary-definition").textContent = glossary[key] || "Definición [PENDIENTE].";
      $("#glossary-dialog").showModal();
    });
    window.addEventListener("hashchange", render);
    updateProgress();
  }

  function setupOffline() {
    const indicator = $("#offline-indicator");
    const update = () => {
      if (!navigator.onLine) {
        indicator.textContent = "Sin conexión · recursos locales activos";
        indicator.classList.add("offline");
      } else if (navigator.serviceWorker?.controller) {
        indicator.textContent = "Disponible sin conexión";
        indicator.classList.remove("offline");
      } else {
        indicator.textContent = "Preparando modo sin conexión";
        indicator.classList.remove("offline");
      }
    };
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    if ("serviceWorker" in navigator && location.protocol !== "file:") {
      navigator.serviceWorker.register(new URL("sw.js", rootUrl).pathname, {scope: rootUrl.pathname}).then(() => navigator.serviceWorker.ready).then(update).catch(() => { indicator.textContent = "Modo offline pendiente"; });
      navigator.serviceWorker.addEventListener("controllerchange", update);
    }
    update();
  }

  if (document.querySelector("base") && location.hash.startsWith("#/")) {
    history.replaceState(null, "", new URL(`index.html${location.hash}`, rootUrl));
  }
  setupGlobalUI();
  setupOffline();
  render();
})();
