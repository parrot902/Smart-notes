let categories = JSON.parse(localStorage.getItem("cats")) || [
  "sport",
  "work",
  "ideas",
  "personal",
  "home",
];
let notes = JSON.parse(localStorage.getItem("notes")) || [];

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

function saveCats() {
  localStorage.setItem("cats", JSON.stringify(categories));
}

const list = document.getElementById("notesList");
const addBtn = document.getElementById("addNoteBtn");
const noteName = document.getElementById("noteName");
const noteDesc = document.getElementById("noteDesc");
const noteCategory = document.getElementById("noteCategory");
const noteDeadline = document.getElementById("noteDeadline");

const newCategoryName = document.getElementById("newCategoryName");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const filterCategory = document.getElementById("filterCategory");
const filterDeadline = document.getElementById("filterDeadline");
const filterStatus = document.getElementById("filterStatus");
const searchName = document.getElementById("searchName");

addBtn.addEventListener("click", () => {
  const name = noteName.value.trim();
  const desc = noteDesc.value.trim();
  const dline = noteDeadline.value;
  const categor = noteCategory.value;

  if (!name || !desc || !dline) return;

  const note = {
    id: Date.now(),
    name,
    desc,
    dline,
    time: new Date().toLocaleDateString(),
    categor,
    status: "in progress",
  };
  noteName.value = "";
  noteDesc.value = "";
  noteDeadline.value = "";
  notes.push(note);
  saveNotes();
  render();
});

addCategoryBtn.addEventListener("click", () => {
  const cat = newCategoryName.value.trim().toLowerCase();
  if (cat && !categories.includes(cat)) {
    categories.push(cat);
    saveCats();
    renderCategories();
  }
  newCategoryName.value = "";
});

function renderCategories() {
  filterCategory.innerHTML = '<option value="all">All</option>';
  noteCategory.innerHTML = "";
  const removeArea = document.getElementById("fordelcats");
  removeArea.innerHTML = "";

  categories.forEach((cat) => {
    const option1 = new Option(cat, cat);
    const option2 = new Option(cat, cat);
    filterCategory.append(option1);
    noteCategory.append(option2);

    const catDiv = document.createElement("div");
    catDiv.textContent = cat;
    removeArea.append(catDiv);

    catDiv.addEventListener("click", () => {
      categories = categories.filter((c) => c !== cat);
      saveCats();
      renderCategories();
      render();
    });
  });
}
renderCategories();

function isWasted(note) {
  return new Date(note.dline) < new Date() && note.status !== "done";
}

function render() {
  list.innerHTML = "";
  count();

  let filtered = [...notes];

  // Search filter
  const search = searchName.value.trim().toLowerCase();
  if (search) {
    filtered = filtered.filter((note) =>
      note.name.toLowerCase().includes(search)
    );
  }

  if (filterCategory.value !== "all") {
    filtered = filtered.filter((note) => note.categor === filterCategory.value);
  }

  if (filterStatus.value) {
    filtered = filtered.filter((note) => note.status === filterStatus.value);
  }

  if (filterDeadline.value === "nearest") {
    filtered.sort((a, b) => new Date(a.dline) - new Date(b.dline));
  }
  if (filterDeadline.value === "furthest") {
    filtered.sort((a, b) => new Date(b.dline) - new Date(a.dline));
  }
  if (notes.length === 0) {
    list.innerHTML = `
  <p class="noned" style='color: gray;'>No notes...</p>
  `;

    list.style.display = "flex";
    list.style.alignItems = "center";
    list.style.justifyContent = "center";
  }

  filtered.forEach((note) => {
    const item = document.createElement("li");

    const strng = document.createElement("strong");
    strng.textContent = note.name + "  •";
    const strngd = document.createElement("span");
    strngd.textContent = note.desc;
    strngd.className = "desc";
    const smld = document.createElement("small");
    smld.textContent = "Deadline: " + new Date(note.dline).toLocaleDateString();
    const smlc = document.createElement("small");
    smlc.textContent = "Category: " + note.categor;
    const smls = document.createElement("small");
    smls.textContent = "Status: " + note.status;
    createEditable(strng, note, "name");
    createEditable(strngd, note, "desc");
    createEditable(smld, note, "dline");
    if (note.status === "done") {
      smls.classList.toggle("done");
    } else {
      smls.classList.toggle("inpr");
    }

    const daysLeft =
      (new Date(note.dline) - new Date()) / (1000 * 60 * 60 * 24);

    if (daysLeft < 2) {
      smld.style.color = "red";
    } else if (daysLeft < 5) {
      smld.style.color = "orange";
    }
    if (isWasted(note)) {
      smls.textContent = "Status: wasted";
      smls.style.color = "red";
    }

    const itl = document.createElement("div");
    const it = document.createElement("div");
    itl.append(strng);
    itl.append(strngd);

    it.append(smld);
    it.append(smlc);
    it.append(smls);

    const itemr = document.createElement("div");
    item.append(itl);
    itemr.append(it);

    const toggle = document.createElement("button");
    toggle.textContent = note.status === "done" ? "↺" : "✔";
    toggle.addEventListener("click", () => {
      note.status = note.status === "done" ? "in progress" : "done";
      saveNotes();
      render();
    });
    const del = document.createElement("button");
    del.textContent = "✖";
    del.addEventListener("click", () => {
      if (confirm("delete this note ?")) {
        notes = notes.filter((n) => n.id !== note.id);
        saveNotes();
        render();
      }
    });

    const btns = document.createElement("div");
    if (!isWasted(note)) {
      btns.append(toggle);
    } else {
      strng.style.textDecoration = "line-through";
      strngd.style.textDecoration = "line-through";

      smls.style.color = "red";
    }
    btns.append(del);

    itemr.append(btns);
    item.append(itemr);
    list.append(item);
  });
}
function createEditable(element, note, field) {
  element.addEventListener("click", () => {
    const input =
      field === "desc"
        ? document.createElement("textarea")
        : document.createElement("input");

    if (field === "dline") {
      input.type = "date";
    }

    if (field === "desc") input.className = "re";

    input.value = note[field];
    element.replaceWith(input);
    input.focus();

    input.addEventListener("blur", () => {
      const newVal = input.value.trim();
      if (newVal) {
        note[field] = newVal;

        saveNotes();
      }

      render();
    });
  });
}
const ins = document.getElementById("ins");
function count() {
  const total = notes.length;
  const done = notes.filter((n) => n.status === "done").length;
  const inpro = notes.filter((n) => n.status === "in progress").length;
  const wast = notes.filter((n) => isWasted(n)).length;
  const old = document.getElementById("counter");
  if (old) old.remove();

  const dib = document.createElement("div");
  dib.id = "counter";
  dib.innerHTML = `
  <small>Done: ${done}/${total}</small>
  <small>In progress: ${inpro}/${total}</small>
  <small>Wasted: ${wast}/${total}</small> 
  `;
  ins.append(dib);
}
filterCategory.addEventListener("change", render);
filterDeadline.addEventListener("change", render);
filterStatus.addEventListener("change", render);
searchName.addEventListener("input", render);
render();
