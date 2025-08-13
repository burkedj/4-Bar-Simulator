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

function calcOutputAngle(angle, config) {

    const a = aLength; // input
    const b = bLength; // output
    const c = cLength; // coupler
    const d = dLength; // ground

    const U = a*a + (b*b) - c*c + d*d - 2*a*d*Math.cos(angle);
    const V = 2*a*b*Math.sin(angle);
    const W = 2*b*(d-a*Math.cos(angle));

    let tanw = 0;

    if (config === "Crossed") {
        tanw = (-V-Math.sqrt(V*V - U*U + W*W))/(W - U);
    } else {
        tanw = (-V+Math.sqrt(V*V - U*U + W*W))/(W - U);
    }

    let angleOut = radToDeg(Math.atan(tanw)*2);

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
    } 
    // else if (node === "Cp") {
    //     // origin = joints.find(j => j.id === "A0");
    //     nx = calcCouplerPosition(angle)[0];
    //     ny = calcCouplerPosition(angle)[1]
    // }

    return [nx, ny]
    // return [300,200];
}

//for output link: When "Open"... 
//  if 0-Rocker, then min occurs at input min & max = output max
//  if pi-Rocker, then min = output min & max occurs at input min
// when "Crossed"...
//  if 0-Rocker then min = output min & max occurs at input max
//  if pi-Rocker then min occurs at input max & max = output max
function calcNodePath(node, steps, config){
    const traceNode = tracers.findIndex(d => d.id === node); //get the index for the desired node within tracers array
    tracers[traceNode].points.length = 0; //clear the existing points for this node tracer
    let traceStart = 0;
    let traceEnd = 0;
    let tPoint = 0;
    if (node === "A1") {
        [traceStart, traceEnd] = getInputLimits()
    } else if (node === "B1") {
        if (crossoverActive || getOutputLimits()[2] === "Rocker") {
            [traceStart, traceEnd] = getOutputLimits()
        }
        else {
            const inLims = getInputLimits();
            inLims[0] = inLims[0] + simAngleTol;
            inLims[1] = inLims[1] - simAngleTol;
            const outAtIn = [radToDeg(calcOutputAngle(degToRad(inLims[0])), config), radToDeg(calcOutputAngle(degToRad(inLims[1])), config)];
            outAtIn[0] = outAtIn[0] + 10;
            outAtIn[1] = outAtIn[1] - 10;
            if (config === "Open") {
                if (getOutputLimits()[2] === "0-Rocker") {
                    traceStart = outAtIn[0];
                    if (traceStart > 180) {
                        traceStart = traceStart - 360;
                    }
                    traceEnd = getOutputLimits()[1];
                } else if (getOutputLimits()[2] === "π-Rocker") {
                    traceStart = getOutputLimits()[0];
                    traceEnd = outAtIn[0];
                } else if (getOutputLimits()[2] === "Crank") {
                    traceStart = outAtIn[0];
                    if (traceStart > 180) {
                        traceStart = traceStart - 360;
                    }
                    traceEnd = outAtIn[1];
                } else {

                }
            } else {
                if (getOutputLimits()[2] === "0-Rocker") {
                    traceStart = getOutputLimits()[0];
                    traceEnd = outAtIn[1];
                    if (traceEnd > 180) {
                        traceEnd = traceEnd - 360;
                    }
                } else if (getOutputLimits()[2] === "π-Rocker") {
                    traceStart = outAtIn[1];
                    traceEnd = getOutputLimits()[1];
                } else if (getOutputLimits()[2] === "Crank") {
                    traceStart = outAtIn[0];
                    traceEnd = outAtIn[1];
                }
            }
        }
        traceStart = traceStart + simAngleTol;
        traceEnd = traceEnd - simAngleTol;
    } else if (node === "Cp") {
        [traceStart, traceEnd] = getInputLimits()
        traceStart = traceStart+simAngleTol;
        traceEnd = traceEnd-simAngleTol;
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
    let fPoint = [0,0]
    if (node === "Cp") {
        fPoint = calcJointPosition(node, traceEnd, config)
    } else {
        fPoint = calcNodePosition(node, traceEnd)
    }
    tracers[traceNode].points.push(fPoint)

    if (node === "Cp" & getInputLimits()[2] !== "Crank" & crossoverActive) {
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
        const sPoint = calcJointPosition(node, traceStart, opConfig)
        tracers[traceNode].points.push(sPoint)
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
}