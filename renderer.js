const app = document.getElementById("app");

window.electronAPI.getQrCode().then((result) => {
  const img = document.createElement("img");
  img.src = result;
  app.appendChild(img);
});
