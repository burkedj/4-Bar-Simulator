function loadJointsFromURL(){
    const params = new URLSearchParams(window.location.search);
    const jointsParam = params.get("j");
    if (!jointsParam) return;

    const coords = jointsParam.split(";").map(pair => {
        const [x,y, g] = pair.split(",").map(Number);
        return {x,y, ground: !!g };
    });
    
    coords.forEach((coord, i) => {
        if (joints[i]) {
            joints[i].x = coord.x;
            joints[i].y = coord.y;
            joints[i].ground = coord.ground;
        }
    });

    const cpVis = params.get("cp") === "1";
    const gVis = params.get("gv") === "1";
    const cSnap = params.get("cs") === "1";
    const xOver = params.get("xo") === "1";
    const aTraceVis = params.get("at") === "1";
    const bTraceVis = params.get("bt") === "1";
    const cTraceVis = params.get("ct") === "1";

    couplerVisible = cpVis;
    groundVisible = gVis;

    couplerSnap = cSnap;

    crossoverActive = xOver;

    aTracersVis = aTraceVis;
    bTracersVis = bTraceVis;
    cTracersVis = cTraceVis;

    const coordsVis = params.get("cv") === "1";
    const lengthsVis = params.get("lv") === "1";

    coordsVisible = coordsVis;
    lengthsVisible = lengthsVis;
    setLabelsVis();

    setOpenCrossed();
    setLinkLengths();
    setCouplerGeom();
    setCouplerVis(couplerVisible);
    setTracerVis("A1", aTracersVis);
    setTracerVis("B1", bTracersVis);
    setTracerVis("Cp", cTracersVis);
    drawTracePaths();
    updateDiagram();
}
function loadViewFromURL(){
    const params = new URLSearchParams(window.location.search);
    const zoomScale = parseFloat(params.get("z")) || defaultScale;
    const zoomX = parseFloat(params.get("x")) || defaultX;
    const zoomY = parseFloat(params.get("y")) || defaultY;
    const rotation = parseFloat(params.get("r")) || currentRotation;
    
    svg.call(zoom.transform, d3.zoomIdentity.translate(zoomX, zoomY).scale(zoomScale));
    rotateDiagram(rotation);
    currentRotation = rotation;

    const rotationSlider = document.getElementById("rotateSlider");
    // const rotationValue = document.getElementById("rotateValue");

    rotationSlider.value = currentRotation
    // rotationValue.textContent = `${currentRotation.toFixed(0)}°`;
}

function toggleGround() {
    groundVisible = !groundVisible;
    polygons
        .filter(d => d.type === "ground")
        .style("display", groundVisible ? "block" : "none");
}

function toggleCoupler(link) {
    if (couplerSnap) return;

    if (link.nodes.length === 3) {
        link.nodes = link.nodes.slice(0,2);
        setCouplerGeom();
        setCouplerVis(false);
    } else {
        const [Cp_x, Cp_y] = getCouplerPosition();
        originalCoupler.nodes[2].x = Cp_x;
        originalCoupler.nodes[2].y = Cp_y;
        const original = originalCoupler;
        link.nodes = [...original.nodes];
        setCouplerVis(true);
    }
    couplerVisible = !couplerVisible;
    if (couplerVisible) {
        document.getElementById("snapCoupler").disabled = false;
    } else {
        document.getElementById("snapCoupler").disabled = true;
    }
}

// function initializeSlider() {
//     let [minAngle, maxAngle, inputClass] = getInputLimits(); // in degrees
//     let currentAngle = getInputAngle(); // in degrees

//     const inputSlider = document.getElementById("inputAngleSlider");
//     const angleDisplay = document.getElementById("angleValue");

//     if (inputClass === "0-Rocker") {
//         if (currentAngle > 180) {
//             currentAngle = currentAngle -360
//         }
//     }

//     inputSlider.min = minAngle + simAngleTol;
//     inputSlider.max = maxAngle - simAngleTol;
//     inputSlider.value = currentAngle;
    
//     angleDisplay.textContent = `${currentAngle.toFixed(0)}°`; 
// }

function rotateDiagram(rotAngle) {
    currentRotation = rotAngle;
    const rotationSlider = document.getElementById("rotateSlider");
    rotationSlider.value = currentRotation;

    if (currentRotation === 0) {
        labCoords[0].visible = false;
    } else {
        labCoords[0].visible = true;
    }
    labCoords[0].text = `${currentRotation.toFixed(0)}°`;

    viewTransform();
    
}

