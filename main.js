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
    // .style("display", function(event, d) {
    //     if (d.type === "ground") return "none";
    // })

// Draw joints
const jointGroup = zoomGroup.append("g")
const circles = jointGroup.selectAll("circle")
    .data(joints)
    .enter()
    .append("circle")
    .attr("r", 4)
    .attr("fill", "white")
    .attr("stroke-width", 2.2)
    .attr("opacity", 1)
    // .on("dblclick", function(event, d) {
    //     if (editMode === false) return; // Only allow toggling in edit mode
    //     // if (joints[1] == d) return; //
    //     return; // This turns off double click. Remove this line to reenable
    //     event.preventDefault();
    //     event.stopPropagation();
    //     d.ground = !d.ground; // Toggle fixed state on double click
    //     updateDiagram()
    // })
    .call(d3.drag()
        .on("drag", function(event, d) {
            // if (editMode === false) return; // Only allow toggling in edit mode
            if (d.ground) {
                d.x = event.x;
                d.y = originalJoints.find(j => j.id === d.id).y;
            } else {
                d.x = event.x;
                d.y = event.y;
            }
            // if (d.type === "ground") return; // Prevent dragging ground joints
            // d.x = event.x;
            // d.y = event.y;
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

const zoom = d3.zoom()
    .scaleExtent([0.25, 4])
    .on("zoom", (event) => {
        zoomGroup.attr("transform", event.transform);
    });

const originalCoupler = {id: "c", nodes: [joints[1], joints[2], joints[4]]};

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
            updateDiagram();
        }
    });

getCouplerGeom();
// Initial draw
loadJointsFromURL();
loadViewFromURL();
setupSimulationControls();
updateDiagram();