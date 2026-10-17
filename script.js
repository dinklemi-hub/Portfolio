const DATA = {
    about: [
        "== À PROPOS ==",
        "Salut, moi c'est Lemi Dink.",
        "j'ai 19 ans et je suis étudiant en informatique.",
        "Passionné d'informatique, je code en C et je bidouille sous Linux.",
        "J'apprends en faisant des projets concrets.",
        "Vous pourriez voir ce que je fais en cliquant sur les onglets."
    ],
 
    skills: [
        "== SKILLS ==",
        "Langages   : C, HTML, CSS, JavaScript",
        "Systèmes   : Linux, WSL, Git",
        "Outils     : VSCode, terminal, Makefile",
    ],
 
    // Chaque projet est un "fichier" : ls puis cat nom.txt
    projects: {
        "libft.txt": [
            "== libft ==",
            "Ma propre bibliothèque de fonctions en C.",
            "Techs : C, Makefile",
        ],
        "portfolio.txt": [
            "== portfolio ==",
            "Ce site : un portfolio en mode terminal.",
            "Techs : HTML, CSS, JavaScript",
        ],
        // Ajoute tes projets ici :
        // "monprojet.txt": ["== titre ==", "description", "Techs : ..."],
    },
 
    contact: [
        "== CONTACT ==",
        "Email  : dink.lemi@gmail.com",
        "GitHub : github.com/dinklemi-hub",
    ],
};

const HELP = [
    "Commandes disponibles :",
    "  help        affiche cette aide",
    "  about       qui je suis",
    "  skills      mes compétences",
    "  projects    liste mes projets (ls)",
    "  cat <fich>  ouvre un projet, ex : cat libft.txt",
    "  contact     comment me joindre",
    "  clear       efface l'écran",
    "",
    "Astuce : les onglets en haut font la même chose.",
];
 
const BOOT = [
    ["> initialisation du système...", "muted"],
    ["> chargement des modules.......... OK", "muted"],
    ["> connexion au nouveau monde...... OK", "ok"],
    ["", ""],
    ["Bienvenue sur mon portfolio.", "title"],
    ["Tape 'help' ou clique sur un onglet pour explorer.", ""],
    ["", ""],
];
 
// ---------- ÉLÉMENTS DU DOM ----------
const output = document.getElementById("output");
const input = document.getElementById("input");
const terminal = document.getElementById("terminal");
const tabButtons = document.querySelectorAll(".tabs button");
const astuce = document.getElementById("astuce");
let count = 0;
 
// ---------- AFFICHAGE ----------
function printLine(text, cls = "") {
    const p = document.createElement("p");
    p.className = "line " + cls;
    p.textContent = text; // textContent = pas d'injection HTML
    output.appendChild(p);
    terminal.scrollTop = terminal.scrollHeight;
}
 
function printBlock(lines) {
    lines.forEach((l, i) => printLine(l, i === 0 && l.startsWith("==") ? "title" : ""));
    printLine("");
}
 
// Affiche des lignes une par une (effet "machine qui écrit")
function printSlow(lines, delay = 250) {
    return new Promise((resolve) => {
        let i = 0;
        const next = () => {
            if (i >= lines.length) return resolve();
            printLine(lines[i][0], lines[i][1]);
            i++;
            setTimeout(next, delay);
        };
        next();
    });
}
 
// ---------- COMMANDES ----------
const commands = {
    help: () => printBlock(HELP),
    about: () => printBlock(DATA.about),
    skills: () => printBlock(DATA.skills),
    contact: () => printBlock(DATA.contact),
 
    projects: () => {
        printLine("== PROJETS ==", "title");
        Object.keys(DATA.projects).forEach((name) => printLine("  " + name));
        printLine("Utilise : cat <nom du fichier>", "muted");
        printLine("");
    },
    ls: () => commands.projects(),
 
    cat: (args) => {
        const file = args[0];
        if (!file) return printLine("cat : il manque un nom de fichier", "error");
        const content = DATA.projects[file];
        if (!content) return printLine("cat : " + file + " : fichier introuvable", "error");
        printBlock(content);
    },
 
    clear: () => {
        output.innerHTML = "";
        count = 0;
        astuce.classList.remove("visible");
    },
 
    // --- Commandes cachées ---
    sudo: () => printLine("Nice try. Tu n'as pas les droits ici ;)", "error"),
    whoami: () => printLine("visiteur"),
    matrix: () => {
        document.body.classList.toggle("matrix");
        printLine("Wake up... le mode Matrix a été basculé.", "ok");
    },
};
 
// Exécute une commande tapée (ou envoyée par un onglet)
function run(raw) {
    const text = raw.trim();
    if (text === "") return;
    count++;
    if (count >= 3) {
        astuce.classList.add("visible");
    }
 
    // Rappelle la commande dans l'historique
    const echo = document.createElement("p");
    echo.className = "line cmd";
    echo.innerHTML = '<span class="prompt">visiteur@portfolio:~$</span> ';
    echo.appendChild(document.createTextNode(text));
    output.appendChild(echo);
 
    const [name, ...args] = text.split(/\s+/);
    const fn = commands[name.toLowerCase()];
 
    if (fn) fn(args);
    else printLine(name + " : commande introuvable. Tape 'help'.", "error");
 
    terminal.scrollTop = terminal.scrollHeight;
}
 
// ---------- ÉVÉNEMENTS ----------
const history = [];
let historyIndex = 0;
 
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const value = input.value;
        if (value.trim()) { history.push(value); historyIndex = history.length; }
        run(value);
        input.value = "";
    } else if (e.key === "ArrowUp") {          // flèche haut = commande précédente
        if (historyIndex > 0) { historyIndex--; input.value = history[historyIndex]; }
        e.preventDefault();
    } else if (e.key === "ArrowDown") {
        if (historyIndex < history.length - 1) { historyIndex++; input.value = history[historyIndex]; }
        else { historyIndex = history.length; input.value = ""; }
        e.preventDefault();
    } else if (e.key === "Tab") {              // Tab = autocomplétion simple
        e.preventDefault();
        const typed = input.value.trim().toLowerCase();
        const match = Object.keys(commands).find((c) => c.startsWith(typed));
        if (typed && match) input.value = match;
    }
});
 
tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        tabButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        run(btn.dataset.cmd);
        input.focus();
    });
});
 
// Cliquer n'importe où dans le terminal remet le focus sur la ligne de commande
terminal.addEventListener("click", () => input.focus());
 
// ---------- DÉMARRAGE ----------
input.disabled = true;
printSlow(BOOT).then(() => {
    input.disabled = false;
    input.focus();
});