
const xAxisMargin = 37.5;
const yAxisMargin = 20;
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
    {id: "xLine", x1: axesOrigin[0], x2: plotWidth-xAxisMargin+TickOffset*2, y1: axesOrigin[1], y2: axesOrigin[1]},
    {id: "yLine", x1: axesOrigin[0], x2: axesOrigin[0], y1: axesOrigin[1], y2: yAxisMargin},
    {id: "xMinTick", x1: xMinTick, x2: xMinTick, y1: xTickTop, y2: xTickBottom},
    {id: "xMaxTick", x1: xMaxTick, x2: xMaxTick, y1: xTickTop, y2: xTickBottom},
    {id: "yMinTick", x1: yTickLeft, x2: yTickRight, y1: yMinTick, y2: yMinTick},
    {id: "yMaxTick", x1: yTickLeft, x2: yTickRight, y1: yMaxTick, y2: yMaxTick}
]

const plotLabels = [
    {id: "plotTitle", x: plotWidth/2, y: 15, text: "Output Angle", textSize: "13px", anchor: "middle", baseline: "middle", color: "black"},
    {id: "xAxisTitle", x: plotWidth/2, y: plotHeight-10, text: "Input Angle", textSize: "12px", anchor: "middle", baseline: "middle", color: inputColor},
    {id: "yAxisTitle", x: 15, y: plotHeight/2, text: "Output Angle (°)", textSize: "12px", anchor: "middle", baseline: "middle", color: outputColor},
    {id: "xMinLab", x: xMinTick, y: xTickBottom+2.5, text: "0", textSize: "12px", anchor: "middle", baseline: "hanging", color: inputColor},
    {id: "xMaxLab", x: xMaxTick, y: xTickBottom+2.5, text: "360", textSize: "12px", anchor: "middle", baseline: "hanging", color: inputColor},
    {id: "yMinLab", x: yTickLeft-1, y: yMinTick, text: "38", textSize: "12px", anchor: "end", baseline: "middle", color: outputColor},
    {id: "yMaxLab", x: yTickLeft-1, y: yMaxTick, text: "136", textSize: "12px", anchor: "end", baseline: "middle", color: outputColor},
]

const plotPoints = [
    {id: "mainPoint", x: "", y: ""}
]
const plotLines = [
    {id: "mainLine", points: [], opacity: 1},
    {id: "fullLine", points: [], opacity: 0.25},
]
