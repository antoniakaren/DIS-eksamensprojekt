// -------- FRONTEND OPSLAG HANDLING --------
console.log("uploads.js LOADED!");

const postText = document.getElementById("postText");
const postImage = document.getElementById("postImage");
const dropZone = document.getElementById("dropZone");
dropZone.addEventListener("click", () => {
    postImage.click(); 
});
const preview = document.getElementById("preview");
const postButton = document.getElementById("postButton");

let images = []; // array af File-objekter

// Opdater knap & tekstlængde
function updateState() {
  postButton.disabled = !(postText.value.trim() || images.length);
}

// Render preview grid
function renderPreview() {
  preview.innerHTML = "";

  images.forEach((file, idx) => {
    const url = URL.createObjectURL(file);

    const wrap = document.createElement("div");
    wrap.className = "preview__item";

    const img = document.createElement("img");
    img.src = url;

    const del = document.createElement("button");
    del.className = "preview__remove";
    del.textContent = "Fjern";
    del.addEventListener("click", () => {
      images.splice(idx, 1);
      renderPreview();
      updateState();
      URL.revokeObjectURL(url);
    });

    wrap.appendChild(img);
    wrap.appendChild(del);
    preview.appendChild(wrap);
  });
}

// Når man vælger billede via klik
postImage.addEventListener("change", (e) => {
  const files = [...e.target.files];
  if (files.length) {
    images = images.concat(files);
    renderPreview();
    updateState();
  }
});

// Drag & Drop events
["dragenter", "dragover"].forEach((ev) =>
  dropZone.addEventListener(ev, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add("dropzone--active");
  })
);

["dragleave", "drop"].forEach((ev) =>
  dropZone.addEventListener(ev, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove("dropzone--active");
  })
);

// Når filer droppes
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  e.stopPropagation();

  const files = [...e.dataTransfer.files].filter((f) =>
    f.type.startsWith("image/")
  );

  if (files.length) {
    images = images.concat(files);
    renderPreview();
    updateState();
  }

  // Put the file in the hidden input so it uploads normally
  if (images.length > 0) {
    const dt = new DataTransfer();
    dt.items.add(images[0]); // kun 1 billede til backend upload
    postImage.files = dt.files;
  }
});

// Event: tekst skrives
postText.addEventListener("input", updateState);

// Init
updateState();
