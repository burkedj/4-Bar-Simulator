let lengthsVisible = false;
let coordsVisible = false;
let groundVisible = true;
let couplerVisible = true;
// let tracersVisible = false;

let animationActive = false;
let animationTimer = null;
let animationInterval = null;
let animationDelay = 100;
let animationDir = 1;

let aTracersVis = false;
let bTracersVis = false;
let cTracersVis = false;

const offsetX = 230;
const offsetY = 230+25;

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
const defaultScale = 1.75;
const defaultRotation = 0;

const linkOpactity = 0.5;

const labelOffsetX = 5;
const labelOffsetY = -3;

const simAngleTol = 0.001;

let lockedConfig = null;
let linkageConfig = "Open"

let couplerSetLength = 0;
let couplerSetAngle = 0;

let aLength = 0;
let bLength = 0;
let cLength = 0;
let dLength = 0;

let currentRotation = 0;
let currentZoomTransform = d3.zoomIdentity;
