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

function setTracerVis(node, state) {
    paths
        .filter(d => d.id === node & d.id === "Cp")
        .style("display", state & couplerVisible ? "block" : "none")
    tracePoints
        .filter(d => d.id === node  & d.id === "Cp")
        .style("display", state & couplerVisible? "block" : "none")

    paths
        .filter(d => d.id === node & d.id !== "Cp")
        .style("display", state ? "block" : "none")
    tracePoints
        .filter(d => d.id === node  & d.id !== "Cp")
        .style("display", state ? "block" : "none")
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