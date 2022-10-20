const fs = require("fs"),
  path = require("path"),
  staticBasePath = "./public",
  directoryPath = "C:\\Users\\mike.meloy\\Pictures";

const staticServe = function (req, res) {
  const { url } = req,
    [, route = "public", fileName = "index.html"] = url.split("/");

  switch (route) {
    case "":
    case "public":
      file(res, fileName);
      break;
    case "api":
      api(res);
      break;
    case "download":
      download(res, req);
      break;
    case "folder":
      folder(res, req);
      break;
    case "log":
      log(res, req);
      res.end("success");
      break;
    case "file-upload":
      upload(res, req);
      break;
    default:
      res.end("404");
      break;
  }
};

const api = async function (res) {
  try {
    const files = await getFolders(directoryPath);
    const jsonContent = JSON.stringify(files);
    res.end(jsonContent);
  } catch (error) {
    res.end(error);
  }
};

const folder = (res, req) => {
  let link = "";

  req.on("data", (data) => {
    link += data;
  });

  req.on("end", async function () {
    const files = await getFolders(link);
    const jsonContent = JSON.stringify(files);
    res.end(jsonContent);
  });
};

const download = (res, req) => {
  let link = "";

  req.on("data", (data) => {
    link += data;
  });

  req.on("end", () => {
    const rs = fs.createReadStream(link);
    res.setHeader("Content-Disposition", "attachment; fsh.jpg");
    rs.pipe(res);
  });
};

const file = (res, fileName) => {
  const resolvedBase = path.resolve(staticBasePath),
    safeSuffix = path.normalize(fileName).replace(/^(\.\.[\/\\])+/, ""),
    fileLoc = path.join(resolvedBase, safeSuffix),
    stream = fs.createReadStream(fileLoc),
    ext = fileName?.split(".").at(-1);

  stream.on("error", function (error) {
    res.writeHead(404, "Not Found");
    res.write("404: File Not Found!");
    res.end();
  });

  switch (ext) {
    case "js":
      res.setHeader("Content-Type", "text/javascript");
      break;
    case "html":
      res.setHeader("Content-Type", "text/html");
      break;
    case "css":
      res.setHeader("Content-Type", "text/css");
      break;
    case "png":
      res.setHeader("Content-Type", "image/png");
      break;
    case "ico":
      res.setHeader("Content-Type", "image/x-icon");
      break;
    default:
      res.setHeader("Content-Type", "text/plain");
      break;
  }

  res.statusCode = 200;
  stream.pipe(res);
};

const getFolders = (nPath) => {
  return new Promise((res, rej) => {
    const fileObjs = [];
    fs.readdir(nPath, (err, files) => {
      if (err) {
        return rej(err);
      }

      files.forEach((file) => {
        fileObjs.push({
          name: file,
          url: `${nPath}/${file}`,
          isFile: file.includes("."),
        });
      });
      res(fileObjs);
    });
  });
};

const log = (_, req) => {
  let logMessage = "";

  req.on("data", (data) => {
    logMessage += data;
  });

  req.on("end", () => fs.writeFileSync("logger.txt", logMessage));
};

const upload = (res, req) => {
  const requestBody = [];
  req.on("data", (chunks) => {
    requestBody.push(chunks);
  });
  req.on("end", () => {
    const parsedData = Buffer.concat(requestBody).toString();
    const username = parsedData.split("=")[1];
    fs.writeFileSync("username.txt", parsedData);
  });
  res.end("");
};

module.exports = { staticServe };
