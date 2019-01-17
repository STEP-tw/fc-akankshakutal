const fs = require("fs");
const Express = require("./express.js");
const app = new Express();

const send = function(res, content, statusCode = 200) {
  res.statusCode = statusCode;
  res.write(content);
  res.end();
};

const getFilePath = function(url) {
  if (url == "/") return "./publicHtml/index.html";
  return "./publicHtml" + url;
};

const renderContents = (req, res) => {
  const url = getFilePath(req.url);
  fs.readFile(`${url}`, (err, data) => {
    if (err) {
      send(res, "Not Found", 404);
      return;
    }
    send(res, data);
  });
};

const readArgs = content => {
  let args = {};
  const splitKeyValue = pair => pair.split("=");
  const assignKeyValueToArgs = ([key, value]) => (args[key] = value);
  content
    .split("&")
    .map(splitKeyValue)
    .forEach(assignKeyValueToArgs);
  return args;
};

const appendContent = function(commentData, req, res) {
  fs.appendFile("./data.json", JSON.stringify(commentData) + ",", function(
    err
  ) {
    if (err) throw err;
    console.log("Saved");
  });
};

const postContent = function(req, res, next) {
  const commentData = req.body;
  const date = new Date().toLocaleString();
  commentData.date = date;
  appendContent(commentData, req, res);
  next();
};

const readBody = (req, res, next) => {
  let content = "";
  req.on("data", chunk => (content += chunk));
  req.on("end", () => {
    content = readArgs(content);
    req.body = content;
    next();
  });
};

const generateHTML = function(contents) {
  contents = JSON.parse(contents);
  let html = "<table>";
  for (const content of contents) {
    html += `<tr><td>${content.date}_</td><td>${content.name}_</td><td>${
      content.comment
    }</td></tr>`;
  }
  return html + "</table>";
};

const render = function(req, res) {
  fs.readFile("./data.json", (err, data) => {
    const commentsData = JSON.parse("[" + data.slice(0, -1) + "]");
    let upperPart = "";
    fs.readFile("./publicHtml/guestBook.html", (err, data) => {
      if (err) throw err;
      upperPart += data;
      let lowerPart = JSON.stringify(commentsData);
      lowerPart = generateHTML(lowerPart);
      send(res, upperPart + lowerPart, 200);
    });
  });
};

const logRequest = (req, res, next) => {
  console.log(req.method, req.url);
  next();
};

app.use(readBody);
app.use(logRequest);
app.get("/guestBook.html", render);
app.post("/guestBook.html", postContent);
app.post("/guestBook.html", render);
app.use(renderContents);

// Export a function that can act as a handler

module.exports = app.handleRequest.bind(app);
