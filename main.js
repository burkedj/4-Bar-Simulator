const svg = d3.select("#editorView");

const zoomGroup = svg.append("g")
const overlayGroup = svg.append("g")

// Draw links
const polyGroup = zoomGroup.append("g")
const polygons = polyGroup.selectAll("polygon")
    .data(links)
    .enter()
    .append("polygon")
    .attr("class", "link")
    .attr("stroke", d => d.color)
    .attr("fill", d => d.color)
    .attr("opacity", linkOpactity)
    .attr("stroke-width", 12)
    .style("stroke-linejoin", "round")
    .attr("points", d => d.nodes.map(j => `${j.x},${j.y}`).join(" "))

// Draw joints
const jointGroup = zoomGroup.append("g")
const circles = jointGroup.selectAll("circle")
    .data(joints)
    .enter()
    .append("circle")
    .attr("r", 4)
    .attr("fill", "white")
    .attr("opacity", 1)

const pathGroup = zoomGroup.append("g")
const paths = pathGroup.selectAll("polyline")
    .data(tracers)
    .enter()
    .append("polyline")
    .attr("stroke", d => d.color)
    .attr("fill","none")
    .attr("points", d => d.points)
    .attr("stroke-dasharray", "1.5,2.5")
    .style("stroke-linecap", "round")
    // .attr("opacity", 0.75)
    // .attr("marker-start", "url(#markerCircle)")
    // .attr("marker-end", "url(#markerCircle)")
    .style("display", "none")
    .style("pointer-events", "none");
    
const fullPathGroup = zoomGroup.append("g")
const fullPaths = fullPathGroup.selectAll("polyline")
    .data(fullTracers)
    .enter()
    .append("polyline")
    .attr("stroke", d => d.color)
    .attr("opacity", 0.15)
    .attr("fill","none")
    .attr("points", d => d.points)
    .style("stroke-linecap", "round")
    .style("display", "none")
    .style("pointer-events", "none");

const tracePointGroup = zoomGroup.append("g")
const tracePoints = tracePointGroup.selectAll("circle")
    .data(joints.filter(d => d.type !== "ground"))
    .enter()
    .append("circle")
    .attr("r", 1.5)
    .attr("fill", d => d.color)
    .attr("opacity", 1)
    .style("display", "none")

// const traceEndsGroup = zoomGroup.append("g")
// const traceEnds = traceEndsGroup.selectAll("circle")
//     .data(traceLimits)
//     .enter()
//     .append("circle")
//     .attr("r", 1.5)
//     .attr("fill", d => d.color)
//     .style("display", "none")
// const traceStartsGroup = zoomGroup.append("g")
// const traceStarts = traceStartsGroup.selectAll("circle")
//     .data(traceLimits)
//     .enter()
//     .append("circle")
//     .attr("r", 1.5)
//     .attr("fill", d => d.color)
//     .style("display", "none")



const dragGroup = zoomGroup.append("g")
const dragnodes = dragGroup.selectAll("circle")
    .data(joints)
    .enter()
    .append("circle")
    .attr("class", "trace")
    .attr("r", 10)
    .attr("fill", "black")
    .attr("opacity", 0)
    .call(d3.drag()
        .on("drag", function(event, d) {
            if (d.id === "A0") return
            if (d.id === "Cp" & !couplerVisible) return
            if (d.ground) {
                d.x = event.x;
                d.y = originalJoints.find(j => j.id === d.id).y;
                if (joints[3].x < joints[0].x) {
                    d.x = originalJoints.find(j => j.id === "A0").x
                }
            } else {
                d.x = event.x;
                d.y = event.y;
            }
            setLinkLengths();
            setCouplerGeom();
            drawTracePaths();
            calcPlotPath(linkageConfig);
            updateDiagram();
        })
    );

const coordsGroup = zoomGroup.append("g")
const coords = coordsGroup.selectAll("text")
    .data(joints)
    .enter()
    .append("text")
    .attr("font-size", "8px")
    .attr("text-anchor", "start")
    .style("pointer-events", "none")
    .style("display", "none");

const linklengthGroup = zoomGroup.append("g")
const lengths = linklengthGroup.selectAll("text")
    .data(links)
    .enter()
    .append("text")
    .attr("font-size", "8px")
    .attr("text-anchor", "middle")
    .style("pointer-events", "none")
    .style("display", "none");

const labsGroup = overlayGroup.append("g")
const labels = labsGroup.selectAll("text")
    .data(labCoords)
    .enter()
    .append("text")
    .attr("font-size", "13px")
    .attr("font-family", "sans-serif")
    .attr("font-weight", d => d.weight)
    .attr("fill", d => d.color)
    .style("text-anchor", d => d.anchor)


let originalCoupler = {id: "c", nodes: [joints[1], joints[2], joints[4]]};

const zoom = d3.zoom()
    .scaleExtent([0.25, 10])
    .on("zoom", (event) => {
        // zoomGroup.attr("transform", event.transform);
        currentZoomTransform = event.transform;
        viewTransform();
    });

svg.call(zoom)
    .on("dblclick.zoom", null); // Disable double-click zoom
