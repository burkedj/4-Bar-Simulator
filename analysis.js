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
    th_a = th_a;
    if (th_a < 0 )  th_a = 360 + th_a;

    let th_b = radToDeg(Math.atan(-(B1.y-B0.y)/(B1.x-B0.x)));
    if (B1.x < B0.x) {
        th_b = 180 + th_b;
    } else if (B1.y > B0.y) {
        th_b = 360 + th_b;
    }
    th_b = th_b;
    if (th_b < 0 )  th_b = 360 + th_b;

    let th_c = -radToDeg(Math.atan((B1.y-A1.y)/(B1.x-A1.x)));
    if (B1.x < A1.x) {
        th_c = 180 + th_c;
    } else if (B1.y > A1.y) {
        th_c = 360 + th_c;
    }
    th_c = th_c;
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
    th_A1Cp = th_A1Cp;
    if (th_A1Cp < 0 )  th_A1Cp = 360 + th_A1Cp;

    let th_B0A1 = -radToDeg(Math.atan((A1.y-B0.y)/(A1.x-B0.x)));
    if (A1.x < B0.x) {
        th_B0A1 = 180 + th_B0A1;
    } else if (A1.y > B0.y) {
        th_B0A1 = 360 + th_B0A1;
    }
    th_B0A1 = th_B0A1;
    if (th_B0A1 < 0 )  th_B0A1 = 360 + th_B0A1;
    

    return [th_a, th_b, th_c, th_d, th_A1Cp, th_B0A1];
}

function getInputLimits() {
    const lengths = getLinkLengths();

    const a = lengths["a"]; // input
    const b = lengths["b"]; // output
    const c = lengths["c"]; // coupler
    const d = lengths["d"]; // ground

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

    return [A_min, A_max ,inputClass];
}

function getOutputLimits() {
    const lengths = getLinkLengths();

    const a = lengths["a"]; // input
    const b = lengths["b"]; // output
    const c = lengths["c"]; // coupler
    const d = lengths["d"]; // ground

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
        outputClass = "0-Rocker"
    } else if (Number.isNaN(B_max_rad)) {
        B_min = radToDeg(B_min_rad);
        B_max = -B_min;
        outputClass = "π-Rocker"
    } else {
        B_min = radToDeg(B_min_rad);
        B_max = radToDeg(B_max_rad);
        outputClass = "Rocker"
    }

    return [B_min, B_max ,outputClass];

}

function getInputAngle() {

    let inputAngle = getLinkAngles()[0]

    return inputAngle;
}

function getOutputAngle() {

    let outputAngle = 180-getLinkAngles()[1];
    if (joints[2].y > joints[3].y) {
        outputAngle = 360 + outputAngle;
    }
    return outputAngle;
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

function calcCouplerPosition() {
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

    const B0 = joints[2];
    const B1 = joints[3];

    let linkConfig = "Open"
    if (th_a > 180) {
        linkConfig = "Crossed";
    }
    if (th_a <= 180 & th_b < th_c & th_b > th_B0A1) {
        linkConfig = "Crossed";
    } else if (th_a > 180 & -th_b < -th_c & -th_b > -th_B0A1) {
        linkConfig = "Open";
    }

    linkageConfig = linkConfig;
    return linkConfig;
}

function calcOutputAngle(angle) {
    const lengths = getLinkLengths();

    const a = lengths["a"]; // input
    const b = lengths["b"]; // output
    const c = lengths["c"]; // coupler
    const d = lengths["d"]; // ground

    const U = a*a + b*b - c*c + d*d - 2*a*d*Math.cos(angle);
    const V = 2*a*b*Math.sin(angle);
    const W = 2*b*(d-a*Math.cos(angle));

    let tanw = 0;

    if (linkageConfig === "Crossed") {
        tanw = (-V-Math.sqrt(V*V - U*U + W*W))/(W - U);
    } else {
        tanw = (-V+Math.sqrt(V*V - U*U + W*W))/(W - U);
    }

    let angleOut = radToDeg(Math.atan(tanw)*2);

    angleOut = angleOut;
    if (angleOut < 0 )  angleOut = 360 + angleOut;

    angleOut = degToRad(angleOut);

    return angleOut;
};

function calcNodePosition(node, angle){
    let origin = [0,0]
    let lngth = 0
    if (node === "A1") {
        origin = joints.find(j => j.id === "A0");
        lngth = getLinkLengths()["a"]*linkScale;
        nx = origin.x + lngth * Math.cos(degToRad(angle));
        ny = origin.y - lngth * Math.sin(degToRad(angle));
    } else if (node === "B1") {
        origin = joints.find(j => j.id === "B0");
        lngth = getLinkLengths()["b"]*linkScale;
        // const bAngle = radToDeg(calcOutputAngle(angle));
        nx = origin.x + lngth * Math.cos(degToRad(angle));
        ny = origin.y - lngth * Math.sin(degToRad(angle));
    } else if (node === "Cp") {
        calcCouplerPosition()
    }

    return [nx, ny]
    // return [300,200];
}

function calcNodePath(node, steps){
    const traceNode = tracers.findIndex(d => d.id === node); //get the index for the desired node within tracers array
    tracers[traceNode].points.length = 0; //clear the existing points for this node tracer
    let traceStart = 0;
    let traceEnd = 0;
    if (node === "A1") {
        [traceStart, traceEnd] = getInputLimits()
    } else if (node === "B1") {
        [traceStart, traceEnd] = getOutputLimits()
    }
    for (let i = 0; i < steps; i++) {
        traceAngle = traceStart + (i/steps) * (traceEnd-traceStart);
        const tPoint = calcNodePosition(node, traceAngle);
        tracers[traceNode].points.push(tPoint);
    }
    tracers[traceNode].points.push(calcNodePosition(node, traceEnd))
}


function getLinkageProperties() {

    const [A_min, A_max ,inputClass] = getInputLimits();
    const [B_min, B_max ,outputClass] = getOutputLimits();

    const inputAngle = getInputAngle();
    const outputAngle = getOutputAngle();
    const openCrossed = getOpenCrossed();

    const th_a = getLinkAngles()[0];
    const th_b = getLinkAngles()[1];
    const th_c = getLinkAngles()[2];
    const th_B0A1 = getLinkAngles()[5];
    
    return `<b>Input Link:</b> ${inputClass}<br>
    <b>Range of Motion:</b> (${A_min.toFixed(1)}°, ${A_max.toFixed(1)}°)<br>
    <b>Current Angle:</b> ${inputAngle.toFixed(1)}°<br>
    ${getLinkAngles()[3].toFixed(1)}<br>
    <b>Output Link:</b> ${outputClass} - ${openCrossed}<br>
    <b>Range of Motion:</b> (${B_min.toFixed(1)}°, ${B_max.toFixed(1)}°)<br>
    <b>Current Angle:</b> ${outputAngle.toFixed(1)}° <br>
    <br>`;
}
