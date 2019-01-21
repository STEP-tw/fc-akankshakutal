const fs = require("fs");
const { COMMENTS_FILE, ENCODING } = require("./constants");

class Comments {
  constructor() {
    this.userComments = [];
  }

  getComments() {
    return this.userComments;
  }

  readComments() {
    const data = fs.readFileSync(COMMENTS_FILE, ENCODING);
    // this.userComments = data; ///JSON.parse(data);
  }

  writeCommentsToFile() {
    if (!fs.existsSync(COMMENTS_FILE)) fs.writeFileSync(COMMENTS_FILE, "[]");
    fs.writeFile(COMMENTS_FILE, JSON.stringify(this.userComments), err => {});
  }

  addComment(comment) {
    this.userComments.unshift(comment);
    this.writeCommentsToFile();
  }
}

module.exports = Comments;
