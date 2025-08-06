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
        couplerVisible = false;
    } else {
        const original = getOriginalCoupler();
        link.nodes = [...original.nodes];
        circles
            .style("display", d => {
                if (d.id === "Cp") return "block"
            });
        couplerVisible = true;
    }
}

function getOriginalCoupler() {
    return originalCoupler;
}

function initializeSlider() {
    const [minAngle, maxAngle, inputClass] = getInputLimits(); // in degrees
    const currentAngle = getInputAngle(); // in degrees

    const inputSlider = document.getElementById("inputAngleSlider");
    const angleDisplay = document.getElementById("angleValue");

    inputSlider.min = minAngle + simAngleTol;
    inputSlider.max = maxAngle - simAngleTol;
    inputSlider.value = currentAngle;
    
    angleDisplay.textContent = `${currentAngle.toFixed(0)}°, ${inputClass}: (${minAngle.toFixed(0)}, ${maxAngle.toFixed(0)})`; 

}

function setCouplerPoint () {

}

function rotateInputLink(angleDeg) {
    const lengths = getLinkLengths();
    const angles = getLinkAngles();

    const a = lengths["a"]; // input
    const b = lengths["b"]; // output
    const c = lengths["c"]; // coupler
    const d = lengths["d"]; // ground

    // couplerSetLength = Math.sqrt((joints[4].x-joints[1].x)*(joints[4].x-joints[1].x) + (joints[4].y-joints[1].y)*(joints[4].y-joints[1].y))
    // couplerSetAngle = angles[4]-angles[2];

    const inLength = a * linkScale;
    const outLength = b * linkScale;
    
    const angleAdj = angleDeg;

    const angleIn = degToRad(angleAdj);

    const inputLink = links.find(l => l.id === "a");
    const [inFixed, inMoving] = inputLink.nodes;

    inMoving.x = inFixed.x + inLength * Math.cos(angleIn);
    inMoving.y = inFixed.y - inLength * Math.sin(angleIn); // SVG Y-axis is downward

    const U = a*a + b*b - c*c + d*d - 2*a*d*Math.cos(angleIn);
    const V = 2*a*b*Math.sin(angleIn);
    const W = 2*b*(d-a*Math.cos(angleIn));

    let tanw = 0;

    if (linkageConfig === "Crossed") {
        tanw = (-V-Math.sqrt(V*V - U*U + W*W))/(W - U);
    } else {
        tanw = (-V+Math.sqrt(V*V - U*U + W*W))/(W - U);
    }

    const angleOut = Math.atan(tanw)*2;

    // const angleOut = calcOutputAngle(angleIn);

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
    
    circles
        .attr("cx", d => d.x).attr("cy", d => d.y)
        .attr("r", d => {
            if(d.type === "node") return 3;
            if(d.type === "joint") return 2.5;
            return 3.5;
        })
        .attr("stroke", d => {
            if (d.static) return "";
            // if (d.type === "node") return "";
            if (d.type === "ground") return "black";
            return "";
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

    // const linkLengths = getLinkLengths();
    document.getElementById("linkageSummary").innerHTML = getLinkageProperties() 
    initializeSlider();
}