svg.call(zoom.transform, d3.zoomIdentity
    .translate(defaultX, defaultY)
    .scale(defaultScale)
);
svg.selectAll(".link")
    .on("dblclick", function(event, d) {
        if (d.id === "c") {
            toggleCoupler(d);
            updateDiagram()
        } else if (d.id === "a") {
            toggleTracer("A1");
        } else if (d.id === "b") {
            toggleTracer("B1");
        } else if (d.id === "d") {
            toggleGround();
        }
    });

svg.selectAll(".trace")
  .on("pointerdown", handleJointTap);

// svg.selectAll(".trace")
//   .on("touchstart", handleJointTap)
//   .on("mousedown", handleJointTap); // for desktop fallback

// svg.selectAll(".trace")
//     .on ("dblclick", function(event, d) {
//         if (d.id === "A1") {
//             toggleTracer("A1");
//         } else if (d.id === "B1") {
//             toggleTracer("B1");
//         } else if (d.id === "Cp") {
//             toggleTracer("Cp");
//         }
//         updateDiagram();
//     });

// Plot stuff
const plot = d3.select("#plotWindow");
// const plotGroup = plot.append("g")

const axisGroup = plot.append("g")
const axes = axisGroup.selectAll("line")
    .data(plotAxes)
    .enter()
    .append("line")
    .attr("stroke", "black")
    .attr("stoke-width", 2)
    .attr("x1", d => d.x1)
    .attr("y1", d => d.y1)
    .attr("x2", d => d.x2)
    .attr("y2", d => d.y2)    
    .style("stroke-linecap", "round");
    // .style("display", "none")
    // .style("pointer-events", "none");

const trans45 = yMinTick+(yMaxTick-yMinTick)*.25
const trasn135 = yMinTick+(yMaxTick-yMinTick)*.75
const transIdeal = plot.append("polygon")
    .attr("stroke", "black")
    .attr("opacity", 0.1)
    .attr("points", `${axesOrigin[0]},${trasn135},${xMaxTick+TickOffset},${trasn135},${xMaxTick+TickOffset},${trans45},${axesOrigin[0]},${trans45}`)
    .style("display", plotVariable === "Transmission Angle" ? "block" : "none")

const plotLabGroup = plot.append("g")
const plotLabs = plotLabGroup.selectAll("text")
    .data(plotLabels)
    .enter()
    .append("text")
    .attr("x", d => d.x)
    .attr("y", d => d.y)
    .text(d => d.text)
    .attr("font-size", d => d.textSize)
    .attr("font-family", "sans-serif")
    .attr("text-anchor", d => d.anchor)
    .attr("dominant-baseline", d => d.baseline)
    .attr("font-weight", d => d.weight)
    .attr("fill", d => d.color)
    .style("display", d => {
        if (d.id === "yAxisTitle") return "none"
    })
    .style("pointer-events", "none");

const plotLineGroup = plot.append("g")
const plotLine = plotLineGroup.selectAll("polyline")
    .data(plotLines)
    .enter()
    .append("polyline")
    .attr("stroke", "black")
    .attr("stroke-width", 1.9)
    .attr("fill", "none")
    .attr("opacity", d => d.opacity)
    .attr("points", d => d.points)
    .attr("stroke-dasharray", d => {
        if (d.id === "mainLine") return "3,6"
    })
    .style("stroke-linecap", "round")

const plotPointsGroup = plot.append("g")
const plotPoint = plotPointsGroup.selectAll("circle")//.selectAll("circle")
    .data(plotPoints)
    .enter()
    .append("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 4)
    .attr("fill",d => d.fill)
    .attr("stroke", "black")
    .attr("stroke-width", 1.9)
const plotDrag = plot.append("circle")
    .attr("r", 30)
    .attr("fill", "black")
    .attr("opacity", 0)
    .call(d3.drag()
        .on("start", (event) => {
            configToggled = false;
            plotDrag.attr("opacity", 0.05);
        })
        .on("drag", function(event) {
            if (!crossoverActive) configToggled = true;
            if (configToggled && event.x < xMaxTick-5 && event.x > xMinTick+5) {
                    configToggled = false;
            }
            let dragX = event.x + getInputLimits()[0]*getPlotScale()[0]
            if (event.x > xMaxTick) {
                if (!configToggled && getInputLimits()[2] !== "Crank") {
                    toggleOpenCrossed();
                    configToggled = true;
                }
                dragX = (getInputLimits()[1] - simAngleTol)*getPlotScale()[0] + xMinTick
            }
            if (event.x < xMinTick) {
                if (!configToggled && getInputLimits()[2] !== "Crank") {
                    toggleOpenCrossed();
                    configToggled = true;
                }
                dragX = (getInputLimits()[0] + simAngleTol)*getPlotScale()[0] + xMinTick
            }
            rotateInputLink((dragX-xMinTick)/getPlotScale()[0])
            updateDiagram();
        })
        .on("end", (event) => {
            configToggled = false;
            plotDrag.attr("opacity", 0)
        })
    );


// Initialize
loadJointsFromURL();
loadViewFromURL();
setCouplerGeom()
// setupSimulationControls();
// initializeSlider();
setupRotationControls()
setupAnimationSpeed()
setupPlotVarSelect();
setTracerVis("A1", aTracersVis);
setTracerVis("B1", bTracersVis);
setTracerVis("Cp", cTracersVis);
drawTracePaths();
calcPlotPath(linkageConfig)
updateDiagram();
