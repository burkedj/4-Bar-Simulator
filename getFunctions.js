function getLinkLengths() {
    const getLength = (a, b) => {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy) / linkScale;
    };

    const lengths = {};

    links.forEach(link => {
        const id = link.id;
        const nodes = link.nodes;
        lengths[id] = getLength(nodes[0], nodes[1]);
    });

    return lengths;
}

function getLinkAngles () {
    const A0 = joints[0];
    const A1 = joints[1];
    const B1 = joints[2];
    const B0 = joints[3];
    const Cp = joints[4];

    let th_a = radToDeg(Math.atan((A0.y-A1.y)/(A1.x-A0.x)));
    if (A1.x < A0.x) {
        th_a = 180 + th_a;
    } else if (A1.y > A0.y) {
        th_a = 360 + th_a;
    }
    // th_a = th_a;
    if (th_a < 0 )  th_a = 360 + th_a;

    let th_b = radToDeg(Math.atan(-(B1.y-B0.y)/(B1.x-B0.x)));
    if (B1.x < B0.x) {
        th_b = 180 + th_b;
    } else if (B1.y > B0.y) {
        th_b = 360 + th_b;
    }
    // th_b = th_b;
    if (th_b < 0 )  th_b = 360 + th_b;

    let th_c = -radToDeg(Math.atan((B1.y-A1.y)/(B1.x-A1.x)));
    if (B1.x < A1.x) {
        th_c = 180 + th_c;
    } else if (B1.y > A1.y) {
        th_c = 360 + th_c;
    }
    // th_c = th_c;
    if (th_c < 0 )  th_c = 360 + th_c;

    let th_d = -radToDeg(Math.atan((B0.y-A0.y)/(B0.x-A0.x)));
    if (B0.x < A0.x) {
        th_d = 180 + th_d;
    } else if (B0.y > A0.y) {
        th_d = 360 + th_d;
    }

    let th_A1Cp = -radToDeg(Math.atan((Cp.y-A1.y)/(Cp.x-A1.x)));
    if (Cp.x < A1.x) {
        th_A1Cp = 180 + th_A1Cp;
    } else if (Cp.y > A1.y) {
        th_A1Cp = 360 + th_A1Cp;
    }
    // th_A1Cp = th_A1Cp;
    if (th_A1Cp < 0 )  th_A1Cp = 360 + th_A1Cp;

    let th_B0A1 = -radToDeg(Math.atan((A1.y-B0.y)/(A1.x-B0.x)));
    if (A1.x < B0.x) {
        th_B0A1 = 180 + th_B0A1;
    } else if (A1.y > B0.y) {
        th_B0A1 = 360 + th_B0A1;
    }
    // th_B0A1 = th_B0A1;
    if (th_B0A1 < 0 )  th_B0A1 = 360 + th_B0A1;

    let th_B1Cp = -radToDeg(Math.atan((Cp.y - B1.y) / (Cp.x - B1.x)))
    if (Cp.x < B1.x) {
        th_B1Cp = 180 + th_B1Cp;
    } else if (Cp.y > B1.y) {
        th_B1Cp = 360 + th_B1Cp;
    }
    if (th_B1Cp < 0 )  th_B1Cp = 360 + th_B1Cp;

    return [th_a, th_b, th_c, th_d, th_A1Cp, th_B0A1, th_B1Cp];
}

function getInputLimits() {

    const a = aLength; // input
    const b = bLength; // output
    const c = cLength; // coupler
    const d = dLength; // ground

    let A_min = 0;
    let A_max = 360;

    const A_min_temp = ((c-b)*(c-b) - a*a - d*d)/(2*a*d);
    const A_max_temp = ((c+b)*(c+b) - a*a - d*d)/(2*a*d);

    const A_min_rad = Math.acos(A_min_temp);
    const A_max_rad = Math.acos(A_max_temp);

    let A_min_deg = radToDeg(Math.acos(A_min_temp));
    if (A_min_deg < 0 )  A_min_deg = 360 + A_min_deg;

    let A_max_deg = radToDeg(Math.acos(A_max_temp));
    if (A_max_deg < 0 )  A_max_deg = 360 + A_max_deg;

    if (Number.isNaN(A_min_rad) & Number.isNaN(A_max_rad)) {
        A_min = 0;
        A_max = 360;
        inputClass = "Crank";
    } else if (Number.isNaN(A_min_rad)) {
        A_max = 180-A_max_deg;
        A_min = -A_max;
        // A_min = 360-A_max;
        inputClass = "0-Rocker";
    } else if (Number.isNaN(A_max_rad)) {
        A_min = 180-A_min_deg;
        A_max = 360-A_min;
        inputClass = "π-Rocker";
    } else {
        A_min = 180-A_min_deg;
        A_max = 180-A_max_deg;
        inputClass = "Rocker";
    }

    if (inputClass === "Rocker" & joints[1].y > joints[0].y) {
        A_min = 360-A_min;
        A_max = 360-A_max;
    }

    if (A_min > A_max) {
        const A_swap = A_min;
        A_min = A_max;
        A_max = A_swap;
    }

    return [A_min, A_max ,inputClass];
}

