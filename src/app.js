const fs = require("fs");

const send = function(res, content, statusCode = 200) {
  res.statusCode = statusCode;
  res.write(content);
  res.end();
};

const app = (req, res) => {
  let url = req.url;
  if (req.url == "/") {
    url = "/index.html";
  }
  if (req.url === "/favicon.ico") {
    res.end();
    return;
  }
  fs.readFile(`.${url}`, (err, data) => {
    if (err) {
      send(res, "Not Found", 404);
    }
    send(res, data);
  });
};

// Export a function that can act as a handler

module.exports = app;
