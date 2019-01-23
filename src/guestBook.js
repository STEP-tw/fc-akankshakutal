const partialHtml = require("./partialHtml.js");

class GuestBook {
  constructor(guestBookTemplate, comments) {
    this.guestBook = guestBookTemplate;
    this.comments = comments;
  }

  addComments() {
    let commentsList = this.comments;
    return this.guestBook.replace("#####", JSON.stringify(commentsList));
  }

  addLogInForm(guestBook) {
    return guestBook.replace("#form#", partialHtml.logInForm);
  }

  addCommentForm(guestBook, userName) {
    return guestBook.replace("#form#", partialHtml.commentForm(userName));
  }

  withLogInForm() {
    let guestBook = this.addComments();
    guestBook = this.addLogInForm(guestBook);
    return guestBook.replace("#message#", "");
  }

  withCommentForm(userName) {
    let guestBook = this.addComments();
    guestBook = this.addCommentForm(guestBook, userName);
    return guestBook.replace("#message#", "");
  }

  afterLogIn(userName) {
    let guestBook = this.addComments();
    guestBook = this.addCommentForm(guestBook, userName);
    return guestBook;
  }

  afterLogOut() {
    let guestBook = this.addComments();
    guestBook = this.addLogInForm(guestBook);
    return guestBook;
  }
}

module.exports = GuestBook;
