function calcLinkAngle(startJoint, endJoint) {
    let theta = -radToDeg(Math.atan((endJoint[1]-startJoint[1])/(endJoint[0]-startJoint[0])));
    if (endJoint[0] < startJoint[0]) {
        theta = 180 + theta;
    } else if (endJoint[1] > startJoint[1]) {
        theta = 360 + theta;
    }
    if (theta < 0 )  theta = 360 + theta;

    return [theta]
}

function getLinkAngle(startJoint, endJoint) {
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
}

function calcNodePath(node, steps, config){
    const traceNode = tracers.findIndex(d => d.id === node); //get the index for the desired node within tracers array
    tracers[traceNode].points.length = 0; //clear the existing points for this node tracer
    let traceAngle = 0;
    let traceStart = 0;
    let traceEnd = 0;
    let tPoint = 0;

    [traceStart, traceEnd] = getTracerLimits(node, config);

    for (let i = 0; i < steps; i++) {
        traceAngle = traceStart + (i/steps) * (traceEnd-traceStart);

        if (node === "Cp") {
            tPoint = calcJointPosition(node, traceAngle, config);
        } else if (node === "B1" & getOutputLimits()[2] == "Crank" & getInputLimits()[2] === "Rocker" & joints[1].y > joints[0].y){
            let opConfig = "";
            if (config === "Open") {
                opConfig = "Crossed"
            } else {
                opConfig = "Open"
            }
            [traceStart, traceEnd] = getTracerLimits(node, opConfig);
            tPoint = calcNodePosition(node, traceAngle);
        } else {
            tPoint = calcNodePosition(node, traceAngle);
        }
        tracers[traceNode].points.push(tPoint);

        viewMinX = Math.min(tPoint[0], viewMinX, joints[0].x, joints[3].x);
        viewMaxX = Math.max(tPoint[0], viewMaxX, joints[0].x, joints[3].x);
        viewMinY = Math.min(tPoint[1], viewMinY, joints[0].y, joints[3].y);
        viewMaxY = Math.max(tPoint[1], viewMaxY, joints[0].y, joints[3].y);
    }
    let fPoint = [0,0]
    if (node === "Cp") {
        fPoint = calcJointPosition(node, traceEnd, config)
    } else {
        fPoint = calcNodePosition(node, traceEnd)
    }
        // const plotCoords = [
        //     radToDeg(traceEnd)*getPlotScale()[0]+xMinTick,
        //     yMinTick-((getOutputLimits()[0]-radToDeg(calcOutputAngle(traceEnd,config)))*getPlotScale()[1])
        // ]
        // plotLines[pLine].points.push(plotCoords);
    tracers[traceNode].points.push(fPoint)

    if ((node === "Cp" & getInputLimits()[2] !== "Crank" & crossoverActive)) {
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

            viewMinX = Math.min(tPoint[0], viewMinX, joints[0].x, joints[3].x);
            viewMaxX = Math.max(tPoint[0], viewMaxX, joints[0].x, joints[3].x);
            viewMinY = Math.min(tPoint[1], viewMinY, joints[0].y, joints[3].y);
            viewMaxY = Math.max(tPoint[1], viewMaxY, joints[0].y, joints[3].y);
        }
        const sPoint = calcJointPosition(node, traceStart, opConfig)
        tracers[traceNode].points.push(sPoint)
    } 
    // else if (node === "B1"){//} & getOutputLimits()[2] == "Crank" & getInputLimits()[2] === "Rocker" & joints[1].y > joints[0].y) {
    //     tPoint = calcNodePosition(node, traceAngle);
    //     // return
    // }
}

function calcFullPath(node, steps, config){
    const traceNode = fullTracers.findIndex(d => d.id === node); //get the index for the desired node within tracers array
    fullTracers[traceNode].points.length = 0; //clear the existing points for this node tracer
    let traceStart = 0;
    let traceEnd = 0;
    let tPoint = 0;

    [traceStart, traceEnd] = getFullTracerLimits(node);
    
    for (let i = 0; i < steps; i++) {
        traceAngle = traceStart + (i/steps) * (traceEnd-traceStart);

        if (node === "Cp") {
            tPoint = calcJointPosition(node, traceAngle, config);
        } else {
            tPoint = calcNodePosition(node, traceAngle);
        }
        fullTracers[traceNode].points.push(tPoint);
    }
    let fPoint = [0,0]
    if (node === "Cp") {
        fPoint = calcJointPosition(node, traceEnd, config)
    } else {
        fPoint = calcNodePosition(node, traceEnd)
    }
    fullTracers[traceNode].points.push(fPoint)

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

            fullTracers[traceNode].points.push(tPoint);
        }
        const sPoint = calcJointPosition(node, traceStart, opConfig)
        fullTracers[traceNode].points.push(sPoint)
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
    
    let CpAngle = couplerSetAngle;
    if (couplerSnap) CpAngle = 0;

    const th_A1Cp_rad = -degToRad(CpAngle - th_c);

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

