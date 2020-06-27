const dscc = require('@google/dscc');
const viz = require('@google/dscc-scripts/viz/initialViz.js');
const local = require('./localMessage.js');
const d3 = require("d3");

// change this to 'true' for local development
// change this to 'false' before deploying
export const LOCAL = true;

// write viz code here
const drawViz = (data) => {
  if (document.querySelector('div')) {
    var oldDiv = document.querySelector('div');
    oldDiv.parentNode.removeChild(oldDiv);
  }

  // append the data to a div
  let div = document.createElement('div');
  var msgText = JSON.stringify(data, null, 2);
  div.innerHTML = `<pre>export hola const message = ${msgText};</pre>`;
  document.body.appendChild(div);
  
};

// renders locally
if (LOCAL) {
  drawViz(local.message);
} else {
  dscc.subscribeToData(drawViz, {transform: dscc.objectTransform});
}
