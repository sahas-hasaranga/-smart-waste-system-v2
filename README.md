# ♻️ Eco Smart v2.0 - Urban Waste Management System

![Eco Smart Dashboard Preview](https://img.shields.io/badge/Status-Online%20%26%20Optimized-success?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Tech_Stack-React_|_Node.js_|_Express-blue?style=for-the-badge)
![Data Structures](https://img.shields.io/badge/Algorithms-Heap_|_AVL_|_Graph_|_DLL-purple?style=for-the-badge)

An enterprise-grade, data-driven software solution designed to revolutionize municipal solid waste management. Built as an academic project to demonstrate the practical application of advanced data structures and algorithms in solving real-world logistical challenges.

## 🚀 Key Features & Data Structures Used

This application avoids sluggish database queries by relying entirely on highly optimized, in-memory data structures:

1. **Priority Queueing (`Max-Heap`)**
   - Automatically prioritizes critical hazardous/medical waste to guarantee immediate dispatch in $O(\log n)$ time.
   - Includes a custom timestamp tie-breaker for fairness.
   
2. **Dynamic Live Routing (`Graph` & `Dijkstra's Algorithm`)**
   - City zones are modeled as an undirected graph. 
   - Dijkstra's algorithm mathematically calculates the absolute shortest path for garbage trucks, minimizing fuel consumption and carbon footprint.
   - Implements a Hazardous Material Safety Protocol (forces return to Dump Yard after medical waste collection).

3. **Household Directory (`Self-Balancing AVL Tree`)**
   - Manages user profiles and recycling loyalty points.
   - Ensures $O(\log n)$ search and insertion times for lightning-fast profile retrieval as the city scales.

4. **Activity Cache (`Doubly Linked List - LRU`)**
   - Maintains a high-speed, memory-efficient real-time log of the most recent truck dispatches with $O(1)$ head insertions and tail evictions.

## 🛠️ Technologies
* **Frontend:** React.js, Vite, Custom CSS (Glassmorphism, SVG Dynamic Animations), Lucide-React Icons
* **Backend:** Node.js, Express.js (REST API Architecture)
* **Algorithms:** Pure JavaScript (Implemented completely from scratch)

## 📦 How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YourUsername/smart-waste-system-v2.git
   cd smart-waste-system-v2
   ```

2. **Start the Backend Server (Port 5000):**
   ```bash
   cd backend
   npm install
   node index.js
   ```

3. **Start the Frontend Application (Port 5173):**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## 🔒 Access Credentials
* **Admin ID:** `admin`
* **Password:** `admin123`

---
*Developed as part of the Design and Implement Data Structures and Algorithms Module.*
