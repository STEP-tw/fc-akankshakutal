const hide = function() {
  const waterCan = document.getElementById("water_can");
  waterCan.style.visibility = "hidden";
  setTimeout(() => (waterCan.style.visibility = "visible"), 1000);
};
