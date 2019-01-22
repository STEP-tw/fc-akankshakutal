const fs = require("fs");
const Express = require("./express.js");
const {
  HOMEDIR,
  HOMEPAGE,
  GUESTBOOKPAGE,
  MIME_TEXT_PLAIN,
  MIME_TYPES
} = require("./constants.js");
const Comments = require("./comments.js");
let comments = new Comments();
const app = new Express();

const loadUserComments = () => {
  comments.writeCommentsToFile();
  comments.readComments();
};

const send = function(res, statusCode, content, contentType) {
  res.setHeader("Content-Type", contentType);
  res.statusCode = statusCode;
  res.write(content);
  res.end();
};

const createPrefixPath = prefix => {
  return url => prefix + url;
};

const getFilePath = function(url) {
  if (url == "/") return HOMEPAGE;
  const addPrefix = createPrefixPath(HOMEDIR);
  return addPrefix(url);
};

const serveFile = (req, res) => {
  const url = getFilePath(req.url);
  fs.readFile(url, (err, data) => {
    let fileExtension = getFileExtension(url);
    let contentType = resolveMIMEType(fileExtension);
    if (err) {
      send(res, 404, "Not Found", contentType);
      return;
    }
    send(res, 200, data, contentType);
  });
};

const resolveMIMEType = function(fileExtension) {
  return MIME_TYPES[fileExtension] || MIME_TEXT_PLAIN;
};

const getFileExtension = function(fileName) {
  return fileName.split(".").pop();
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

const writeContent = function(req, res, commentData) {
  comments.addComment(commentData);
  renderGuestBook(req, res);
};

const postContent = function(req, res) {
  let commentData = unescape(req.body);
  commentData = commentData.replace(/\+/g, " ");
  commentData = readArgs(commentData);
  const date = new Date();
  commentData.date = date;
  writeContent(req, res, commentData);
};

const readBody = (req, res, next) => {
  let content = "";
  req.on("data", chunk => (content += chunk));
  req.on("end", () => {
    req.body = content;
    next();
  });
};

const renderGuestBook = function(req, res) {
  let commentData = comments.toHTML();
  commentData = unescape(commentData);
  fs.readFile(GUESTBOOKPAGE, (err, data) => {
    if (err) throw err;
    let guestBook = data.toString().replace("#####", commentData);
    let fileExtension = getFileExtension(GUESTBOOKPAGE);
    let contentType = resolveMIMEType(fileExtension);
    send(res, 200, guestBook, contentType);
  });
};

const logRequest = (req, res, next) => {
  console.log(req.method, req.url);
  next();
};

const handleCommentsReq = function(req, res) {
  send(res, 200, JSON.stringify(comments.getComments()), MIME_TYPES["json"]);
};

loadUserComments();

app.use(readBody);
app.use(logRequest);
app.get("/comments", handleCommentsReq);
app.get("/guestBook.html", renderGuestBook);
app.post("/guestBook.html", postContent);
app.use(serveFile);

// Export a function that can act as a handler

module.exports = app.handleRequest.bind(app);