function rotateText(angle) {
    joints.forEach(joint => {
        const jx = joint.x;
        const jy = joint.y;
        coords
            .filter(d => d.id === joint.id) 
            .attr("transform",`rotate(${angle}, ${jx}, ${jy})`)
    })

    links.forEach(link => {
        const id = link.id;
        const nodes = link.nodes;
        const lx = (nodes[1].x + nodes[0].x)/2;
        const ly = (nodes[1].y + nodes[0].y)/2;
        lengths
            .filter(d => d.id === link.id)
            .attr("transform", `rotate(${angle},${lx},${ly})`)
    })
}

function fitView(transition) {
    const centerX = getLinkageCenter()[0];
    const centerY = getLinkageCenter()[1];

    const dur = transition ? 500 : 0;

    const centerScale = Math.min(windowWidth/(viewMaxX-viewMinX), windowHeight/(viewMaxY-viewMinY))*.7;

    svg.transition().duration(dur).call(zoom.transform, d3.zoomIdentity
        // .translate(defaultX, defaultY)
        .translate(defaultX-centerX*2, defaultY-centerY*2)
        // .scale(defaultScale)
        .scale(centerScale)
    );
}

function viewTransform() {
    // const pivot = joints[0]
    // const pivot = {x: (joints[3].x + joints[0].x)/2, y: (joints[3].y + joints[0].y)/2};
    const pivot = getLinkageCenter();
    const cx = pivot[0];
    const cy = pivot[1];

    const centerX = getLinkageCenter()[0];
    const centerY = getLinkageCenter()[1];

    const rotation = `rotate(${-currentRotation}, ${cx}, ${cy})`
    const zoom = `
        translate(${currentZoomTransform.x}, ${currentZoomTransform.y})
        scale(${currentZoomTransform.k})
    `;

    rotateText(currentRotation);

    zoomGroup.attr("transform", `${zoom} ${rotation} `);

}

function updateStats() {
    const [A_min, A_max ,inputClass] = getInputLimits();
    const [B_min, B_max ,outputClass] = getOutputLimits();

    const inputAngle = getInputAngle();
    const outputAngle = radToDeg(calcOutputAngle(degToRad(inputAngle),linkageConfig));
    const openCrossed = getOpenCrossed();

    const inputALab = labCoords.find(d => d.id === "inputAngle")
    const inputAText = `Input: ${inputAngle.toFixed(1)}°`;
    inputALab.text = inputAText;

    const inputCLab = labCoords.find(d => d.id === "inputClass")
    const inputCText = `${inputClass} (${A_min.toFixed(1)}°, ${A_max.toFixed(1)}°)`;
    inputCLab.text = inputCText;

    const outputALab = labCoords.find(d => d.id === "outputAngle")
    const outputAText = `Output: ${outputAngle.toFixed(1)}°`;
    outputALab.text = outputAText;

    const outputCLab = labCoords.find(d => d.id === "outputClass")
    const outputCText = `${outputClass} (${B_min.toFixed(1)}°, ${B_max.toFixed(1)}°)`;
    outputCLab.text = outputCText;

}

function drawTracePaths() {
    // const steps = 500;
    viewMinX = joints[0].x;
    viewMaxX = joints[0].x;
    viewMinY = joints[0].y;
    viewMaxY = joints[0].y;
    calcNodePath("A1", 100, linkageConfig);
    calcNodePath("B1", 100, linkageConfig);
    calcNodePath("Cp", 1000, linkageConfig);
    calcFullPath("A1", 100, linkageConfig);
    calcFullPath("B1", 100, linkageConfig);
    calcFullPath("Cp", 1000, linkageConfig);
}

function toggleTracer(node) {
    if (node === "A1") {
        aTracersVis = !aTracersVis;
        tracerVis = aTracersVis
    } else if (node === "B1") {
        bTracersVis = !bTracersVis;
        tracerVis = bTracersVis
    } else if (node === "Cp") {
        cTracersVis = !cTracersVis;
        tracerVis = cTracersVis
    }
    setTracerVis(node, tracerVis);
}

function dblclickTracers(d){
    if (d === "A1") {
        toggleTracer("A1");
    } else if (d === "B1") {
        toggleTracer("B1");
    } else if (d === "Cp") {
        toggleTracer("Cp");
    } else {
        toggleGround();
    }
    updateDiagram();
}

