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

const readFile = (req, res) => {
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

const appendContent = function(content) {
  fs.appendFile("data.txt", content, function(err) {
    if (err) throw err;
    console.log(content);
  });
};

const readBody = (req, res, next) => {
  let content = "";
  req.on("data", chunk => (content += chunk));
  req.on("end", () => {
    content = readArgs(content);
    appendContent(JSON.stringify(content));
    next();
  });
};

app.use(readBody);
app.use(readFile);

// Export a function that can act as a handler

module.exports = app.handleRequest.bind(app);
