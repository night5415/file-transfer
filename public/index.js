document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("btn").addEventListener("click", (e) => {
    fetch("data")
      .then((r) => {
        console.dir(r);
      })
      .catch((e) => console.error(e));
  });
});
