const partialHtmls = {
  logInForm: `
<h2>Login to comment</h2>
<form action="/login" method="POST">
Name:
<input type="text" name="name" required>
<input type="submit" value="Login">
</form>
<br><br>`,

  commentForm: function(name) {
    return `
	<h2>Leave a comment</h2>
	<form action="/logout" method="POST">
		Name: ${name}
		<input type="submit" value="Logout">
		</form>
		<form action="/guestBook.html" method="POST">
		Comment:
		<textarea type="text" name="comment" style="width:150px; height:8"></textarea>
		<br><br>
		<input type="submit" value="Submit" style="background-color: aliceblue" >
	</form>`;
  }
};

module.exports = partialHtmls;
