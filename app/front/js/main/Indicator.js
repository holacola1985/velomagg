/* jslint node: true */
'use strict';

var Indicator = (function () {
  return function (canvas, color) {
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var outer_radius = Math.min(centerX, centerY);

    var context = canvas.getContext('2d');

    function drawArc(color, radius, start = 0, end = 2 * Math.PI) {
      context.fillStyle = color;
      context.beginPath();
      context.moveTo(centerX, centerY);
      context.arc(centerX, centerY, radius, start, end, false);
      context.fill();
      context.closePath();
    }

    this.render = function render(percentage) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawArc(color, outer_radius, 1.5 * Math.PI, (1.5 + 2 * percentage) * Math.PI);
    };
  };
})();

module.exports = Indicator;
