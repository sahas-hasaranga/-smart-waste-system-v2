class PriorityQueue {
    constructor() {
        this.values = [];//data save krgnna l hduva
    }
    enqueue(val, priority) {
        //aluth data ekk dura priority ek  array ekt gtta(zone,priority)

        this.values.push({ val, priority });
        this.sort();//
    }
    //array eke mulinma inna kena ain karanava value aduma kena
    dequeue() {
        return this.values.shift();
    }
    //value adu eke idan wadi ekata sort karanava
    sort() {
        this.values.sort((a, b) => a.priority - b.priority);
    }
    //array hisnam true return karanava
    isEmpty() {
        return this.values.length === 0;
    }
}

class CityGraph {
    constructor() {
        //graph eke tyana data(parawal,zones) tayagannava
        this.adjacencyList = {};
    }

    // Add a new location (junction or house area)
    addLocation(location) {//klin ek add krl nttn save krnva
        if (!this.adjacencyList[location]) {
            this.adjacencyList[location] = [];
        }
    }

    // Add a road between two locations with a distance
    //ngara 2m tynvnn
    addRoad(location1, location2, distance) {
        if (this.adjacencyList[location1] && this.adjacencyList[location2]) {
            this.adjacencyList[location1].push({ node: location2, weight: distance });
            this.adjacencyList[location2].push({ node: location1, weight: distance }); // Undirected graph
        }
    }

    // Block a road (Novel Feature: dynamic routing)
    blockRoad(location1, location2) {
        if (this.adjacencyList[location1]) {
            this.adjacencyList[location1] = this.adjacencyList[location1].filter(edge => edge.node !== location2);
        }
        if (this.adjacencyList[location2]) {
            this.adjacencyList[location2] = this.adjacencyList[location2].filter(edge => edge.node !== location1);
        }
    }

    // Dijkstra's Algorithm for Shortest Path
    dijkstra(start, finish) {
        const nodes = new PriorityQueue();//lgama tyn ngrayaa allagnna
        const distances = {};
        const previous = {};
        let path = []; // to return at end
        let smallest;

        // Build initial state
        for (let vertex in this.adjacencyList) {
            if (vertex === start) {
                distances[vertex] = 0;
                nodes.enqueue(vertex, 0);
            } else {
                distances[vertex] = Infinity;
                nodes.enqueue(vertex, Infinity);
            }
            previous[vertex] = null;
        }

        while (!nodes.isEmpty()) {
            smallest = nodes.dequeue().val;

            if (smallest === finish) {
                // We are done, build path to return
                while (previous[smallest]) {
                    path.push(smallest);
                    smallest = previous[smallest];
                }
                break;
            }

            if (smallest || distances[smallest] !== Infinity) {
                for (let neighbor in this.adjacencyList[smallest]) {
                    // Find neighboring node
                    let nextNode = this.adjacencyList[smallest][neighbor];
                    // Calculate new distance to neighboring node
                    let candidate = distances[smallest] + nextNode.weight;
                    let nextNeighbor = nextNode.node;

                    if (candidate < distances[nextNeighbor]) {
                        // Updating new smallest distance to neighbor
                        distances[nextNeighbor] = candidate;
                        // Updating previous - How we got to neighbor
                        previous[nextNeighbor] = smallest;
                        // Enqueue in priority queue with new priority
                        nodes.enqueue(nextNeighbor, candidate);
                    }
                }
            }
        }
        return {
            path: path.concat(start).reverse(),
            distance: distances[finish]
        };
    }

    // Get all edges for UI visualization
    getEdges() {
        const edges = [];
        const seen = new Set();
        for (let node in this.adjacencyList) {
            this.adjacencyList[node].forEach(neighbor => {
                const edgeKey = [node, neighbor.node].sort().join('-');
                if (!seen.has(edgeKey)) {
                    seen.add(edgeKey);
                    edges.push({ source: node, target: neighbor.node, weight: neighbor.weight });
                }
            });
        }
        return edges;
    }
}

module.exports = CityGraph;
