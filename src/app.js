const fs = require("fs");

const app = (req, res) => {
  fs.readFile("./index.html", "utf8", (err, data) => {
    res.write(data);
    res.end();
  });
};

// Export a function that can act as a handler

module.exports = app;