function invertLinkage() {
    const aVert = joints[1].y - joints[0].y;
    const bVert = joints[2].y - joints[3].y;
    const inputAngle = getInputAngle();

    joints[1].y = joints[0].y - aVert;
    joints[2].y = joints[3].y - bVert;

    setOpenCrossed();

    const newCp = calcJointPosition("Cp",degToRad(-inputAngle), linkageConfig);
    joints[4].x = newCp[0];
    joints[4].y = newCp[1];

    couplerSetAngle = 360-couplerSetAngle;

    rotateInputLink(-inputAngle);
    drawTracePaths();    
}

function toggleOpenCrossed() {
    if (configToggled) return
    if (linkageConfig == "Open") {
        linkageConfig = "Crossed";
    } else {
        linkageConfig = "Open";
    }
    // rotateInputLink(getInputAngle());
    // drawTracePaths();
    // updateDiagram();
}

function snapCoupler() {
    setCouplerGeom();
    drawTracePaths();
    updateDiagram();
}

function swapInputOutput() {
    const inLength = aLength;
    const outLength = bLength;
    const newInAngle = 180-getLinkAngles()[1];

    const couplerLink = links.find(l => l.id === "c");
    const Cp = couplerLink.nodes[2];
    // const th_A1Cp_rad = degToRad(couplerSetAngle - getLinkAngles()[2]);
    
    aLength = outLength;
    bLength = inLength;

    const A1_new = calcNodePosition("A1", newInAngle);
    const b_thNew = calcOutputAngle(degToRad(newInAngle), linkageConfig);
    const B1_new = calcNodePosition("B1", radToDeg(b_thNew));

    const newCouplerLength = Math.sqrt((joints[4].x-joints[2].x)*(joints[4].x-joints[2].x) + (joints[4].y-joints[2].y)*(joints[4].y-joints[2].y))
    let th_B1Cp = -radToDeg(Math.atan((joints[4].y - joints[2].y) / (joints[4].x - joints[2].x)))
    if (joints[4].x > joints[2].x) th_B1Cp = th_B1Cp-180;

    joints[1].x = A1_new[0];
    joints[1].y = A1_new[1];
    joints[2].x = B1_new[0];
    joints[2].y = B1_new[1];

    couplerSetLength = newCouplerLength;

    Cp.x = joints[1].x + couplerSetLength * Math.cos(degToRad(th_B1Cp))
    Cp.y = joints[1].y + couplerSetLength * Math.sin(degToRad(th_B1Cp))

    let viewRotate = 0;
    if (currentRotation < 180) {
        viewRotate = currentRotation + 180
    } else {
        viewRotate = currentRotation -180
    }

    setLinkLengths();
    setCouplerGeom();
    invertLinkage();
    rotateDiagram(viewRotate);
}

function rotateInputLink(angleDeg) {

    const a = aLength; // input
    const b = bLength; // output
    // const c = cLength; // coupler
    // const d = dLength; // ground

    const inLength = a * linkScale;
    const outLength = b * linkScale;
    
    const angleAdj = angleDeg;

    const angleIn = degToRad(angleAdj);
    const angleOut = calcOutputAngle(angleIn, linkageConfig);

    const inputLink = links.find(l => l.id === "a");
    const [inFixed, inMoving] = inputLink.nodes;

    inMoving.x = inFixed.x + inLength * Math.cos(angleIn);
    inMoving.y = inFixed.y - inLength * Math.sin(angleIn); // SVG Y-axis is downward

    const outputLink = links.find(l => l.id === "b");
    const [outMoving, outFixed] = outputLink.nodes;

    outMoving.x = outFixed.x + outLength * Math.cos(angleOut);
    outMoving.y = outFixed.y - outLength * Math.sin(angleOut); // SVG Y-axis is downward

    // Coupler point
    if (couplerVisible) {
        const couplerLink = links.find(l => l.id === "c");
        const Cp = couplerLink.nodes[2];

        const th_A1Cp_rad = degToRad(couplerSetAngle - getLinkAngles()[2]);

        Cp.x = joints[1].x + couplerSetLength * Math.cos(th_A1Cp_rad);
        Cp.y = joints[1].y + couplerSetLength * Math.sin(th_A1Cp_rad);
    }
}

