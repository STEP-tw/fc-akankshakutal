const fs = require("fs");
const Express = require("./express.js");
const {
  COMMENTS_FILE,
  ENCODING,
  HOMEDIR,
  HOMEPAGE,
  GUESTBOOKPAGE,
  MIME_TEXT_PLAIN,
  MIME_TYPES,
  NOTFOUND,
  USERIDS,
  SESSIONS
} = require("./constants.js");
const Comments = require("./comments.js");
let comments = new Comments(COMMENTS_FILE);
const app = new Express();

const GuestBook = require("./guestBook.js");
let guestBook = fs.readFileSync(GUESTBOOKPAGE, ENCODING);
let guestBookTemplate = new GuestBook(guestBook, comments);

let userIDs = fs.readFileSync(USERIDS, ENCODING);
userIDs = JSON.parse(userIDs);

let sessions = fs.readFileSync(SESSIONS, ENCODING);
sessions = JSON.parse(sessions);

const createUserIDCookie = function(res) {
  let userID = new Date().getTime();
  res.setHeader("Set-Cookie", `userId=${userID}`);
};

const getUserID = function(req) {
  const cookie = req.headers["cookie"];
  return +cookie.split("=")[1];
};

const updateUserIDs = function(req) {
  let userID = getUserID(req);
  if (!userIDs.includes(userID)) {
    userIDs.push(userID);
    fs.writeFile(USERIDS, JSON.stringify(userIDs), () => {});
  }
};

const readCookies = (req, res, next) => {
  const cookie = req.headers["cookie"];
  req.cookie = cookie;
  if (!cookie) {
    createUserIDCookie(res);
  } else {
    updateUserIDs(req);
  }
  next();
};

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
  let userID = getUserID(req);
  let userName = sessions[userID].replace(/\+/g, " ");
  let comment = req.body.replace(/\+/g, " ");
  comment = readArgs(comment);
  const date = new Date();
  comment.name = userName;
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
  let userID = getUserID(req);
  let userName = sessions[userID];
  guestBookForm = guestBookTemplate.withLogInForm();
  if (userName != undefined) {
    guestBookForm = guestBookTemplate.withCommentForm(userName);
  }
  send(res, 200, guestBookForm, "html");
};

const login = function(req, res) {
  let userName = readArgs(req.body).name;
  let userID = getUserID(req);
  sessions[userID] = userName;
  fs.writeFile(SESSIONS, JSON.stringify(sessions), () => {
    send(
      res,
      200,
      guestBookTemplate.afterLogIn(userName),
      resolveMIMEType("html")
    );
  });
};

const logout = function(req, res) {
  let userID = getUserID(req);
  sessions[userID] = undefined;
  fs.writeFile(SESSIONS, JSON.stringify(sessions), () => {
    send(res, 200, guestBookTemplate.afterLogOut(), resolveMIMEType("html"));
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
app.use(readCookies);
app.use(readBody);
app.use(logRequest);
app.get("/comments", handleCommentsReq);
app.get("/guestBook.html", renderGuestBook);
app.post("/guestBook.html", postComment);
app.post("/login", login);
app.post("/logout", logout);
app.use(serveFile);

// Export a function that can act as a handler

module.exports = app.handleRequest.bind(app);
