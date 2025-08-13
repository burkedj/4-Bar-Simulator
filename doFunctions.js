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
    const aTraceVis = params.get("at") === "1";
    const bTraceVis = params.get("bt") === "1";
    const cTraceVis = params.get("ct") === "1";

    couplerVisible = cpVis;
    groundVisible = gVis;
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

function toggleCoupler(link) {
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
}

function initializeSlider() {
    let [minAngle, maxAngle, inputClass] = getInputLimits(); // in degrees
    let currentAngle = getInputAngle(); // in degrees

    const inputSlider = document.getElementById("inputAngleSlider");
    const angleDisplay = document.getElementById("angleValue");

    if (inputClass === "0-Rocker") {
        if (currentAngle > 180) {
            currentAngle = currentAngle -360
        }
    }

    inputSlider.min = minAngle + simAngleTol;
    inputSlider.max = maxAngle - simAngleTol;
    inputSlider.value = currentAngle;
    
    angleDisplay.textContent = `${currentAngle.toFixed(0)}°`; 
}

function rotateDiagram(rotAngle) {
    currentRotation = rotAngle;
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

function viewTransform() {
    const pivot = joints[0]
    const cx = pivot.x;
    const cy = pivot.y;

    const rotation = `rotate(${-currentRotation}, ${cx}, ${cy})`
    const zoom = `
        translate(${currentZoomTransform.x}, ${currentZoomTransform.y})
        scale(${currentZoomTransform.k})
    `;

    rotateText(currentRotation);

    zoomGroup.attr("transform", `${zoom} ${rotation} `);

}

function drawTracePaths() {
    // const steps = 500;
    calcNodePath("A1", 100, linkageConfig);
    calcNodePath("B1", 100, linkageConfig);
    calcNodePath("Cp", 1000, linkageConfig);
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
    }
    updateDiagram();
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
    // const range = getInputLimits()[1] - getInputLimits()[0];
    
    const incrAngle = animationSpeed/10

    let currentAngle = getInputAngle();
    const minAngle = getInputLimits()[0];
    const maxAngle = getInputLimits()[1];

    currentAngle = currentAngle + animationDir*incrAngle;
    if (currentAngle > maxAngle) {
        if (getInputLimits()[2] === "Crank") {
            currentAngle = minAngle+incrAngle;
        } else {
            currentAngle = maxAngle-simAngleTol;
            animationDir = -1;
        }
    } 
    else if (currentAngle < minAngle) {
        if (getInputLimits()[2] === "Crank") {
            currentAngle = maxAngle-incrAngle;
        } else {
            currentAngle = minAngle+simAngleTol;
            animationDir = 1;
        }
    }
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

function updateDiagram() {
    setOpenCrossed();

    paths
        .attr("points", d => d.points)

    tracePoints
        .attr("cx", d => d.x).attr("cy", d => d.y)

    circles
        .attr("cx", d => d.x).attr("cy", d => d.y)
        .attr("r", d => {
            if(d.type === "node") return 3;
            if(d.type === "joint") return 2.5;
            return 3.5;
        })
        .attr("stroke", d => {
            if (d.type === "ground") return "black";
            return "transparent";
        })
        .attr("stroke-width", d => {
        if (d.type === "ground") return 2.2
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
        .text(`${currentRotation.toFixed(0)}°`)
        .style("display", d => {
            if (currentRotation === 0) return "none";
            return "block";
        })

    document.getElementById("linkageSummary").innerHTML = getLinkageProperties() 
    viewTransform();
    initializeSlider();
    if (getInputLimits()[2] === "Crank") {
        // document.getElementById("toggleDir").disabled = false;
        document.getElementById("toggleCross").disabled = true;
    } else {
        // document.getElementById("toggleDir").disabled = true;
        document.getElementById("toggleCross").disabled = false;
    }
}