const hide = function() {
  const waterCan = document.getElementById("water_can");
  waterCan.style.visibility = "hidden";
  setTimeout(() => (waterCan.style.visibility = "visible"), 1000);
};

const createCommentsSection = function({ date, name, comment }) {
  let localTimeDetails = new Date(date).toLocaleString();
  return `<p class='comments'>${localTimeDetails}: <strong>${name}</strong> : ${comment}</p>`;
};

const generateCommentHtml = function(comments) {
  return comments.reduce((html, comment) => {
    html += createCommentsSection(comment);
    return html;
  }, "");
};

const addComments = function() {
  fetch("/comments")
    .then(function(response) {
      return response.json();
    })
    .then(function(comments) {
      let commentsDiv = document.getElementById("comments");
      commentsDiv.innerHTML = generateCommentHtml(comments);
    });
};
