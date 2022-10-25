const dataAttUrl = "data-file",
  dataAttClicked = "data-clicked",
  app = document.getElementById("app"),
  container = document.getElementById("file-list"),
  dwnLoad = document.getElementById("file-download"),
  input = document.getElementById("file-download-input"),
  label = document.querySelector(".file-download-input");

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

const onLabelClick = (event) => {
  const { target, clientX, clientY } = event,
    { x, y } = target.getBoundingClientRect();

  createRipple(target, clientX - x, clientY - y);
};

label.addEventListener("click", onLabelClick);

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
  let touchStartTime, clientX, clientY;

  app.addEventListener("touchstart", ({ touches }) => {
    const [touch] = touches;
    touchStartTime = Date.now();

    clientY = touch.clientY;
    clientX = touch.clientX;
  });

  app.addEventListener("touchend", ({ changedTouches }) => {
    const [touch] = changedTouches,
      touchEndTime = Date.now(),
      diffX = clientX - touch.clientX,
      diffY = Math.abs(clientY - touch.clientY),
      timeDiff = touchEndTime - touchStartTime,
      swipeLeft = diffX > 0;

    if (diffY > 50 || timeDiff < 200) {
      return;
    }

    container.setAttribute("data-hidden", swipeLeft);
    dwnLoad.setAttribute("data-hidden", !swipeLeft);
  });
};

const setupFileDownload = () => {
  input.addEventListener("change", async ({ target }) => {
    const { files } = target,
      formData = new FormData();
    const arr = Array.from(files);
    arr.forEach((file) => formData.append("file", file));

    const response = await fetch("file-upload", {
      method: "POST",
      body: formData,
    });
    const { files: returned } = await response.json();
    const [ul] = document.getElementsByTagName("ul");
    [...returned].forEach((f) => {
      const li = document.createElement("li");
      li.innerText = f.originalFilename;

      ul.appendChild(li);
    });
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
