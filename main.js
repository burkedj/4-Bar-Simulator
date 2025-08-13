const svg = d3.select("#editorView");

const zoomGroup = svg.append("g")

// Draw links
const polyGroup = zoomGroup.append("g")
const polygons = polyGroup.selectAll("polygon")
    .data(links)
    .enter()
    .append("polygon")
    .attr("class", "link")
    .attr("stroke", "darkgreen")
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
    .attr("stroke-dasharray", "3,2")
    .attr("opacity", 0.65)
    .style("display", "none")
    .style("pointer-events", "none");

const tracePointGroup = zoomGroup.append("g")
const tracePoints = tracePointGroup.selectAll("circle")
    .data(joints.filter(d => d.type !== "ground"))
    .enter()
    .append("circle")
    .attr("r", 1.25)
    .attr("fill", d => d.color)
    .attr("opacity", 1)
    .style("display", "none")


const dragGroup = zoomGroup.append("g")
const dragnodes = dragGroup.selectAll("circle")
    .data(joints)
    .enter()
    .append("circle")
    .attr("class", "trace")
    .attr("r", 20)
    .attr("fill", "black")
    .attr("opacity", 0)
    .call(d3.drag()
        .on("drag", function(event, d) {
            // if (editMode === false) return; // Only allow toggling in edit mode
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
        }
    });

svg.selectAll(".trace")
    .on ("dblclick", function(event, d) {
        if (d.id === "A1") {
            toggleTracer("A1");
        } else if (d.id === "B1") {
            toggleTracer("B1");
        } else if (d.id === "Cp") {
            toggleTracer("Cp");
        }
        updateDiagram();
    });

// svg.selectAll(".trace")
//     .on("dblclick", function(event, d) {
//         // tracersVisible = !tracersVisible;
//         // let tracerVis = true;
//         // if (d.id === "A1") {
//         //     tracerVis = aTracersVis;
//         // }
//         aTracersVis = !aTracersVis;
//         paths
//             .filter(d => d.id === "A1")
//             .style("display", aTracersVis ? "block" : "none")
//         tracePoints
//             .filter(d => d.id === event.id)
//             .style("display", aTracersVis ? "block" : "none")
//     });


loadJointsFromURL();
loadViewFromURL();
setCouplerGeom()
setupSimulationControls();
initializeSlider();
setupRotationControls()
setupAnimationSpeed()
drawTracePaths();
updateDiagram();
