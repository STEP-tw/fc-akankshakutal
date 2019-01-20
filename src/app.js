const fs = require("fs");
const Express = require("./express.js");
const app = new Express();
const decodingKeys = require("./decoding.json");
let comments;

const readComments = function(req, res, next) {
  if (!fs.existsSync("./private/comments.json")) {
    fs.writeFileSync("./private/comments.json", "[]", "utf-8");
  }
  fs.readFile("./private/comments.json", (err, data) => {
    comments = JSON.parse(data);
    next();
  });
};

const send = function(res, content, statusCode = 200) {
  res.statusCode = statusCode;
  res.write(content);
  res.end();
};

const createPrefixPath = prefix => {
  return url => prefix + url;
};

const getFilePath = function(url) {
  if (url == "/") return "./publicHtml/index.html";
  const addPrefix = createPrefixPath("./publicHtml");
  return addPrefix(url);
};

const serveFile = (req, res) => {
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
  comments.unshift(commentData);
  fs.writeFile("./private/comments.json", JSON.stringify(comments), err => {
    if (err) console.log(err);
    renderGuestBook(req, res);
  });
};

const decodeText = content => {
  let result = content;
  Object.keys(decodingKeys).forEach(x => {
    result = result.replace(new RegExp(`\\${x}`, "g"), decodingKeys[x]);
  });
  return result;
};

const postContent = function(req, res, next) {
  let commentData = decodeText(req.body);
  commentData = readArgs(commentData);
  const date = new Date().toLocaleString();
  commentData.date = date;
  appendContent(commentData, req, res);
};

const readBody = (req, res, next) => {
  let content = "";
  req.on("data", chunk => (content += chunk));
  req.on("end", () => {
    req.body = content;
    next();
  });
};

const generateCommentTable = function(contents) {
  let table = "<table id='comment'>";
  let tr = contents.map(content => {
    return `<tr><td>${content.date}</td><td>${content.name}</td><td>${
      content.comment
    }</td></tr>`;
  });
  return table + tr.join("") + "</table>";
};

const renderGuestBook = function(req, res) {
  fs.readFile("./private/comments.json", (err, data) => {
    const commentsData = JSON.parse(data);
    fs.readFile("./publicHtml/guestBook.html", (err, data) => {
      if (err) throw err;
      const upperPart = data;
      const lowerPart = generateCommentTable(commentsData);
      send(res, upperPart + lowerPart, 200);
    });
  });
};

const logRequest = (req, res, next) => {
  console.log(req.method, req.url);
  next();
};

const handleCommentsReq = function(req, res, next) {
  let comments = fs.readFileSync("./private/comments.json");
  send(res, comments.toString());
};

app.use(readBody);
app.use(logRequest);
app.use(readComments);
app.get("/comments", handleCommentsReq);
app.get("/guestBook.html", renderGuestBook);
app.post("/guestBook.html", postContent);
app.use(serveFile);

// Export a function that can act as a handler

module.exports = app.handleRequest.bind(app);
