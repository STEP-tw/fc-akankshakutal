const fs = require("fs");
const Express = require("./express.js");
const {
  COMMENTS_FILE,
  HOMEDIR,
  HOMEPAGE,
  GUESTBOOKPAGE,
  MIME_TEXT_PLAIN,
  MIME_TYPES,
  COMMENTS_PLACEHOLDER,
  NOTFOUND
} = require("./constants.js");
const Comments = require("./comments.js");
let comments = new Comments(COMMENTS_FILE);
const app = new Express();

const loadUserComments = () => {
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
      send(res, 404, NOTFOUND, contentType);
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

const writeComment = function(req, res, comment) {
  comments.addComment(comment);
  renderGuestBook(req, res);
};

const postComment = function(req, res) {
  let comment = req.body.replace(/\+/g, " ");
  comment = readArgs(comment);
  const date = new Date();
  comment.date = date;
  writeComment(req, res, comment);
};

const readBody = (req, res, next) => {
  let content = "";
  req.on("data", chunk => (content += chunk));
  req.on("end", () => {
    req.body = unescape(content);
    next();
  });
};

const renderGuestBook = function(req, res) {
  let commentHTML = comments.toHTML();
  fs.readFile(GUESTBOOKPAGE, (err, data) => {
    if (err) {
      send(res, 404, NOTFOUND, contentType);
      return;
    }
    let guestBook = data.toString().replace(COMMENTS_PLACEHOLDER, commentHTML);
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
  send(
    res,
    200,
    JSON.stringify(comments.getComments()),
    resolveMIMEType("json")
  );
};

loadUserComments();

app.use(readBody);
app.use(logRequest);
app.get("/comments", handleCommentsReq);
app.get("/guestBook.html", renderGuestBook);
app.post("/guestBook.html", postComment);
app.use(serveFile);

// Export a function that can act as a handler

module.exports = app.handleRequest.bind(app);
