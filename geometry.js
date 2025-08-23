const joints = defaultJoints.map(j => ({ ...j }));

const originalJoints = joints.map(j => ({ ...j })); // Store original positions

const links = [
    {id: "d", nodes: [joints[3], joints[0]], color: groundColor, type: "ground"},
    {id: "a", nodes: [joints[0], joints[1]], color: inputColor, type: "input"},
    {id: "c", nodes: [joints[1], joints[2], joints[4]], color: couplerColor, type: "coupler" },
    {id: "b", nodes: [joints[2], joints[3]], color: outputColor, type: "output"},
]

const tracers = [
    {id: "A1", color: inputColor, points: []},
    {id: "B1", color: outputColor, points: []},
    {id: "Cp", color: couplerColor, points: []}
];

const fullTracers = [
    {id: "A1", color: inputColor, points: []},
    {id: "B1", color: outputColor, points: []},
    {id: "Cp", color: couplerColor, points: []}
];

const traceLimits = [
    {id: "A1", min: [0,0], max: [0,0], color: inputColor},
    {id: "B1", min: [0,0], max: [0,0], color: outputColor},
    {id: "Cp", min: [0,0], max: [0,0], color: couplerColor}
]