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
    toggleGround();
})

document.getElementById("toggleTracers").addEventListener("click", () => {
    if (aTracersVis || bTracersVis || cTracersVis) {
        aTracersVis = false;
        bTracersVis = false;
        cTracersVis = false;
    } else {
        aTracersVis = true;
        bTracersVis = true;
        cTracersVis = true;
    }
    setTracerVis("A1", aTracersVis);
    setTracerVis("B1", bTracersVis);
    setTracerVis("Cp", cTracersVis);

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

    setOpenCrossed();
    setLinkLengths();
    setCouplerGeom();
    drawTracePaths();
    updateDiagram();
})

document.getElementById("toggleDir").addEventListener("click", () => {
    animationDir *= -1;
    animationReverse = true;
})
document.getElementById("toggleCross").addEventListener("click", () => {
    crossoverActive = !crossoverActive;
    if (!crossoverActive) {
        document.getElementById("toggleCross").style.textDecoration = "line-through";
    } else {
        document.getElementById("toggleCross").style.textDecoration = "none";
    }
    drawTracePaths();
    updateDiagram();
})

document.getElementById("invertLinkage").addEventListener("click", () => {
    invertLinkage();
    updateDiagram();
});
document.getElementById("toggleOpenCrossed").addEventListener("click", () => {
    toggleOpenCrossed();
});

// document.getElementById("swapInOut").addEventListener("click", () => {
//     swapInputOutput();
//     updateDiagram();
// });

// document.getElementById("downloadGif").addEventListener("click", () => {
//     exportGIF();
// })

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

    if (animationActive) {
        document.getElementById("shareConfig").disabled = true;
        // document.getElementById("swapInOut").disabled = true;
    } else {
        document.getElementById("shareConfig").disabled = false;
        // document.getElementById("swapInOut").disabled = false;
    }

    const button = document.getElementById("toggleAnimation");
    button.textContent = animationActive ? "Pause" : "Play";

    // const angleSlider = document.getElementById("inputAngleSlider");
    // angleSlider.style.display = animationActive ? "none" : "inline-block"

    // const angleValue = document.getElementById("angleValue");
    // angleValue.style.display = animationActive ? "none" : "inline-block"

    // const speedSlider = document.getElementById("inputSpeedSlider");
    // speedSlider.style.display = animationActive ? "inline-block" : "none"
    // const speedDisplay = document.getElementById("speedValue");
    // speedDisplay.textContent = `${animationSpeed.toFixed(0)} rpm`
    // speedDisplay.style.display = animationActive ? "inline-block" : "none";

    // const sliderLab = document.getElementById("sliderLabel");
    // sliderLab.textContent = animationActive ? "Drive Speed:" : "Drive Angle:"

    if (animationActive) {
        startAnimationLoop();
    } else {
        stopAnimationLoop();
    }
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
    // const rotationValue = document.getElementById("rotateValue");

    rotationSlider.addEventListener("input", () => {
        const rotAngle = parseFloat(rotationSlider.value);
        // rotationValue.textContent = `${rotAngle.toFixed(0)}°`;

    traceLimits[0].text = `${currentRotation.toFixed(0)}°`;
    rotateDiagram(rotAngle);
    updateDiagram();
    })
}

function setupAnimationSpeed() {
    const speedSlider = document.getElementById("inputSpeedSlider");
    const speedDisplay = document.getElementById("speedValue");

    speedDisplay.textContent = `${animationSpeed.toFixed(0)} rpm`;

    speedSlider.addEventListener("input", () => {
        const speedRPM = parseFloat(speedSlider.value);
        speedDisplay.textContent = `${speedRPM.toFixed(0)} rpm`;

    animationSpeed = speedRPM;

    updateDiagram();
    });
}

function handleJointTap(event, d) {
  const now = Date.now();
  if (now - lastTapTime < 300) {
    dblclickTracers(d.id);
  }
  lastTapTime = now;
}

;