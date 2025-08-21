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

const offsetX = 230;
const offsetY = 230+25;

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

const defaultX = -200;
const defaultY = -125;
const defaultScale = 1.75;
const defaultRotation = 0;

const linkOpactity = 0.55;

const labelOffsetX = 5;
const labelOffsetY = -3;

// let lockedConfig = null;
let linkageConfig = "Open"

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
    {id: "rotation", x: 595, y: 15, anchor: "end", weight: "", text: "", visible: false, color: "black"},
    {id: "inputAngle", x: 10, y: 475, anchor: "start", weight: "bold", text: "", visible: true, color: inputColor},
    {id: "inputClass", x: 10, y: 493, anchor: "start", weight: "", text: "", visible: true, color: inputColor},
    {id: "outputAngle", x: 595, y: 475, anchor: "end", weight: "bold", text: "", visible: true, color: outputColor},
    {id: "outputClass", x: 595, y: 493, anchor: "end", weight: "", text: "", visible: true, color: outputColor},
    {id: "generalStats", x: 300, y: 475}
]

let rotLabVisible = false;
let inputLabVisible = true;
let outputLabVisible = true;
let transLabVisible = true;