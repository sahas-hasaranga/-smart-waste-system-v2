const express = require('express');
const cors = require('cors');

// Import the Custom Data Structures
const MaxHeap = require('./data-structures/MaxHeap');
const CityGraph = require('./data-structures/Graph');
const SmartBinAVLTree = require('./data-structures/AVLTree');
const DoublyLinkedList = require('./data-structures/DoublyLinkedList');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize the Data Structures
const wasteQueue = new MaxHeap();
const cityMap = new CityGraph();
const binDatabase = new SmartBinAVLTree();
const recentPickupsLog = new DoublyLinkedList(5); // Keep last 5 pickups

// --- PRE-POPULATE DATA FOR DEMO PURPOSES ---

// 1. Setup the City Map (Graph)
const locations = ["Entrance", "Zone A", "Zone B", "Zone C", "Zone D", "Hospital", "Dump Yard"];
locations.forEach(loc => cityMap.addLocation(loc));

// Add roads (Edges) with distances (Weights)
cityMap.addRoad("Entrance", "Zone A", 5);
cityMap.addRoad("Entrance", "Zone B", 6);
cityMap.addRoad("Zone A", "Hospital", 2);
cityMap.addRoad("Zone B", "Zone C", 4);
cityMap.addRoad("Zone B", "Hospital", 8);
cityMap.addRoad("Zone C", "Hospital", 3);

// 2. Register Some Houses in AVL Tree
binDatabase.insert(101, "Kamal Perera", "Zone A");
binDatabase.insert(105, "Nimal Silva", "Zone B");
binDatabase.insert(202, "Sunil Fernando", "Zone C");
binDatabase.insert(999, "City Hospital", "Hospital"); // Hospital Bin

console.log("✅ Data Structures Initialized Successfully!");

// Global Stats for Dashboard
let totalPickups = 0;
let totalRewards = 0;

// --- API ROUTES ---

// 0. Get Dashboard Stats
app.get('/api/stats', (req, res) => {
    res.json({
        totalPickups,
        activeAlerts: wasteQueue.heap.length,
        totalRewards
    });
});

// 0.5. Register a New House (AVL Tree Insert)
app.post('/api/house', (req, res) => {
    const { houseId, ownerName, zone } = req.body;
    if(binDatabase.search(parseInt(houseId))) {
        return res.status(400).json({ error: "House ID already exists!" });
    }
    binDatabase.insert(parseInt(houseId), ownerName, zone);
    res.json({ success: true, message: `House ${houseId} registered successfully in AVL Tree!` });
});

// 0.75 Get all registered users (In-Order Traversal of AVL Tree)
app.get('/api/users', (req, res) => {
    const users = binDatabase.getAllUsers();
    res.json({ users });
});

// 1. Add a new Waste Collection Request (Goes into MAX-HEAP)
app.post('/api/request', (req, res) => {
    const { houseId, wasteType, priority } = req.body;
    
    // Check if house exists in BST first! (Integration of BST and Heap)
    const house = binDatabase.search(houseId);
    if (!house) {
        return res.status(404).json({ error: "House ID not found in database!" });
    }

    // Check if the house is already in the priority queue
    const alreadyInQueue = wasteQueue.heap.some(job => job.houseId === houseId);
    if (alreadyInQueue) {
        return res.status(400).json({ error: "This house is already in the pending queue!" });
    }

    wasteQueue.insert(houseId, wasteType, priority);
    res.json({ message: "Collection request added to priority queue!", queueSize: wasteQueue.heap.length });
});

// 2. Get the NEXT highest priority pickup (Extract from MAX-HEAP)
app.get('/api/next-pickup', (req, res) => {
    if (wasteQueue.isEmpty()) {
        return res.json({ message: "Queue is empty. No pickups required." });
    }
    const nextJob = wasteQueue.extractMax();
    // Look up the zone dynamically from the AVL Tree!
    const houseInfo = binDatabase.search(nextJob.houseId);
    nextJob.zone = houseInfo ? houseInfo.zone : "Zone A";
    
    totalPickups++; // Increment global stats
    
    // Add to Recent Pickups Log (Doubly Linked List)
    recentPickupsLog.addFirst({ ...nextJob, completedAt: new Date().toLocaleTimeString() });
    
    res.json({ nextJob });
});

// 2.5. Get the current Priority Queue (Heap)
app.get('/api/queue', (req, res) => {
    res.json({ queue: wasteQueue.getQueue() });
});

// 2.6 Get Recent Pickups (Doubly Linked List Traversal)
app.get('/api/recent-pickups', (req, res) => {
    res.json({ recentPickups: recentPickupsLog.toArray() });
});

// 2.75. Predict the route for the TOP item in the Heap (Without removing it)
app.get('/api/predict-next', (req, res) => {
    const startNode = req.query.start || "Entrance";
    if (wasteQueue.isEmpty()) {
        return res.json({ message: "Queue is empty." });
    }
    const nextJob = wasteQueue.peek();
    const houseInfo = binDatabase.search(nextJob.houseId);
    const destZone = houseInfo ? houseInfo.zone : "Zone A";
    
    const result = cityMap.dijkstra(startNode, destZone);
    
    res.json({
        nextJob: { ...nextJob, zone: destZone },
        route: result.path,
        distance: result.distance
    });
});

// 3. Get Shortest Route for Truck (Dijkstra on GRAPH)
app.get('/api/route', (req, res) => {
    const { start, destination } = req.query;
    if (!start || !destination) {
        return res.status(400).json({ error: "Please provide start and destination query params." });
    }
    const result = cityMap.dijkstra(start, destination);
    res.json({ shortestPath: result.path, distance: result.distance });
});

// New endpoint to get the map graph for UI
app.get('/api/map', (req, res) => {
    res.json({ edges: cityMap.getEdges() });
});



// 5. Reward Points after collection (Search and Update on AVL Tree)
app.post('/api/reward', (req, res) => {
    const { houseId, points } = req.body;
    const result = binDatabase.addRewardPoints(houseId, points);
    
    if (result.success) {
        totalPickups += 1;
        totalRewards += points;
        res.json(result);
    } else {
        res.status(404).json({ error: result.message });
    }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Smart Waste Backend running on http://localhost:${PORT}`);
});
