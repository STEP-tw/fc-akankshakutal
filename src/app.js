const fs = require("fs");

const send = function(res, content, statusCode = 200) {
  res.statusCode = statusCode;
  res.write(content);
  res.end();
};

const getFilePath = function(url) {
  if (url == "/") return "./publicHtml/index.html";
  return "./publicHtml" + url;
};

const app = (req, res) => {
  const url = getFilePath(req.url);
  fs.readFile(`${url}`, (err, data) => {
    if (err) {
      send(res, "Not Found", 404);
      return;
    }
    send(res, data);
  });
};

// Export a function that can act as a handler

module.exports = app;
