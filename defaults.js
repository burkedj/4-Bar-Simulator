let lengthsVisible = false;
let coordsVisible = false;
let groundVisible = true;
let couplerVisible = true;
// let tracersVisible = false;

let animationActive = false;
let animationTimer = null;
let animationDir = 1;
let animationSpeed = 10; //rpm
const animationFrameRate = 60; // fps
const simAngleTol = 0.001;
let crossoverActive = true;
let animationReverse = false;

let aTracersVis = false;
let bTracersVis = false;
let cTracersVis = true;

const windowWidth = 600;
const windowHeight = 400;
// const offsetX = 230;
const offsetX = -56.25;
// const offsetY = 230+25;
const offsetY = 15;

const plotWidth = windowWidth;
const plotHeight = 150;

const linkScale = 10;

const inputColor = "darkred";
const outputColor = "darkblue";
const couplerColor = "darkgreen";
const groundColor = "black";

const defaultJoints = [
    { id: "A0", color: groundColor, x: offsetX, y: offsetY , fixed: true , ground : true, type: "ground"},
    { id: "A1", color: inputColor, x: offsetX, y: offsetY-50, fixed: false , ground : false, type: "joint"},
    { id: "B1", color: outputColor, x: offsetX+117, y: offsetY-78, fixed: false , ground : false, type: "joint"},
    { id: "B0", color: groundColor, x: offsetX+100, y: offsetY, fixed: false , ground : true, type: "ground"},

    {id: "Cp", color: couplerColor, x: (offsetX+117+offsetX)/2, y: offsetY-78, fixed: false, ground: false, type: "node"}
];

// const traceSteps = 5;

const defaultX = windowWidth/2;
const defaultY = windowHeight/2+25;
const defaultScale = 1.98;
const defaultRotation = 0;

const linkOpactity = 0.55;

const labelOffsetX = 5;
const labelOffsetY = -3;

// let lockedConfig = null;
let linkageConfig = "Open";
let configToggled = false;

let couplerSetLength = 0;
let couplerSetAngle = 0;
let couplerSnap = false;

let aLength = 5;
let bLength = 8;
let cLength = 12;
let dLength = 10;

let currentRotation = 0;
let currentZoomTransform = d3.zoomIdentity;

let lastTapTime = 0;

const labCoords = [
    {id: "rotation", x: windowWidth-5, y: 15, anchor: "end", weight: "", text: "", visible: false, color: "black"},
    {id: "inputAngle", x: 10, y: windowHeight-25, anchor: "start", weight: "bold", text: "", visible: true, color: inputColor},
    {id: "inputClass", x: 10, y: windowHeight-7, anchor: "start", weight: "", text: "", visible: true, color: inputColor},
    {id: "outputAngle", x: windowWidth-5, y: windowHeight-25, anchor: "end", weight: "bold", text: "", visible: true, color: outputColor},
    {id: "outputClass", x: windowWidth-5, y: windowHeight-7, anchor: "end", weight: "", text: "", visible: true, color: outputColor},
    {id: "generalStats", x: windowWidth/2, y: windowHeight-25}
]

let viewMinX = -50;
let viewMaxX = 162.5;
let viewMinY = -80;
let viewMaxY = 50;

let plotVariable = "Output Angle";
const transMin = 0;
const transMax = 180;

let enableManualLimits = false;