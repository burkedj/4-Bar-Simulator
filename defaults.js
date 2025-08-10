let lengthsVisible = false;
let coordsVisible = false;
let groundVisible = true;
let couplerVisible = true;
let tracersVisible = false;
// let editMode = true

const offsetX = 220;
const offsetY = 220;

const linkScale = 10;

const defaultJoints = [
    { id: "A0", color: "black", x: offsetX, y: offsetY , fixed: true , ground : true, type: "ground"},
    { id: "A1", color: "darkred", x: offsetX, y: offsetY-50, fixed: false , ground : false, type: "joint"},
    { id: "B1", color: "darkblue", x: offsetX+117, y: offsetY-78, fixed: false , ground : false, type: "joint"},
    { id: "B0", color: "black", x: offsetX+100, y: offsetY, fixed: false , ground : true, type: "ground"},

    {id: "Cp", color: "darkgreen", x: (offsetX+117+offsetX)/2, y: offsetY-78, fixed: false, ground: false, type: "node", color: "darkgreen"}
];

// const traceSteps = 5;

const defaultX = -200;
const defaultY = -125;
const defaultScale = 1.8;
const defaultRotation = 0;

const linkOpactity = 0.5;

const labelOffsetX = 5;
const labelOffsetY = -3;

const simAngleTol = 0.001;

let lockedConfig = null;
let linkageConfig = "Open"

let couplerSetLength = 0;
let couplerSetAngle = 0;

let currentRotation = 0;
// let currentPanX = d3.zoomTransform(zoom).x;
// let currentPanY = d3.zoomTransform(zoom).y;
// let currentZoom = d3.zoomTransform(zoom).k;
let currentZoomTransform = d3.zoomIdentity;

// let groundAngle = 0;