function calcCouplerLinkAngle(inAngle) {
    const joint1 = calcJointPosition("A1",inAngle);
    const joint2 = calcJointPosition("B1",inAngle);
    const c_th = calcLinkAngle(joint1, joint2)

    return c_th
}
function calcTransmissionAngle(inAngle) {
    const c_th = calcCouplerLinkAngle(inAngle)
    const b_th = radToDeg(calcOutputAngle(degToRad(inAngle)))

    let th_trans = Math.abs(b_th - c_th);

    if (th_trans > 180) th_trans = 360 - th_trans

    // if (linkageConfig === "Crossed") th_trans = -th_trans;

    return th_trans;
}

function calcPlotPath(config) {
    // if (plotVariable === "Transmission Angle")
    const steps = 10000;
    let traceStart = 0;
    let traceEnd = 0;
    // let tPoint = 0;

    // [traceStart, traceEnd] = getFullTracerLimits(node, config);

    traceStart = getTracerLimits("Cp", config)[0];
    traceEnd = getTracerLimits("Cp", config)[1];

    let xOff = 0;
    let yOff = 0;

    if (getInputLimits()[2] !== "Crank") {
        xOff = -getInputLimits()[0]*getPlotScale()[0];
    } 
    // if (getOutputLimits()[2] === "0-Rocker" & config === "Crossed") {
    //     yOff = getInputLimits()[0]*getPlotScale()[0]
    // }

    // if (getOutputLimits()[2] === "0-Rocker") {
    //     yOff = getOutputLimits()[0]*getPlotScale()[1]
    // }


    const pLine = plotLines.find(d => d.id === "mainLine");
    pLine.points.length = 0;

    const fLine = plotLines.find(d => d.id === "fullLine");
    fLine.points.length = 0;

    for (let i = 0; i < steps; i++) {
        traceAngle = traceStart + (i/steps) * (traceEnd-traceStart);

        if (plotVariable === "Output Angle") {
            let outAngle = radToDeg(calcOutputAngle(degToRad(traceAngle),config))
            if (outAngle > getOutputLimits()[1]) {
                outAngle = outAngle-360
            }

            const plotCoords = [
                traceAngle*getPlotScale()[0]+xMinTick+xOff,
                yMinTick-((getOutputLimits()[0]-outAngle)*getPlotScale()[1]) + yOff
            ]
            pLine.points.push(plotCoords);
            fLine.points.push(plotCoords);
        }
        
    }

    [traceStart, traceEnd] = getFullTracerLimits("Cp")

    if (getInputLimits()[2] !== "Crank") {
        let opConfig = "Open";
        if (config === "Open") opConfig = "Crossed";

        for (let i = 0; i < steps; i++) {
            traceAngle = traceEnd - (i/steps) * (traceEnd-traceStart);
            
            if (plotVariable === "Output Angle") {
                let outAngle = radToDeg(calcOutputAngle(degToRad(traceAngle),opConfig))
                if (outAngle > getOutputLimits()[1]) {
                    outAngle = outAngle-360
                }

                const plotCoords = [
                    traceAngle*getPlotScale()[0]+xMinTick+xOff,
                    yMinTick-((getOutputLimits()[0]-outAngle)*getPlotScale()[1])
                ]
                fLine.points.push(plotCoords);
                if (crossoverActive) {
                    pLine.points.push(plotCoords);
                }
            } 
            else if (plotVariable === "Transmission Angle") {
                const plotCoords = [
                    traceAngle*getPlotScale()[0]+xMinTick+xOff,
                    yMinTick-((getPlotLimits()[2]-calcTransmissionAngle(traceAngle))*getPlotScale()[1])
                ]
                fLine.points.push(plotCoords);
                pLine.points.push(plotCoords);
            }
        }
    }

}