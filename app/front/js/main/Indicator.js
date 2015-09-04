/* jslint node: true */
"use strict";

var Indicator = (function () {
  return function (canvas) {
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var outer_radius = Math.max(Math.min(centerX, centerY), 3);
    var inner_radius = Math.max(outer_radius - 6.5, 3);

    var context = canvas.getContext('2d');

    function drawArc(color, radius, start, end) {
      context.fillStyle = color;
      context.beginPath();
      context.moveTo(centerX, centerY);
      context.arc(centerX, centerY, radius, start || 0, end || 2 * Math.PI, false);
      context.fill();
      context.closePath();
    }

    this.render = function render(percentage) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawArc('#ea5b0c', outer_radius);
      drawArc('#95c11f', outer_radius, 1.5 * Math.PI, (1.5 + 2 * percentage) * Math.PI);
      drawArc('#ffffff', inner_radius);
    };
  }
})();

module.exports = Indicator;