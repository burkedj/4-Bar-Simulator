let lengthsVisible = false;
let coordsVisible = false;
let groundVisible = true;
let couplerVisible = true;
// let editMode = true

const offsetX = 220;
const offsetY = 220;

const linkScale = 10;

const defaultJoints = [
    { id: "A0", x: offsetX, y: offsetY , fixed: true , ground : true, type: "ground"},
    { id: "A1", x: offsetX, y: offsetY-50, fixed: false , ground : false, type: "joint"},
    { id: "B1", x: offsetX+117, y: offsetY-78, fixed: false , ground : false, type: "joint"},
    { id: "B0", x: offsetX+100, y: offsetY, fixed: false , ground : true, type: "ground"},

    {id: "Cp", x: (offsetX+117+offsetX)/2, y: offsetY-78, fixed: false, ground: false, type: "node", color: "darkgreen"}
];

const defaultX = -200;
const defaultY = -125;
const defaultScale = 1.8;

const linkOpactity = 0.5;

const labelOffsetX = 5;
const labelOffsetY = -3;

const simAngleTol = 0.001;

let lockedConfig = null;
let linkageConfig = "Open"

let couplerSetLength = 0;
let couplerSetAngle = 0;

let groundAngle = 0;

