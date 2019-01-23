const fs = require("fs");
const { ENCODING } = require("./constants");

class Comments {
  constructor(fileName) {
    this.userComments = [];
    this.fileName = fileName;
  }

  getComments() {
    return this.userComments;
  }

  readComments() {
    if (!fs.existsSync(this.fileName)) {
      fs.writeFileSync(this.fileName, "[]", "utf-8");
    }
    let data = fs.readFileSync(this.fileName, ENCODING);
    // this.userComments = JSON.parse(data);
  }

  writeCommentsToFile() {
    fs.writeFile(this.fileName, JSON.stringify(this.userComments), err => {});
  }

  addComment(comment) {
    this.userComments.unshift(comment);
    this.writeCommentsToFile();
  }

  createCommentsSection({ date, name, comment }) {
    let localTimeDetails = new Date(date).toLocaleString();
    return `<p class='comments'>${localTimeDetails}: <strong>${name}</strong> : ${comment}</p>`;
  }

  toHTML() {
    return this.userComments.reduce((html, comment) => {
      html += this.createCommentsSection(comment);
      return html;
    }, "");
  }
}

module.exports = Comments;
