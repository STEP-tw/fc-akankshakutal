const hide = function() {
  const waterCan = document.getElementById("water_can");
  waterCan.style.visibility = "hidden";
  setTimeout(() => (waterCan.style.visibility = "visible"), 1000);
};

const createCommentsSection = function({ date, name, comment }) {
  let localTimeDetails = new Date(date).toLocaleString();
  return `<p>${localTimeDetails}: <strong>${name}</strong> : ${comment}</p>`;
};

const generateCommentHtml = function(contents) {
  let html = contents.map(content => createCommentsSection(content));
  return html.join("");
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
