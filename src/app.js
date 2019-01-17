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

const appendContent = function(req, res) {
  fs.appendFile("data.txt", JSON.stringify(req.body), function(err) {
    if (err) throw err;
    console.log("Saved");
  });
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

const appendToHtml = function(req, res) {
  let contents = "";
  fs.readFile("./publicHtml/guestBook.html", function(err, data) {
    if (err) throw err;
    contents = data;
  });
  fs.readFile("data.txt", function(err, data) {
    if (err) throw err;
    contents = data;
  });
  console.log(contents);
  send(res, contents);
};

app.use(readBody);
app.post("/guestBook", appendContent);
app.get("/guestBook", appendToHtml);
app.use(renderContents);

// Export a function that can act as a handler

module.exports = app.handleRequest.bind(app);
