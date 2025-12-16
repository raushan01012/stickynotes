
const notesKey = "sticky_notes_v2";

const notesContainer = document.getElementById("notesContainer");
const pinnedSection = document.getElementById("pinnedSection");
const createBtn = document.getElementById("createBtn");
const colorSelect = document.getElementById("colorSelect");
const searchInput = document.getElementById("search");

let notes = []; // array of {id, content, color, pinned, createdAt}

function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* -------- Storage helpers -------- */
function saveNotes() {
    localStorage.setItem(notesKey, JSON.stringify(notes));
}

function loadNotes() {
    const raw = localStorage.getItem(notesKey);
    notes = raw ? JSON.parse(raw) : [];
}


function createNoteElement(note) {
    const el = document.createElement("article");
    el.className = "note";
    el.dataset.id = note.id;
    el.style.background = note.color;


    const content = document.createElement("div");
    content.className = "content";
    content.contentEditable = "true";
    content.spellcheck = false;
    content.innerText = note.content || "";
    content.addEventListener("input", () => {

        note.content = content.innerText;
        saveNotes();
        autoResize(content);
    });


    const actions = document.createElement("div");
    actions.className = "actions";


    const pinBtn = document.createElement("button");
    pinBtn.className = "icon-btn icon-pin";
    pinBtn.title = note.pinned ? "Unpin" : "Pin";
    pinBtn.innerHTML = note.pinned ? "📌" : "📍";
    if (note.pinned) pinBtn.classList.add("active");
    pinBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        note.pinned = !note.pinned;
        saveNotes();
        renderAll();
    });


    const dlBtn = document.createElement("button");
    dlBtn.className = "icon-btn";
    dlBtn.title = "Download (.pdf)";
    dlBtn.innerHTML = "⬇️";
    dlBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        downloadNoteAsTxt(note);
    });


    const delBtn = document.createElement("button");
    delBtn.className = "icon-btn";
    delBtn.title = "Delete note";
    delBtn.innerHTML = "🗑️";
    delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm("Delete this note?")) {
            notes = notes.filter(n => n.id !== note.id);
            saveNotes();
            renderAll();
        }
    });

    actions.appendChild(pinBtn);
    actions.appendChild(dlBtn);
    actions.appendChild(delBtn);

    el.appendChild(content);
    el.appendChild(actions);


    setTimeout(() => autoResize(content), 0);

    return el;
}

function renderAll(filter = "") {

    notesContainer.innerHTML = "";
    pinnedSection.innerHTML = "";


    const q = (filter || "").trim().toLowerCase();


    const pinned = notes.filter(n => n.pinned && (!q || n.content.toLowerCase().includes(q)));
    const others = notes.filter(n => !n.pinned && (!q || n.content.toLowerCase().includes(q)));

    pinned.forEach(note => pinnedSection.appendChild(createNoteElement(note)));
    others.forEach(note => notesContainer.appendChild(createNoteElement(note)));
}


function autoResize(el) {
    // let content decide height — reset then set
    el.style.height = "auto";
    const height = el.scrollHeight;
    el.style.height = height + "px";
}

function downloadNoteAsTxt(note) {
    const text = note.content || "";
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `note-${note.id}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}


createBtn.addEventListener("click", () => {
    const color = colorSelect.value || "#FFFB7D";
    const newNote = {
        id: uid(),
        content: "",
        color,
        pinned: false,
        createdAt: Date.now()
    };
    notes.unshift(newNote);
    saveNotes();
    renderAll(searchInput.value);

    setTimeout(() => {
        const el = document.querySelector(`[data-id="${newNote.id}"] .content`);
        if (el) { el.focus(); }
    }, 60);
});

searchInput.addEventListener("input", (e) => {
    renderAll(e.target.value);
});


window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        createBtn.click();
    }
});


loadNotes();
renderAll();