function getOutputLimits() {

    const a = aLength; // input
    const b = bLength; // output
    const c = cLength; // coupler
    const d = dLength; // ground

    let B_min = 0;
    let B_max = 360;

    const B_min_temp = ((c-a)*(c-a) - b*b - d*d)/(2*b*d);
    const B_max_temp = ((c+a)*(c+a) - b*b - d*d)/(2*b*d);

    const B_min_rad = Math.acos(B_min_temp);
    const B_max_rad = Math.acos(B_max_temp);
    

    if (Number.isNaN(B_min_rad) & Number.isNaN(B_max_rad)) {
        B_min = 0;
        B_max = 360;
        outputClass = "Crank";
    } else if (Number.isNaN(B_min_rad)) {
        B_max = radToDeg(B_max_rad);
        B_min = 360-B_max;
        // B_min = 360-B_max;
        outputClass = "π-Rocker"
    } else if (Number.isNaN(B_max_rad)) {
        B_min = radToDeg(B_min_rad);
        B_max = -B_min;
        outputClass = "0-Rocker"
    } else {
        B_min = radToDeg(B_min_rad);
        B_max = radToDeg(B_max_rad);
        outputClass = "Rocker"
    }
    if (linkageConfig === "Crossed" & outputClass !== "0-Rocker") {
        B_min = 360-B_min;
        B_max = 360-B_max;
    }
    if (linkageConfig === "Crossed" & outputClass === "Rocker" & joints[2].y<joints[3].y) {
        B_min = 360-B_min;
        B_max = 360-B_max;
    }
    if (linkageConfig === "Open" & outputClass === "Rocker" & joints[2].y>joints[3].y) {
        B_min = 360-B_min;
        B_max = 360-B_max;
    }
    
    if (B_min > B_max) {
        const B_swap = B_min;
        B_min = B_max;
        B_max = B_swap;
    }

    return [B_min, B_max ,outputClass];

}

function getInputAngle() {

    let inputAngle = getLinkAngles()[0]
    if (getInputLimits()[2] === "0-Rocker") {
        if(inputAngle > 180) {
            inputAngle = inputAngle-360;
        }
    }

    return inputAngle;
}

function getOutputAngle() {

    let outputAngle = 180-getLinkAngles()[1];
    if (joints[2].y > joints[3].y) {
        outputAngle = 360 + outputAngle;
    }
    return outputAngle;
}

function getTransmissionAngle() {
    let th_trans = Math.abs(getLinkAngles()[1] - getLinkAngles()[2]);

    if (th_trans > 180) th_trans = 360 - th_trans

    return th_trans;
}

function getCouplerGeom() {
    let couplerLength = Math.sqrt((joints[4].x-joints[1].x)*(joints[4].x-joints[1].x) + (joints[4].y-joints[1].y)*(joints[4].y-joints[1].y));
    let couplerAngle = -(getLinkAngles()[4]-getLinkAngles()[2]);
    if (joints[4].x < joints[1].x) {
        couplerAngle = 360 + couplerAngle;
    } else if (joints[4].y > joints[1].y) {
        couplerAngle = 360 + couplerAngle;
    }

    return [couplerLength, couplerAngle];
}

function getCouplerPosition() {
    const th_A1Cp_rad = degToRad(couplerSetAngle - getLinkAngles()[2]);

    const Cp_x = joints[1].x + couplerSetLength * Math.cos(th_A1Cp_rad);
    const Cp_y = joints[1].y + couplerSetLength * Math.sin(th_A1Cp_rad);

    return [Cp_x, Cp_y];
}

