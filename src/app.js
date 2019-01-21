const fs = require("fs");
const Express = require("./express.js");
const {
  COMMENTS_FILE,
  ENCODING,
  HOMEDIR,
  HOMEPAGE,
  GUESTBOOKPAGE
} = require("./constants.js");
const decodingKeys = require("./decoding.json");
const app = new Express();

const readComments = function(req, res, next) {
  if (!fs.existsSync(COMMENTS_FILE)) {
    fs.writeFileSync(COMMENTS_FILE, "[]", ENCODING);
  }
  fs.readFile(COMMENTS_FILE, (err, data) => {
    comments = JSON.parse(data);
    next();
  });
};

const send = function(res, statusCode, content) {
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
  fs.readFile(`${url}`, (err, data) => {
    if (err) {
      send(res, 404, "Not Found");
      return;
    }
    send(res, 200, data);
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

const writeContent = function(commentData, req, res) {
  comments.unshift(commentData);
  fs.writeFile(COMMENTS_FILE, JSON.stringify(comments), err => {
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
  writeContent(commentData, req, res);
};

const readBody = (req, res, next) => {
  let content = "";
  req.on("data", chunk => (content += chunk));
  req.on("end", () => {
    req.body = content;
    next();
  });
};

const createCommentsSection = function({ date, name, comment }) {
  return `<p>${date}: <strong>${name}</strong> : ${comment}</p>`;
};

const generateCommentTable = function(contents) {
  let html = contents.map(content => createCommentsSection(content));
  return html.join("");
};

const renderGuestBook = function(req, res) {
  fs.readFile(COMMENTS_FILE, (err, data) => {
    const commentsData = JSON.parse(data);
    let comments = generateCommentTable(commentsData);
    comments = decodeText(comments);
    fs.readFile(GUESTBOOKPAGE, (err, data) => {
      if (err) throw err;
      let guestBook = data.toString().replace("#####", comments);
      send(res, 200, guestBook);
    });
  });
};

const logRequest = (req, res, next) => {
  console.log(req.method, req.url);
  next();
};

const handleCommentsReq = function(req, res) {
  let comments = fs.readFileSync(COMMENTS_FILE);
  send(res, 200, comments.toString());
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
