const fs = require("fs");
const Express = require("./express.js");
const {
  COMMENTS_FILE,
  HOMEDIR,
  HOMEPAGE,
  GUESTBOOKPAGE,
  MIME_TEXT_PLAIN,
  MIME_TYPES,
  NOTFOUND
} = require("./constants.js");
const Comments = require("./comments.js");
let comments = new Comments(COMMENTS_FILE);
const app = new Express();

const GuestBook = require("./guestBook.js");
let guestBook = fs.readFileSync(GUESTBOOKPAGE, "utf8");

let userIDs = fs.readFileSync("./private/userIDs.json", "utf8");
userIDs = JSON.parse(userIDs);

let sessions = fs.readFileSync("./private/sessions.json", "utf8");
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
    fs.writeFile("./private/userIDs.json", JSON.stringify(userIDs), () => {});
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
  let userName = sessions[userID];
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
    console.log(req.body);

    next();
  });
};

const renderGuestBook = function(req, res) {
  let userID = getUserID(req);
  let userName = sessions[userID];
  let guestBookForm = new GuestBook(guestBook, comments);
  guestBookForm = guestBookForm.withLogInForm();
  if (userName != undefined) {
    guestBookForm = new GuestBook(guestBook, comments);
    guestBookForm = guestBookForm.withCommentForm(userName);
  }
  send(res, 200, guestBookForm, "javascript");
};

const login = function(req, res) {
  let userName = readArgs(req.body).name;
  let userID = getUserID(req);
  sessions[userID] = userName;
  fs.writeFile("./private/sessions.json", JSON.stringify(sessions), () => {
    let guestBookForm = new GuestBook(guestBook, comments);
    send(res, 200, guestBookForm.afterLogIn(userName), "javascript");
  });
};

const logout = function(req, res) {
  let userID = getUserID(req);
  sessions[userID] = undefined;
  fs.writeFile("./private/data/sessions.json", JSON.stringify(sessions), () => {
    let guestBookForm = new GuestBook(guestBook, comments);
    send(res, 200, guestBookForm.afterLogOut(), "javascript");
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
app.post("/logOut", logout);
app.use(serveFile);

// Export a function that can act as a handler

module.exports = app.handleRequest.bind(app);