function incrementLinkage() {
    
    //convert rpm input to degrees per frame
    const incrAngle = animationSpeed/10

    let currentAngle = getInputAngle();
    const minAngle = getInputLimits()[0];
    const maxAngle = getInputLimits()[1];

    //Increment the angle in the current direction
    currentAngle = currentAngle + animationDir*incrAngle;
    //When the angle reaches the max limit...
    if (currentAngle > maxAngle) {
        //For crank input, wrap around at limits. Otherwise, reverse direction
        if (getInputLimits()[2] === "Crank") {
            currentAngle = minAngle+incrAngle;
        } else {
            currentAngle = maxAngle - simAngleTol;
            if (animationReverse) {
                animationReverse = false;
            } else {
                animationDir = -1;
            }
        }
    } 
    //Same logic for min angle
    else if (currentAngle < minAngle) {
        if (getInputLimits()[2] === "Crank") {
            currentAngle = maxAngle - incrAngle;
        } else {
            currentAngle = minAngle + simAngleTol;
            if (animationReverse) {
                animationReverse = false;
            } else {
                animationDir = 1;
            }
        }
    }
    //Set the input link to the new angle and update the display
    rotateInputLink(currentAngle);
    updateDiagram();
}

function startAnimationLoop() {
    animationTimer = d3.timer(() => {
        incrementLinkage();
    }
);
}
function stopAnimationLoop() {
    if (animationTimer) {
        animationTimer.stop();
        animationTimer = null;
    }
}

function updatePlotSelection() {
    const plotVarSelect = document.querySelector('input[name="plotVarOption"]:checked').value;
    plotVariable = plotVarSelect;
}

