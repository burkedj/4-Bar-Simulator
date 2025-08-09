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
}
function loadViewFromURL(){
    const params = new URLSearchParams(window.location.search);
    const zoomScale = parseFloat(params.get("z")) || defaultScale;
    const zoomX = parseFloat(params.get("x")) || defaultX;
    const zoomY = parseFloat(params.get("y")) || defaultY;
    
    svg.call(zoom.transform, d3.zoomIdentity.translate(zoomX, zoomY).scale(zoomScale));
}

function toggleCoupler(link) {
    if (link.nodes.length === 3) {
        link.nodes = link.nodes.slice(0,2);
        circles
            .style("display", d => {
                if (d.id === "Cp") return "none"
            })
        couplerSetAngle = getCouplerGeom()[1];
        couplerSetLength = getCouplerGeom()[0];
    } else {
        const [Cp_x, Cp_y] = calcCouplerPosition();
        originalCoupler.nodes[2].x = Cp_x;
        originalCoupler.nodes[2].y = Cp_y;
        const original = originalCoupler;
        link.nodes = [...original.nodes];
        circles
            .style("display", d => {
                if (d.id === "Cp") return "block"
            });
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

function rotateInputLink(angleDeg) {
    const lengths = getLinkLengths();
    // const angles = getLinkAngles();

    const a = lengths["a"]; // input
    const b = lengths["b"]; // output
    const c = lengths["c"]; // coupler
    const d = lengths["d"]; // ground

    const inLength = a * linkScale;
    const outLength = b * linkScale;
    
    const angleAdj = angleDeg;

    const angleIn = degToRad(angleAdj);
    const angleOut = calcOutputAngle(angleIn);

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

function updateDiagram() {
    calcNodePath("A1", 100)
    calcNodePath("B1", 100)
    calcNodePath("Cp",100)

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

    // rings
    //     // .filter(d => d.type === "ground")
    //     .attr("cx", d => d.x).attr("cy", d => d.y)
    //     .attr("r", 10);

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
        // .attr("stroke-dasharray", d => {
        //     if (d.type === "ground") return "6,6"
        //     return "0"
        // })


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

    groundAngle = getLinkAngles()[3];

    // const linkLengths = getLinkLengths();
    document.getElementById("linkageSummary").innerHTML = getLinkageProperties() 
    initializeSlider();
}

