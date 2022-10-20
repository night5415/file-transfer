const dataAttUrl = "data-file",
  dataAttClicked = "data-clicked",
  container = document.getElementById("file-list"),
  dwnLoad = document.getElementById("file-download"),
  input = document.getElementById("test");

const onFileClick = (event) => {
  const { target, clientX, clientY } = event,
    { x, y } = target.getBoundingClientRect(),
    url = target.getAttribute(dataAttUrl),
    clicked = target.getAttribute(dataAttClicked) ?? false;

  if (clicked) {
    alert("file has already been downloaded");
    return;
  }

  createRipple(target, clientX - x, clientY - y);

  target.setAttribute(dataAttClicked, true);
  fetch(`download`, { method: "POST", body: url })
    .then((r) => r.blob())
    .then((data) => {
      const anchor = document.createElement("a");
      anchor.href = window.URL.createObjectURL(data);
      anchor.download = target.innerText;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    })
    .catch((e) => {
      console.error(e);
      logger(e);
    });
};

const onFolderClick = (event) => {
  const { target, clientX, clientY } = event,
    { x, y } = target.getBoundingClientRect(),
    data = target.getAttribute(dataAttUrl),
    clicked = Boolean(target.getAttribute(dataAttClicked));

  createRipple(target, clientX - x, clientY - y);

  if (clicked) {
    const { nextElementSibling } = target;
    target.removeAttribute(dataAttClicked);
    nextElementSibling.style.maxHeight = 0;
    setTimeout(() => {
      nextElementSibling.remove();
    }, 2000);
    return;
  }

  target.setAttribute(dataAttClicked, true);
  fetch(`folder`, { method: "POST", body: data })
    .then((res) => res.json())
    .then((res) => {
      if (Array.isArray(res)) {
        const subContainer = document.createElement("span");
        subContainer.classList.add("sub-container");
        res.forEach((data) => {
          const { name, url, isFile } = data,
            child = document.createElement("div"),
            clickBasedOnType = isFile ? onFileClick : onFolderClick;

          child.innerText = name;
          child.setAttribute(dataAttUrl, url);
          child.setAttribute("data-isfile", data.isFile);
          child.addEventListener("click", clickBasedOnType);
          subContainer.appendChild(child);
        });
        target.parentNode.insertBefore(subContainer, target.nextSibling);
        setTimeout(() => {
          subContainer.style.maxHeight = "100vh";
        }, 20);
      } else {
        alert("nothing found");
      }
    })
    .catch((e) => {
      alert("Fetch fail");
      logger(e);
    });
};

const onApiCall = () => {
  fetch("api/data")
    .then((res) => res.json())
    .then((res) => {
      if (Array.isArray(res)) {
        res.forEach((data) => {
          const { name, url, isFile } = data,
            child = document.createElement("div"),
            clickBasedOnType = isFile ? onFileClick : onFolderClick;

          child.innerText = name;
          child.setAttribute(dataAttUrl, url);
          child.setAttribute("data-isfile", data.isFile);
          child.addEventListener("click", clickBasedOnType);
          container.appendChild(child);
        });
      } else {
        alert("nothing found");
      }
    })
    .catch((e) => {
      alert("Fetch fail");
      console.error(e);
    });
};

const createRipple = (target, x, y) => {
  const ripple = document.createElement("span");
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.classList.add("ripple");

  target.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 2000);
};

const detectSwipe = () => {
  let touchStartTime,
    touchEndTime,
    clientX,
    clientY,
    app = document.getElementById("app");

  app.addEventListener("touchstart", ({ touches }) => {
    const [touch] = touches;
    touchStartTime = Date.now();

    clientY = touch.clientY;
    clientX = touch.clientX;
  });

  app.addEventListener("touchend", (e) => {
    touchEndTime = Date.now();

    const endClientX = e.changedTouches[0].clientX;

    if (touchEndTime - touchStartTime <= 200) {
    } else if (clientX - endClientX <= -100) {
      dwnLoad.setAttribute("data-hidden", true);
      container.setAttribute("data-hidden", false);
      console.log("swipe right");
    } else {
      container.setAttribute("data-hidden", true);
      dwnLoad.setAttribute("data-hidden", false);
      console.log("swipe left");
    }
  });
};

const setupFileDownload = () => {
  input.addEventListener("change", async ({ target }) => {
    const { files } = target,
      formData = new FormData();

    formData.append("file", files[0]);

    const response = await fetch("file-upload", {
      method: "POST",
      body: formData,
    });
    console.dir(response);
  });
};

onApiCall();
detectSwipe();
setupFileDownload();

if ("serviceWorker" in navigator) {
  try {
    const registration = await navigator.serviceWorker.register("public/sw.js");
    if (registration.installing) {
      console.log("Service worker installing");
    } else if (registration.waiting) {
      console.log("Service worker installed");
    } else if (registration.active) {
      console.log("Service worker active");
    }
  } catch (error) {
    console.error(`Registration failed with ${error}`);
  }
}

const logger = (message) => {
  fetch(`log`, { method: "POST", body: JSON.stringify(message) });
};
