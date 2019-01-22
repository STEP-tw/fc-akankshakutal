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
    fs.readFileSync(COMMENTS_FILE, ENCODING);
  }

  writeCommentsToFile() {
    if (!fs.existsSync(COMMENTS_FILE)) fs.writeFileSync(COMMENTS_FILE, "[]");
    fs.writeFile(COMMENTS_FILE, JSON.stringify(this.userComments), err => {});
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
