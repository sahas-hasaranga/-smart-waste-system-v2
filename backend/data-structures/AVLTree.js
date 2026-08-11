class HouseholdNode {
    constructor(houseId, ownerName, zone) {
        this.houseId = houseId; // This is the key for the BST
        this.ownerName = ownerName;
        this.zone = zone || 'Zone A';
        this.rewardPoints = 0; // Starts at 0
        this.left = null;
        this.right = null;
        this.height = 1; // Added for AVL Tree
    }
}

class SmartBinAVLTree {
    constructor() {
        this.root = null;
    }

    // Helper methods for AVL Tree
    getHeight(node) {
        if (node === null) return 0;
        return node.height;
    }

    getBalanceFactor(node) {
        if (node === null) return 0;
        return this.getHeight(node.left) - this.getHeight(node.right);
    }

    rightRotate(y) {
        let x = y.left;
        let T2 = x.right;

        // Perform rotation
        x.right = y;
        y.left = T2;

        // Update heights
        y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;
        x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;

        // Return new root
        return x;
    }

    leftRotate(x) {
        let y = x.right;
        let T2 = y.left;

        // Perform rotation
        y.left = x;
        x.right = T2;

        // Update heights
        x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;
        y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;

        // Return new root
        return y;
    }

    // Insert a new household into the system (AVL Insertion)
    insert(houseId, ownerName, zone) {
        this.root = this._insertNode(this.root, houseId, ownerName, zone);
        return this;
    }

    _insertNode(node, houseId, ownerName, zone) {
        // 1. Perform the normal BST insertion
        if (node === null) {
            return new HouseholdNode(houseId, ownerName, zone);
        }

        if (houseId < node.houseId) {
            node.left = this._insertNode(node.left, houseId, ownerName, zone);
        } else if (houseId > node.houseId) {
            node.right = this._insertNode(node.right, houseId, ownerName, zone);
        } else {
            // Duplicate keys not allowed
            return node;
        }

        // 2. Update height of this ancestor node
        node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));

        // 3. Get the balance factor
        let balance = this.getBalanceFactor(node);

        // If unbalanced, perform rotations

        // Left Left Case
        if (balance > 1 && houseId < node.left.houseId) {
            return this.rightRotate(node);
        }

        // Right Right Case
        if (balance < -1 && houseId > node.right.houseId) {
            return this.leftRotate(node);
        }

        // Left Right Case
        if (balance > 1 && houseId > node.left.houseId) {
            node.left = this.leftRotate(node.left);
            return this.rightRotate(node);
        }

        // Right Left Case
        if (balance < -1 && houseId < node.right.houseId) {
            node.right = this.rightRotate(node.right);
            return this.leftRotate(node);
        }

        // Return the (unchanged) node pointer
        return node;
    }

    // Search for a household and add points
    addRewardPoints(houseId, points) {
        let current = this.root;
        while (current) {
            if (houseId === current.houseId) {
                current.rewardPoints += points;
                return { success: true, message: `Added ${points} points. Total: ${current.rewardPoints}`, user: current };
            }
            if (houseId < current.houseId) {
                current = current.left;
            } else {
                current = current.right;
            }
        }
        return { success: false, message: "Household not found." };
    }

    // Get a specific user's details
    search(houseId) {
        let current = this.root;
        while (current) {
            if (houseId === current.houseId) return current;
            if (houseId < current.houseId) {
                current = current.left;
            } else {
                current = current.right;
            }
        }
        return null;
    }

    // In-Order Traversal to get all registered users (Sorted by House ID)
    getAllUsers() {
        const users = [];
        this._inOrderTraversal(this.root, users);
        return users;
    }

    _inOrderTraversal(node, list) {
        if (node !== null) {
            this._inOrderTraversal(node.left, list);
            list.push({
                houseId: node.houseId,
                ownerName: node.ownerName,
                zone: node.zone,
                rewardPoints: node.rewardPoints
            });
            this._inOrderTraversal(node.right, list);
        }
    }
}

module.exports = SmartBinAVLTree;
