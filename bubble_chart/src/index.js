const dscc = require('@google/dscc');
const viz = require('@google/dscc-scripts/viz/initialViz.js');
const local = require('./localMessage.js');
const d3 = require("d3");

// change this to 'true' for local development
// change this to 'false' before deploying
export const LOCAL = true;

// write viz code here
const drawViz = (data) => {
  let rowData = data.tables.DEFAULT;

// set the dimensions and margins of the graph
var margin = {top: 40, right: 150, bottom: 60, left: 30},
    width = 1000 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("body")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  let maxDate = 0;
  let minDate = Number.MAX_SAFE_INTEGER;
  let maxGDP = 0;
  let minGDP = Number.MAX_SAFE_INTEGER;
  let maxEnergy = 0;
  let minEnergy = Number.MAX_SAFE_INTEGER;
  let countries = new Set()
  rowData.forEach(function(row) {
    maxDate = Math.max(maxDate, row["xDimensionDate"][0]);
    minDate = Math.min(minDate, row["xDimensionDate"][0]);
    maxGDP = Math.max(maxGDP, row["yGDPMetric"][0]);
    minGDP = Math.min(minGDP, row["yGDPMetric"][0]);
    maxEnergy = Math.max(maxEnergy, row["EnergyMetric"][0]);
    minEnergy = Math.min(minEnergy, row["EnergyMetric"][0]);
    countries.add(row["DimensionCountry"][0])
  });

console.log([...countries].sort())

  // ---------------------------//
  //       AXIS  AND SCALE      //
  // ---------------------------//

  // Add X axis
  var x = d3.scaleLinear()
    .domain([minDate-1, maxDate+1])
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add X axis label:
  svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height+50 )
      .text("Gdp per Capita");

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([minGDP, maxGDP])
    .range([ height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y).ticks(5));

  // Add Y axis label:
  svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", 0)
      .attr("y", -20 )
      .text("Life expectancy")
      .attr("text-anchor", "start")

  // Add a scale for bubble size
  var z = d3.scaleSqrt()
   .domain([minEnergy, maxEnergy])
   .range([1, 15]);

  // Add a scale for bubble color
  var myColor = d3.scaleOrdinal()
    .domain([...countries].sort())
    .range(d3.schemeSet3);
  
  // ---------------------------//
  //      TOOLTIP               //
  // ---------------------------//

  // -1- Create a tooltip div that is hidden by default:
  var tooltip = d3.select("body")
    .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "black")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("color", "white")
  
  // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
  var showTooltip = function(d) {
    tooltip
      .transition()
      .duration(200)
    tooltip
      .style("opacity", 1)
      .html("Country: " + d.country)
      .style("left", (d3.mouse(this)[0]+30) + "px")
      .style("top", (d3.mouse(this)[1]+30) + "px")
  }
  var moveTooltip = function(d) {
    tooltip
      .style("left", (d3.mouse(this)[0]+30) + "px")
      .style("top", (d3.mouse(this)[1]+30) + "px")
  }
  var hideTooltip = function(d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
  }

   // ---------------------------//
  //       HIGHLIGHT GROUP      //
  // ---------------------------//

  // What to do when one group is hovered
  var highlight = function(d){
    // reduce opacity of all groups
    d3.selectAll(".bubbles").style("opacity", .05)
    // expect the one that is hovered
    d3.selectAll("."+d).style("opacity", 1)
  }

  // And when it is not hovered anymore
  var noHighlight = function(d){
    d3.selectAll(".bubbles").style("opacity", 1)
  }

  // ---------------------------//
  //       CIRCLES              //
  // ---------------------------//

  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(rowData)
    .enter()
    .append("circle")
      .attr("class", function(d) { return "bubbles " + d["DimensionCountry"][0] })
      .attr("cx", function (d) { return x(d["xDimensionDate"][0]); } )
      .attr("cy", function (d) { return y(d["yGDPMetric"][0]); } )
      .attr("r", function (d) { return z(d["EnergyMetric"][0]); } )
      .style("fill", function (d) { return myColor(d["DimensionCountry"][0]); } )
    // -3- Trigger the functions for hover
    .on("mouseover", showTooltip )
    .on("mousemove", moveTooltip )
    .on("mouseleave", hideTooltip )

  // ---------------------------//
    //       LEGEND              //
    // ---------------------------//

    // Add one dot in the legend for each name.
    var size = 20
    var allgroups = [...countries].sort()
    svg.selectAll("myrect")
      .data(allgroups)
      .enter()
      .append("circle")
        .attr("cx", width+20)
        .attr("cy", function(d,i){ return 10 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", function(d){ return myColor(d)})
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

    // Add labels beside legend dots
    svg.selectAll("mylabels")
      .data(allgroups)
      .enter()
      .append("text")
        .attr("x", width+20 + size*.8)
        .attr("y", function(d,i){ return i * (size + 5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d){ return myColor(d)})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

};

// renders locally
if (LOCAL) {
  drawViz(local.message);
} else {
  dscc.subscribeToData(drawViz, {transform: dscc.objectTransform});
}