function getOpenCrossed() {
    const th_a = getLinkAngles()[0];
    const th_b = getLinkAngles()[1];
    const th_c = getLinkAngles()[2]
    const th_B0A1 = getLinkAngles()[5];

    // const B0 = joints[2];
    // const B1 = joints[3];

    let linkConfig = "Open"
    if (th_a > 180) {
        linkConfig = "Crossed";
    }
    if (th_a <= 180 & th_b < th_c & th_b > th_B0A1) {
        linkConfig = "Crossed";
    } else if (th_a > 180 & -th_b < -th_c & -th_b > -th_B0A1) {
        linkConfig = "Open";
    }

    let tempAngle = th_a;

    if (getInputLimits()[2] === "0-Rocker" & th_a > 180) {
        tempAngle = th_a -360;
    }
    if (crossoverActive & ((getOutputLimits()[2] !== "Rocker" | (getOutputLimits()[2] === "Rocker" & getInputLimits()[2] === "Rocker")) & getInputLimits()[2] !== "Crank")) {
        if (tempAngle < (getInputLimits()[0]+simAngleTol*2)) {
            if (linkageConfig == "Open") {
                linkConfig = "Crossed";
            } else {
                linkConfig = "Open";
            }
        } 
        else if ((tempAngle > (getInputLimits()[1]-simAngleTol*2)) & getInputLimits()[2] !== "Crank") {
            if (linkageConfig == "Open") {
                linkConfig = "Crossed";
            } else {
                linkConfig = "Open";
            }
        }
    }
    
    return linkConfig;
}

function getTracerLimits(node, config) {
    let traceStart = 0;
    let traceEnd = 360;
    const inputLims = getInputLimits();
    const inputMax = inputLims[1];
    const inputClass = inputLims[2];
    const outputLims = getOutputLimits();
    const outputMin = outputLims[0];
    const outputMax = outputLims[1];
    const outputClass = outputLims[2];

    const outFromIn = (angle, config) => {
        return radToDeg(calcOutputAngle(degToRad(angle), config));
    }

    if (node === "A1") {
        [traceStart, traceEnd] = inputLims
    } else if (node === "B1") {
        if (crossoverActive || outputClass === "Rocker") {
            [traceStart, traceEnd] = outputLims;
        }
        else {
            const inLims = inputLims;
            inLims[0] = inLims[0] + simAngleTol;
            inLims[1] = inLims[1] - simAngleTol;
            const outAtIn = [outFromIn(inLims[0], config), outFromIn(inLims[1], config)];
            if (config === "Open") {
                if (outputClass === "0-Rocker") {
                    traceStart = outAtIn[0];
                    if (traceStart > 180) {
                        traceStart = traceStart - 360;
                    }
                    traceEnd = outputMax;
                } else if (outputClass === "π-Rocker") {
                    traceStart = outputMin;
                    traceEnd = outAtIn[0];
                } else if (outputClass === "Crank") {
                    traceStart = outAtIn[0];
                    if (traceStart > 180) {
                        traceStart = traceStart - 360;
                    }
                    traceEnd = outAtIn[1];
                } else {

                }
            } else {
                if (outputClass === "0-Rocker") {
                    traceStart = outputMin;
                    traceEnd = outAtIn[1];
                    if (traceEnd > 180) {
                        traceEnd = traceEnd - 360;
                    }
                } else if (outputClass === "π-Rocker") {
                    traceStart = outAtIn[1];
                    traceEnd = outputMax;
                } else if (outputClass === "Crank") {
                    traceStart = outAtIn[0];
                    traceEnd = outAtIn[1];
                }
            }
        }
    } else if (node === "Cp") {
        [traceStart, traceEnd] = inputLims;
        traceStart = traceStart+simAngleTol;
        traceEnd = traceEnd-simAngleTol;
    }
    return [traceStart, traceEnd];
}

function getLinkageProperties() {

    const [A_min, A_max ,inputClass] = getInputLimits();
    const [B_min, B_max ,outputClass] = getOutputLimits();

    const inputAngle = getInputAngle();
    // const outputAngle = getOutputAngle();
    const outputAngle = radToDeg(calcOutputAngle(degToRad(inputAngle),linkageConfig));
    const openCrossed = getOpenCrossed();

    return `<b>Config:</b> ${openCrossed}<br>
    <b>Transmission Angle (μ):</b> ${getTransmissionAngle().toFixed(1)}°<br>`;

    // `<b>Input Link:</b> ${inputClass}<br>
    // <b>Range of Motion:</b> (${A_min.toFixed(1)}°, ${A_max.toFixed(1)}°)<br>
    // <b>Current Angle:</b> ${inputAngle.toFixed(1)}°<br>
    // <br>
    // <b>Output Link:</b> ${outputClass} - ${openCrossed}<br>
    // <b>Range of Motion:</b> (${B_min.toFixed(1)}°, ${B_max.toFixed(1)}°)<br>
    // <b>Current Angle:</b> ${outputAngle.toFixed(1)}° <br>
    // <br>`
}