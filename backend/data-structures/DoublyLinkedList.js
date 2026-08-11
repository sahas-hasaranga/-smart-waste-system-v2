class Node {
    constructor(data) {
        this.data = data;
        this.prev = null;
        this.next = null;
    }
}

class DoublyLinkedList {
    constructor(maxSize = 5) {
        this.head = null;
        this.tail = null;
        this.size = 0;
        this.maxSize = maxSize;
    }

    // Add a new pickup to the front (Most recent) - O(1)
    addFirst(data) {
        const newNode = new Node(data);
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            newNode.next = this.head;
            this.head.prev = newNode;
            this.head = newNode;
        }
        this.size++;

        // LRU Eviction: Remove from tail if exceeds maxSize - O(1)
        if (this.size > this.maxSize) {
            this.removeLast();
        }
    }

    // Remove the oldest pickup from the end - O(1)
    removeLast() {
        if (!this.tail) return;
        
        if (this.head === this.tail) {
            this.head = null;
            this.tail = null;
        } else {
            this.tail = this.tail.prev;
            this.tail.next = null;
        }
        this.size--;
    }

    // Get array representation for API response - O(n)
    toArray() {
        const result = [];
        let current = this.head;
        while (current) {
            result.push(current.data);
            current = current.next;
        }
        return result;
    }
}

module.exports = DoublyLinkedList;
