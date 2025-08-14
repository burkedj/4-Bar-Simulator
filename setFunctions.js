function setLinkLengths() {
    const lengths = getLinkLengths();

    aLength = lengths["a"];
    bLength = lengths["b"];
    cLength = lengths["c"];
    dLength = lengths["d"];
}

function setOpenCrossed() {
   linkageConfig = getOpenCrossed();
}

function setCouplerGeom() {
    couplerSetAngle = getCouplerGeom()[1];
    couplerSetLength = getCouplerGeom()[0];
}

function setCouplerVis(state) {
    if (state) {
        circles
            .filter(d => d.id === "Cp")
            .style("display",  "block")
        if (coordsVisible) {
            coords
                .filter(d => d.id === "Cp")
                .style("display", "block")
        }
        if (cTracersVis) {
            paths
                .filter(d => d.id === "Cp")
                .style("display", "block")
            tracePoints
                .filter(d => d.id === "Cp")
                .style("display", "block")
        }
    } else {
        links[2].nodes = links[2].nodes.slice(0,2);
        circles
            .filter(d => d.id === "Cp")
            .style("display",  "none")
        coords
            .filter(d => d.id === "Cp")
            .style("display", "none")
        paths
            .filter(d => d.id === "Cp")
            .style("display", "none")
        tracePoints
            .filter(d => d.id === "Cp")
            .style("display", "none")
    }
}

// function setTracePoints(node)
// {
//     const traceLims = getTracerLimits(node, linkageConfig);
//     let traceMinCoords = calcJointPosition(node, traceLims[0], linkageConfig);
//     let traceMaxCoords = calcJointPosition(node, traceLims[1], linkageConfig);

//     let origin = [0,0];
//     if (node === "A1") {
//         origin = [joints[0].x,joints[0].y];
//     } else if (node === "B1") {
//         origin = [joints[3].x,joints[3].y];
//     } else if (node === "Cp") {
//         origin = [joints[1].x,joints[1].y];
//     }

//     const trace = traceLimits.find(t => t.id === node);

//     trace.min[0] = traceMinCoords[0];
//     trace.min[1] = traceMinCoords[1];
//     trace.max[0] = traceMaxCoords[0];
//     trace.max[1] = traceMaxCoords[1];
// }

function setTracerVis(node, state) {
    paths
        .filter(d => d.id === node & d.id === "Cp")
        .style("display", state & couplerVisible ? "block" : "none")
    tracePoints
        .filter(d => d.id === node  & d.id === "Cp")
        .style("display", state & couplerVisible? "block" : "none")
    // traceEnds
    //     .filter(d => d.id === node  & d.id === "Cp")
    //     .style("display", state & couplerVisible ? "block" : "none")
    // traceStarts
    //     .filter(d => d.id === node  & d.id === "Cp")
    //     .style("display", state & couplerVisible ? "block" : "none")

    paths
        .filter(d => d.id === node & d.id !== "Cp")
        .style("display", state ? "block" : "none")
    tracePoints
        .filter(d => d.id === node  & d.id !== "Cp")
        .style("display", state ? "block" : "none")
    // traceEnds
    //     .filter(d => d.id === node  & d.id !== "Cp")
    //     .style("display", state ? "block" : "none")
    // traceStarts
    //     .filter(d => d.id === node  & d.id !== "Cp")
    //     .style("display", state ? "block" : "none")
}

function setLabelsVis(){
    //Coordinates
    coords
        .filter(d => d.id !== "Cp")
        .style("display", coordsVisible ? "block" : "none")
    coords
        .filter(d => d.id === "Cp")
        .style("display", coordsVisible & couplerVisible ? "block" : "none");

    //Link lengths
    lengths.style("display", lengthsVisible ? "block" : "none");
}