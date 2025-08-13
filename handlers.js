document.getElementById("toggleLengths").addEventListener("click", () => {
    lengthsVisible = !lengthsVisible;
    lengths.style("display", lengthsVisible ? "block" : "none");
})

document.getElementById("toggleCoords").addEventListener("click", () => {
    coordsVisible = !coordsVisible;
    coords
        .filter(d => d.id !== "Cp")
        .style("display", coordsVisible ? "block" : "none")
    coords
        .filter(d => d.id === "Cp")
        .style("display", coordsVisible & couplerVisible ? "block" : "none");
})

document.getElementById("toggleGround").addEventListener("click", () => {
    groundVisible = !groundVisible;
    polygons
        .filter(d => d.type === "ground")
        .style("display", groundVisible ? "block" : "none");
})

// document.getElementById("toggleTracers").addEventListener("click", () => {
//     aTracersVis = !aTracersVis;
//     bTracersVis = !bTracersVis;
//     cTracersVis = !cTracersVis;

//     toggleTracer("A1");
//     toggleTracer("B1");
//     toggleTracer("Cp");
//     updateDiagram();
// })

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

    setOpenCrossed();
    setLinkLengths();
    setCouplerGeom();
    drawTracePaths();
    updateDiagram();
})

document.getElementById("shareConfig").addEventListener("click", () => {
    const jointString = joints.map(j => `${j.x.toFixed(1)},${j.y.toFixed(1)},${j.ground ? 1 : 0}`).join(";");
    
    const transform = d3.zoomTransform(svg.node());
    const rotation = currentRotation;
    const viewString = `z=${transform.k.toFixed(1)}&x=${transform.x.toFixed(1)}&y=${transform.y.toFixed(1)}&r=${rotation}`;

    const cVis = couplerVisible ? 1 : 0;
    const gVis = groundVisible ? 1 : 0;
    const aTraceVis = aTracersVis ? 1 : 0;
    const bTraceVis = bTracersVis ? 1 : 0; 
    const cTraceVis = cTracersVis ? 1 : 0;

    const configString = `cp=${cVis}&gv=${gVis}&at=${aTraceVis}&bt=${bTraceVis}&ct=${cTraceVis}`;

    const coordsVis = coordsVisible ? 1 : 0;
    const lengthsVis = lengthsVisible ? 1 : 0;

    const labelString = `cv=${coordsVis}&lv=${lengthsVis}`;

    const url = `${window.location.origin}${window.location.pathname}?j=${jointString}&${viewString}&${configString}&${labelString}`;

    navigator.clipboard.writeText(url)
        .then(() => alert("Shareable URL copied to clipboard!"))
        .catch(() => alert("Failed to copy URL."));
})

document.getElementById("toggleAnimation").addEventListener("click", () => {
    animationActive = !animationActive;

    const button = document.getElementById("toggleAnimation");
    button.textContent = animationActive ? "Pause" : "Play";

    const angleSlider = document.getElementById("inputAngleSlider");
    angleSlider.style.display = animationActive ? "none" : "inline-block"

    const angleValue = document.getElementById("angleValue");
    angleValue.style.display = animationActive ? "none" : "inline-block"

    const speedSlider = document.getElementById("inputSpeedSlider");
    speedSlider.style.display = animationActive ? "inline-block" : "none"
    const speedDisplay = document.getElementById("speedValue");
    speedDisplay.textContent = `${animationSpeed.toFixed(0)} rpm`
    speedDisplay.style.display = animationActive ? "inline-block" : "none";

    const sliderLab = document.getElementById("sliderLabel");
    sliderLab.textContent = animationActive ? "Drive Speed:" : "Drive Angle:"

    if (animationActive) {
        startAnimationLoop();
    } else {
        stopAnimationLoop();
    }
    // incrementLinkage();
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

        rotateDiagram(rotAngle);
        updateDiagram();
    })
}

function setupAnimationSpeed() {
    const speedSlider = document.getElementById("inputSpeedSlider");
    const speedDisplay = document.getElementById("speedValue");

    speedSlider.addEventListener("input", () => {
        const speedRPM = parseFloat(speedSlider.value);
        speedDisplay.textContent = `${speedRPM.toFixed(0)} rpm`;

    animationSpeed = speedRPM;

    updateDiagram();
    });

}

;