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

document.getElementById("toggleTracers").addEventListener("click", () => {
    tracersVisible = !tracersVisible;
    paths
        .style("display", tracersVisible ? "block" : "none")
    tracePoints
        .style("display", tracersVisible ? "block" : "none")
})

document.getElementById("resetZoom").addEventListener("click", () => {
    svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity
        .translate(defaultX, defaultY)
        .scale(defaultScale)
    );
    rotateDiagram(defaultRotation);
    const rotationSlider = document.getElementById("rotateSlider");
    const rotationValue = document.getElementById("rotateValue");

    rotationSlider.value = currentRotation;
    rotationValue.textContent = `${currentRotation.toFixed(0)}°`;
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

inputAngleSlider.addEventListener("pointerdown", () => {
    setCouplerGeom();
})

function setupSimulationControls() {
    const inputSlider = document.getElementById("inputAngleSlider");
    const angleDisplay = document.getElementById("angleValue");

    inputSlider.addEventListener("input", () => {
        const angleDeg = parseFloat(inputSlider.value);
        angleDisplay.textContent = `${angleDeg.toFixed(1)}°`;

        rotateInputLink(angleDeg);
        updateDiagram();
    });

}

function setupRotationControls() {
    const rotationSlider = document.getElementById("rotateSlider");
    const rotationValue = document.getElementById("rotateValue");

    rotationSlider.addEventListener("input", () => {
        const rotAngle = parseFloat(rotationSlider.value);
        rotationValue.textContent = `${rotAngle.toFixed(0)}°`;

        // currentPanX = d3.zoomTransform(zoom).x;
        // currentPanY = d3.zoomTransform(zoom).y;
        // currentZoom = d3.zoomTransform(zoom).k;
        rotateDiagram(rotAngle);
        updateDiagram();
    })
}

;