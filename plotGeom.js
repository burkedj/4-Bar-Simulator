
const xAxisMargin = 37.5;
const yAxisMargin = 22.5;
const TickLength = 10;
const TickOffset = 10;

const axesOrigin = [xAxisMargin, plotHeight-yAxisMargin];

const xMinTick = axesOrigin[0]+TickOffset;
const xMaxTick = plotWidth-xAxisMargin+TickOffset
const xTickTop = axesOrigin[1]-TickLength/2;
const xTickBottom = axesOrigin[1]+TickLength/2;

const yMinTick = axesOrigin[1]-TickOffset;
const yMaxTick = yAxisMargin+TickOffset;
const yTickLeft = xAxisMargin-TickLength/2;
const yTickRight = xAxisMargin+TickLength/2;

const plotAxes = [
    {id: "xLine", x1: axesOrigin[0], x2: xMaxTick+TickOffset, y1: axesOrigin[1], y2: axesOrigin[1]},
    {id: "yLine", x1: axesOrigin[0], x2: axesOrigin[0], y1: axesOrigin[1], y2: yAxisMargin},
    {id: "xMinTick", x1: xMinTick, x2: xMinTick, y1: xTickTop, y2: xTickBottom},
    {id: "xMaxTick", x1: xMaxTick, x2: xMaxTick, y1: xTickTop, y2: xTickBottom},
    {id: "yMinTick", x1: yTickLeft, x2: yTickRight, y1: yMinTick, y2: yMinTick},
    {id: "yMaxTick", x1: yTickLeft, x2: yTickRight, y1: yMaxTick, y2: yMaxTick},
    {id: "xValTick", x1: (xMaxTick+xMinTick)/2, x2: (xMaxTick+xMinTick)/2, y1: xTickTop, y2: xTickBottom},
    {id: "yValTick", x1: yTickLeft, x2: yTickRight, y1: (yMaxTick+yMinTick)/2, y2: (yMaxTick+yMinTick)/2},
]

const plotLabels = [
    {id: "plotTitle", x: plotWidth/2, y: 15, text: "Output Anglez vs Input Angle", textSize: "13px", anchor: "middle", baseline: "middle", color: "black", weight: "bold", opacity: 1},
    {id: "xAxisTitle", x: plotWidth/2, y: plotHeight-10, text: "", textSize: "12px", anchor: "middle", baseline: "middle", color: inputColor, weight: "medium", opacity: 1},
    {id: "yAxisTitle", x: 15, y: plotHeight/2, text: "Output Angle (°)", textSize: "12px", anchor: "middle", baseline: "middle", color: "black", weight: "medium", opacity: 1},
    {id: "xMinLab", x: xMinTick, y: xTickBottom+2.5, text: "0", textSize: "12px", anchor: "middle", baseline: "hanging", color: inputColor, weight: "medium", opacity: 1},
    {id: "xMaxLab", x: xMaxTick, y: xTickBottom+2.5, text: "360", textSize: "12px", anchor: "middle", baseline: "hanging", color: inputColor, weight: "medium", opacity: 1},
    {id: "yMinLab", x: yTickLeft-1, y: yMinTick, text: "38", textSize: "12px", anchor: "end", baseline: "middle", color: "black", weight: "medium", opacity: 1},
    {id: "yMaxLab", x: yTickLeft-1, y: yMaxTick, text: "136", textSize: "12px", anchor: "end", baseline: "middle", color: "black", weight: "medium", opacity: 1},
    {id: "xValLab", x: (xMaxTick+xMinTick)/2, y: xTickBottom+2.5, text: "90", textSize: "12px", anchor: "middle", baseline: "hanging", color: inputColor, weight: "bold", opacity: 1},
    {id: "yValLab", x: yTickLeft-1, y: (yMaxTick+yMinTick)/2, text: "90", textSize: "12px", anchor: "end", baseline: "middle", color: "black", weight: "bold", opacity: 1},
    {id: "openKey", x: 550, y: 12, text: "Open", textSize: "12px", anchor: "start", baseline: "central", color: "black", weight: "medium", opacity: 1},
    {id: "crossedKey", x: 550, y: 26, text: "Crossed", textSize: "12px", anchor: "start", baseline: "central", color: "black", weight: "medium", opacity: 1},
]
// alphabetic
const plotPoints = [
    {id: "mainPoint", x: 0, y: 0, r: 4, opacity: 1, fill: "black", stroke: "black", strokeWidth: 1.9},
    // {id: "minXO", x: "", y: "", r: 4, opacity: 0.25, fill: "black", stroke: "black", strokeWidth: 1.75},
    // {id: "maxXO", x: "", y: "", r: 4, opacity: 0.25, fill: "black", stroke: "black", strokeWidth: 1.75},
    {id: "openKey", x: 542, y: 12, r: 4, opacity: 1, fill: "white", stroke: "black", strokeWidth: 1.9},
    {id: "crossedKey", x: 542, y: 26, r: 4, opacity: 0.25, fill: "black", stroke: "black", strokeWidth: 1.9},
]
const plotLines = [
    {id: "mainLine", points: [], opacity: 1},
    {id: "fullLine", points: [], opacity: 0.15},
]
