const COMMENTS_FILE = "./private/comments.json";
const ENCODING = "utf8";
const HOMEPAGE = "./publicHtml/index.html";
const HOMEDIR = "./publicHtml";
const GUESTBOOKPAGE = "./publicHtml/guestBook.html";
const MIME_TEXT_PLAIN = "text/plain";
const COMMENTS_PLACEHOLDER = "#####";
const NOTFOUND = "not found";
const MIME_TYPES = {
  css: "text/css",
  html: "text/html",
  js: "text/javascript",
  csv: "text/csv",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  json: "application/json",
  png: "image/png",
  xml: "text/xml",
  pdf: "application/pdf"
};

module.exports = {
  COMMENTS_FILE,
  ENCODING,
  HOMEPAGE,
  HOMEDIR,
  GUESTBOOKPAGE,
  COMMENTS_PLACEHOLDER,
  MIME_TEXT_PLAIN,
  MIME_TYPES,
  NOTFOUND
};
