document.getElementById("toggleLengths").addEventListener("click", () => {
    lengthsVisible = !lengthsVisible;
    lengths.style("display", lengthsVisible ? "block" : "none");
})

document.getElementById("toggleCoords").addEventListener("click", () => {
    coordsVisible = !coordsVisible;
    coords.style("display", coordsVisible ? "block" : "none");
})

document.getElementById("toggleGround").addEventListener("click", () => {
    groundVisible = !groundVisible;
    polygons
        .filter(d => d.type === "ground")
        .style("display", groundVisible ? "block" : "none");
})

document.getElementById("resetZoom").addEventListener("click", () => {
    svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity
        .translate(defaultX, defaultY)
        .scale(defaultScale)
    );
})

document.getElementById("resetLinkage").addEventListener("click", () => {
    joints.forEach((j, i) => {
        j.x = originalJoints[i].x;
        j.y = originalJoints[i].y;
        j.ground = originalJoints[i].ground;
        j.type = originalJoints[i].type;
    });
    updateDiagram();
})

document.getElementById("shareConfig").addEventListener("click", () => {
    const jointString = joints.map(j => `${j.x.toFixed(2)},${j.y.toFixed(2)},${j.ground ? 1 : 0}`).join(";");
    const transform = d3.zoomTransform(svg.node());
    const viewString = `z=${transform.k.toFixed(3)}&x=${transform.x.toFixed(1)}&y=${transform.y.toFixed(1)}`;

    const url = `${window.location.origin}${window.location.pathname}?j=${jointString}&${viewString}`;

    navigator.clipboard.writeText(url)
        .then(() => alert("Shareable URL copied to clipboard!"))
        .catch(() => alert("Failed to copy URL."));
})

// document.getElementById("toggleMode").addEventListener("click", () => {
//     editMode = !editMode;
//     document.getElementById("modeLabel").textContent = editMode
//         ? "Edit Mode"
//         : "Simulation Mode";

//     document.getElementById("resetLinkage").disabled = !editMode;

//     // couplerSetAngle = getCouplerGeom()[1];
//     // couplerSetLength = getCouplerGeom()[0];
//     // document.getElementById("simControls").style.display = editMode ? "none" : "block";
//     // document.getElementById("simControls").style.display = "block";

//     updateDiagram();  // Re-render with new mode
    
// })

inputAngleSlider.addEventListener("pointerdown", () => {
    couplerSetAngle = getCouplerGeom()[1];
    couplerSetLength = getCouplerGeom()[0];
})

// inputSlider.addEventListener("pointerdown", () => {
//     lockedConfig = linkageConfig;
// })
// inputSlider.addEventListener("pointerup", () => {
//     lockedConfig = null;
// })
;