const app = document.getElementById("app"),
  txt = document.getElementById("txtColor");

window.electronAPI.getQrCode().then((result) => {
  const img = document.createElement("img");
  img.src = result;
  app.appendChild(img);
});

txt.addEventListener("change", ({ target: { value } }) =>
  window.electronAPI.sendColor(value)
);
