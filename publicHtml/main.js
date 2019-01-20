const hide = function() {
  const waterCan = document.getElementById("water_can");
  waterCan.style.visibility = "hidden";
  setTimeout(() => (waterCan.style.visibility = "visible"), 1000);
};

const generateCommentTable = function(contents) {
  let table = "<table id='comment'>";
  let tr = contents.map(content => {
    return `<tr><td>${content.date}</td><td>${content.name}</td><td>${
      content.comment
    }</td></tr>`;
  });
  return table + tr.join("") + "</table>";
};

const addComments = function() {
  fetch("/comments")
    .then(function(response) {
      return response.json();
    })
    .then(function(comments) {
      let commentsDiv = document.getElementById("comments");
      commentsDiv.innerHTML = generateCommentTable(comments);
    });
};
