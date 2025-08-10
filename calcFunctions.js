function calcCouplerPosition() {
    const th_A1Cp_rad = degToRad(couplerSetAngle - getLinkAngles()[2]);

    const Cp_x = joints[1].x + couplerSetLength * Math.cos(th_A1Cp_rad);
    const Cp_y = joints[1].y + couplerSetLength * Math.sin(th_A1Cp_rad);

    return [Cp_x, Cp_y];
}

function calcOutputAngle(angle, config) {
    const lengths = getLinkLengths();

    const a = lengths["a"]; // input
    const b = lengths["b"]; // output
    const c = lengths["c"]; // coupler
    const d = lengths["d"]; // ground

    const U = a*a + b*b - c*c + d*d - 2*a*d*Math.cos(angle);
    const V = 2*a*b*Math.sin(angle);
    const W = 2*b*(d-a*Math.cos(angle));

    let tanw = 0;

    if (config === "Crossed") {
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