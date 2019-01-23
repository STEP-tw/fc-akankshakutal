const partialHtml = require("./partialHtml.js");

class GuestBook {
  constructor(guestBookTemplate, comments) {
    this.guestBook = guestBookTemplate;
    this.comments = comments;
  }

  addComments() {
    return this.guestBook.replace("#comment#", this.comments.toHTML());
  }

  addLogInForm(guestBook) {
    return guestBook.replace("#form#", partialHtml.logInForm);
  }

  addCommentForm(guestBook, userName) {
    return guestBook.replace("#form#", partialHtml.commentForm(userName));
  }

  withLogInForm() {
    let guestBook = this.addComments();
    return this.addLogInForm(guestBook);
  }

  withCommentForm(userName) {
    let guestBook = this.addComments();
    return this.addCommentForm(guestBook, userName);
  }

  afterLogIn(userName) {
    let guestBook = this.addComments();
    return this.addCommentForm(guestBook, userName);
  }

  afterLogOut() {
    let guestBook = this.addComments();
    return this.addLogInForm(guestBook);
  }
}

module.exports = GuestBook;
