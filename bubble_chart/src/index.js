const dscc = require('@google/dscc');
const viz = require('@google/dscc-scripts/viz/initialViz.js');
const local = require('./localMessage.js');
const d3 = require("d3");

// change this to 'true' for local development
// change this to 'false' before deploying
export const LOCAL = true;

// write viz code here
const drawViz = (data) => {
// set the dimensions and margins of the graph
var margin = {top: 40, right: 150, bottom: 60, left: 30},
width = 500 - margin.left - margin.right,
height = 420 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("body")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

// Add X axis
var x = d3.scaleLinear()
.domain([2000, 2015])
.range([ 0, width ]);
svg.append("g")
.attr("transform", "translate(0," + height + ")")
.call(d3.axisBottom(x).ticks(3));

// Add X axis label:
svg.append("text")
  .attr("text-anchor", "end")
  .attr("x", width)
  .attr("y", height+50 )
  .text("Gdp per Capita");

// Add Y axis
var y = d3.scaleLinear()
.domain([35, 90])
.range([ height, 0]);
svg.append("g")
.call(d3.axisLeft(y));

// Add Y axis label:
svg.append("text")
  .attr("text-anchor", "end")
  .attr("x", 0)
  .attr("y", -20 )
  .text("Life expectancy")
  .attr("text-anchor", "start")

  
};

// renders locally
if (LOCAL) {
  drawViz(local.message);
} else {
  dscc.subscribeToData(drawViz, {transform: dscc.objectTransform});
}