function updateDiagram() {
    if (coordsVisible || lengthsVisible) rotateText(currentRotation)
    setOpenCrossed();
    updateStats()
    calcPlotPath(linkageConfig);
    updatePlotSelection()

    // setTracePoints("A1");
    // setTracePoints("B1");
    // setTracePoints("Cp");
    paths
        .attr("points", d => d.points)
    fullPaths
        .attr("points", d => d.points)

    tracePoints
        .attr("cx", d => d.x).attr("cy", d => d.y)
    // traceEnds
    //     .attr("cx", d => d.min[0]).attr("cy", d => d.min[1])
    // traceStarts
    //     .attr("cx", d => d.max[0]).attr("cy", d => d.max[1])

    circles
        .attr("cx", d => d.x).attr("cy", d => d.y)
        .attr("r", d => {
            if(d.id === "Cp" && couplerSnap) return 3.5;
            if(d.type === "node") return 3;
            if(d.type === "joint") return 2.5;
            return 3.5;
        })
        .attr("stroke", d => {
            if (d.type === "ground") return "black";
            if (d.id === "Cp" && couplerSnap) return couplerColor
            return "transparent";
        })
        .attr("stroke-width", d => {
        if (d.type === "ground") return 2.2
        if (d.id === "Cp" && couplerSnap) return 1
        return 6
        })

    dragnodes
        .attr("cx", d => d.x).attr("cy", d => d.y)
        .attr("r", d => {
            if(d.type === "node") return 13;
            return 10;
        })

    polygons
        .attr("points", d => d.nodes.map(j => `${j.x},${j.y}`).join(" "))
        .attr("stroke-width", d => {
            if (d.type === "ground") return 2
            return 12
        })
        .attr("stroke", d => {
            if (d.type === "ground") return "black"
            return d.color
        })
        .attr("fill", d => {
            if (d.type === "ground") return "none"
            return d.color
        })
        .attr("opacity", d => {
            if (d.type === "ground") return 1;
            return linkOpactity;
        })
    polygons
        .filter(d => d.type === "ground")
        .style("display", groundVisible ? "block" : "none");

    const origin = joints.find(j => j.id === "A0");

    coords
        .attr("x", (d, i) => d.x + labelOffsetX)
        .attr("y", (d, i) => d.y + labelOffsetY)
        .text(d => {
            const dx = (d.x - origin.x)/linkScale;
            const dy = (d.y - origin.y)/linkScale;
            return `(${dx.toFixed(1)}, ${dy.toFixed(1)})`;
        })

    lengths
        .attr("x", d => (d.nodes[0].x + d.nodes[1].x) / 2 + labelOffsetX)
        .attr("y", d => (d.nodes[0].y + d.nodes[1].y) / 2 + labelOffsetY)
        .text(d => {
            const dx = d.nodes[0].x - d.nodes[1].x;
            const dy = d.nodes[0].y - d.nodes[1].y;
            const length = Math.sqrt(dx * dx + dy * dy)/linkScale;
            return length.toFixed(1);
        })
    
    labels
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .text(d => d.text)
        .style("display", d => d.visible ? "block" : "none");

    axes
        .attr("x1", d => {
            if (d.id === "xValTick") return getPlotCoord()[0]
            return d.x1
        })
        .attr("x2", d => {
            if (d.id === "xValTick") return getPlotCoord()[0]
            return d.x2
        })
        .attr("y1", d => {
            if (d.id === "yValTick") return getPlotCoord()[1]
            return d.y1
        })
        .attr("y2", d => {
            if (d.id === "yValTick") return getPlotCoord()[1]
            return d.y2
        })

    plotLabels.find(d => d.id === "openKey").opacity = (linkageConfig === "Crossed") ? 0.35 : 1;
    plotLabels.find(d => d.id === "crossedKey").opacity = (linkageConfig === "Crossed") ? 1 : 0.35;
    plotLabs
        .text( d => {
            if (d.id === "xMinLab") return `${getInputLimits()[0].toFixed(0)}°`
            if (d.id === "xMaxLab") return `${getInputLimits()[1].toFixed(0)}°`
            if (d.id === "yMinLab") return `${getPlotLimits()[2].toFixed(0)}°`
            if (d.id === "yMaxLab") return `${getPlotLimits()[3].toFixed(0)}°`
            if (d.id === "xValLab") return `${getInputAngle().toFixed(0)}°`
            if (d.id === "yValLab") return `${getPlotVarValue().toFixed(0)}°`
            if (d.id === "plotTitle") return `${plotVariable} vs Input Angle`
            return d.text
        })
        .attr("x", d => {
            if (d.id === "xValLab") return getPlotCoord()[0]
            return d.x
        })
        .attr("y", d => {
            if (d.id === "yValLab") return getPlotCoord()[1]
            return d.y
        })
        .attr("fill", d => {
            if (d.id === "yMinLab") {
                if (getPlotCoord()[1] > yMinTick-10) {
                    return "transparent"
                } else if (plotVariable === "Output Angle") {
                    return outputColor
                }
            }
            if (d.id === "yMaxLab") {
                if (getPlotCoord()[1] < yMaxTick+10) {
                    return "transparent"
                } else if (plotVariable === "Output Angle") {
                    return outputColor
                }
            }
            if (d.id === "yValLab" && plotVariable === "Output Angle") {
                return outputColor
            }

            if (d.id === "xMinLab" && getPlotCoord()[0] < xMinTick+20) return "transparent"
            if (d.id === "xMaxLab" && getPlotCoord()[0] > xMaxTick-20) return "transparent"
            // if (d.id === "yMinLab" && getPlotCoord()[1] > yMinTick-10) return "transparent"
            // if (d.id === "yMaxLab" && getPlotCoord()[1] < yMaxTick+10) return "transparent"
            return d.color
        })
        .attr("opacity", d => d.opacity)

    plotPoints[0].x = getPlotCoord()[0];
    plotPoints[0].y = getPlotCoord()[1];
    plotPoints[0].fill = (linkageConfig === "Crossed") ? "black" : "white";
    plotPoints.find(d => d.id === "openKey").opacity = (linkageConfig === "Crossed") ? 0.35 : 1;
    plotPoints.find(d => d.id === "crossedKey").opacity = (linkageConfig === "Crossed") ? 1 : 0.35;
    plotPoints.find(d => d.id === "minLim" || d.id === "maxLim").visible = enableManualLimits ? "block" : "none";

    plotPoint
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("fill", d => d.fill)
        .attr("opacity", d => d.opacity)
        .style("display", d => d.visible)

    plotDrag
        .attr("cx", getPlotCoord()[0])
        .attr("cy", getPlotCoord()[1])
        // .attr("cx", d => d.x)
        // .attr("cy", d => d.y)
    plotLine
        .attr("points", d => d.points)
    transIdeal
        .style("display", plotVariable === "Transmission Angle" ? "block" : "none")

    document.getElementById("linkageSummary").innerHTML = getLinkageProperties() 
    // viewTransform();
    // initializeSlider();
    if (getInputLimits()[2] === "Crank") {
        // document.getElementById("toggleDir").disabled = false;
        document.getElementById("toggleCross").disabled = true;
    } else {
        // document.getElementById("toggleDir").disabled = true;
        document.getElementById("toggleCross").disabled = false;
    }
}