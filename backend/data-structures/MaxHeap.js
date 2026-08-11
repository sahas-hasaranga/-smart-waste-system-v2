class RequestNode {
    constructor(houseId, wasteType, priority) {
        this.houseId = houseId;
        this.wasteType = wasteType;
        this.priority = priority; // Higher number = higher priority
        this.timestamp = Date.now();
    }
}

class MaxHeap {
    constructor() {
        this.heap = [];
    }

    insert(houseId, wasteType, priority) {
        const newNode = new RequestNode(houseId, wasteType, priority);
        this.heap.push(newNode);
        this.bubbleUp(this.heap.length - 1);
    }

    bubbleUp(index) {
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);
            // If parent priority is strictly greater, stop
            if (this.heap[parentIndex].priority > this.heap[index].priority) break;
            // If priorities are equal, the one with the earlier timestamp (smaller value) should be closer to the root
            if (this.heap[parentIndex].priority === this.heap[index].priority) {
                if (this.heap[parentIndex].timestamp <= this.heap[index].timestamp) break;
            }
            
            // Otherwise, swap
            [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
            index = parentIndex;
        }
    }

    extractMax() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const max = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.sinkDown(0);
        return max;
    }

    peek() {
        if (this.heap.length === 0) return null;
        return this.heap[0];
    }

    sinkDown(index) {
        let length = this.heap.length;
        let element = this.heap[index];

        while (true) {
            let leftChildIdx = 2 * index + 1;
            let rightChildIdx = 2 * index + 2;
            let leftChild, rightChild;
            let swap = null;

            if (leftChildIdx < length) {
                leftChild = this.heap[leftChildIdx];
                if (leftChild.priority > element.priority || 
                    (leftChild.priority === element.priority && leftChild.timestamp < element.timestamp)) {
                    swap = leftChildIdx;
                }
            }

            if (rightChildIdx < length) {
                rightChild = this.heap[rightChildIdx];
                if (
                    (swap === null && (rightChild.priority > element.priority || (rightChild.priority === element.priority && rightChild.timestamp < element.timestamp))) ||
                    (swap !== null && (rightChild.priority > leftChild.priority || (rightChild.priority === leftChild.priority && rightChild.timestamp < leftChild.timestamp)))
                ) {
                    swap = rightChildIdx;
                }
            }

            if (swap === null) break;
            this.heap[index] = this.heap[swap];
            this.heap[swap] = element;
            index = swap;
        }
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    getQueue() {
        return this.heap;
    }
}

module.exports = MaxHeap;
