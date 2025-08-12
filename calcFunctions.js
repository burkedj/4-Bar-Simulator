//Function to calc the coupler node position from a given input angle
//1. calc A1 position from input angle
//2. calc output link angle from input angle (have this function)
//3. calc B1 position from output angle and B0 position
//4. calc c link angle from A1 * B1
//5. calc A1Cp angle from c angle and couplerSetAngle
//6. calc Cp positon from A1Cp angle and length

function calcLinkAngle(startJoint, endJoint) {
    const endJ = joints.find(d => d.id === endJoint);
    const startJ = joints.find(d => d.id === startJoint);

    let theta = -radToDeg(Math.atan((endJ.y-startJ.y)/(endJ.x-startJ.x)));
    if (endJ.x < startJ.x) {
        theta = 180 + theta;
    } else if (endJ.y > startJ.y) {
        theta = 360 + theta;
    }
    if (theta < 0 )  theta = 360 + theta;

    return [theta]
}

function calcCouplerPosition(inAngle) {
    setCouplerGeom();
    const A0 = joints[0];
    const B0 = joints[3];

    const a = 5 * linkScale;
    const b = 8 * linkScale;
    // const c = lengths["c"] * linkScale;

    //calc A1 position
    const A1x = A0.x + (a * Math.cos(degToRad(inAngle)));
    const A1y = A0.y - (a * Math.sin(degToRad(inAngle)));

    //calc output link angle
    const th_b = radToDeg(calcOutputAngle(inAngle));

    //calc B1 position
    const B1x = B0.x + (b * Math.cos(degToRad(th_b)));
    const B1y = B0.y - (b * Math.sin(degToRad(th_b)));

    //calc c angle
    let th_c = -radToDeg(Math.atan((B1y-A1y)/(B1x-A1x)));
    if (B1x < A1x) {
        th_c = 180 + th_c;
    } else if (B1y > A1y) {
        th_c = 360 + th_c;
    }
    if (th_c < 0 )  th_c = 360 + th_c;

    const th_A1Cp_rad = degToRad(couplerSetAngle - th_c);

    const Cp_x = A1x + couplerSetLength * Math.cos(th_A1Cp_rad);
    const Cp_y = A1y + couplerSetLength * Math.sin(th_A1Cp_rad);

    return [Cp_x, Cp_y];
    // return [A1x, A1y];
    // return [B1x, B1y]

}

function calcOutputAngle(angle, config) {

    const a = aLength; // input
    const b = bLength; // output
    const c = cLength; // coupler
    const d = dLength; // ground

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
        lngth = aLength*linkScale;
        nx = origin.x + lngth * Math.cos(degToRad(angle));
        ny = origin.y - lngth * Math.sin(degToRad(angle));
    } else if (node === "B1") {
        origin = joints.find(j => j.id === "B0");
        lngth = bLength*linkScale;
        nx = origin.x + lngth * Math.cos(degToRad(angle));
        ny = origin.y - lngth * Math.sin(degToRad(angle));
    } else if (node === "Cp") {
        // origin = joints.find(j => j.id === "A0");
        nx = calcCouplerPosition(angle)[0];
        ny = calcCouplerPosition(angle)[1]
    }

    return [nx, ny]
    // return [300,200];
}

function calcNodePath(node, steps, config){
    const traceNode = tracers.findIndex(d => d.id === node); //get the index for the desired node within tracers array
    tracers[traceNode].points.length = 0; //clear the existing points for this node tracer
    let traceStart = 0;
    let traceEnd = 0;
    if (node === "A1") {
        [traceStart, traceEnd] = getInputLimits()
    } else if (node === "B1") {
        [traceStart, traceEnd] = getOutputLimits()
    } else if (node === "Cp") {
        [traceStart, traceEnd] = getInputLimits()
    }
    for (let i = 0; i < steps; i++) {
        traceAngle = traceStart + (i/steps) * (traceEnd-traceStart);
        if (node === "Cp") {
            tPoint = calcJointPosition(node, traceAngle, config);
        } else {
            tPoint = calcNodePosition(node, traceAngle);
        }
        tracers[traceNode].points.push(tPoint);
    }
    if (node === "Cp") {
        tracers[traceNode].points.push(calcJointPosition(node, traceEnd, config))
    } else {
        tracers[traceNode].points.push(calcNodePosition(node, traceEnd))
    }

    if (node === "Cp" & getInputLimits()[2] !== "Crank") {
        let opConfig = "";
        if (config === "Open") {
            opConfig = "Crossed";
        } else {
            opConfig = "Open";
        }
        for (let i = 0; i < steps; i++) {
            traceAngle = traceEnd - (i/steps) * (traceEnd-traceStart);
            tPoint = calcJointPosition(node, traceAngle, opConfig);
            tracers[traceNode].points.push(tPoint);
        }
        tracers[traceNode].points.push(calcJointPosition(node, traceStart, opConfig))
    }
}

function calcJointPosition(node, angleDeg, config) {

    const a = aLength; // input
    const b = bLength; // output
    const c = cLength; // coupler
    const d = dLength; // ground

    const inLength = a * linkScale;
    const outLength = b * linkScale;
    
    const angleAdj = angleDeg;

    const angleIn = degToRad(angleAdj);
    const angleOut = calcOutputAngle(angleIn, config);

    const A1x = joints[0].x + inLength * Math.cos(angleIn);
    const A1y = joints[0].y - inLength * Math.sin(angleIn);

    const B1x = joints[3].x + outLength * Math.cos(angleOut);
    const B1y = joints[3].y - outLength * Math.sin(angleOut);

    let th_c = -radToDeg(Math.atan((B1y-A1y)/(B1x-A1x)));
    if (B1x < A1x) {
        th_c = 180 + th_c;
    } else if (B1y > A1y) {
        th_c = 360 + th_c;
    }
    if (th_c < 0 )  th_c = 360 + th_c;

    const th_A1Cp_rad = -degToRad(couplerSetAngle - th_c);

    const Cpx = A1x + couplerSetLength * Math.cos(th_A1Cp_rad);
    const Cpy = A1y - couplerSetLength * Math.sin(th_A1Cp_rad);

    if (node === "Cp") {
        return [Cpx, Cpy]
    } else if (node === "A1") {
        return [A1x, A1y]
    } else if (node === "B1") {
        return [B1x, B1y]
    }

    // return [A1x, A1y, B1x, B1y, Cpx, Cpy];
}