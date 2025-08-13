const joints = defaultJoints.map(j => ({ ...j }));

const originalJoints = joints.map(j => ({ ...j })); // Store original positions

const links = [
    {id: "d", nodes: [joints[3], joints[0]], color: "purple", type: "ground"},
    {id: "a", nodes: [joints[0], joints[1]], color: "darkred", type: "input"},
    {id: "c", nodes: [joints[1], joints[2], joints[4]], color: "darkgreen", type: "coupler" },
    {id: "b", nodes: [joints[2], joints[3]], color: "darkblue", type: "output"},
]

const tracers = [
    {id: "A1", color: "darkred", points: []},
    {id: "B1", color: "darkblue", points: []},
    {id: "Cp", color: "darkgreen", points: []}
];

const traceLimits = [
    {id: "A1", min: null, max: null},
    {id: "B1", min: null, max: null},
    {id: "Cp", min: null, max: null}
]

function setTraceLimits(node, angle)
{
    const limit = traceLimits.find(l => l.id === node);
    if (limit) {
        limit.min = min;
        limit.max = max;
    }
}