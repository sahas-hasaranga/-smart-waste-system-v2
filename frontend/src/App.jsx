import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Trash2, 
  Map, 
  Gift, 
  Bell, 
  AlertTriangle,
  CheckCircle2,
  Truck,
  ArrowRight,
  LogOut,
  Lock,
  Leaf,
  Layers,
  Activity,
  Award,
  Users,
  Info,
  Clock,
  RefreshCw
} from 'lucide-react';

// Added safety check for activeRoute
const CityMapGraphic = ({ activeRoute = [], allEdges = [] }) => {
  // Ensure activeRoute is always an array
  const safeRoute = Array.isArray(activeRoute) ? activeRoute : (typeof activeRoute === 'string' ? activeRoute.split(',') : []);

  const nodes = {
    'Entrance': { x: 50, y: 150 },
    'Zone A': { x: 250, y: 50 },
    'Zone B': { x: 250, y: 250 },
    'Zone C': { x: 450, y: 250 },
    'Hospital': { x: 450, y: 50 }
  };

  const isEdgeActive = (n1, n2) => {
    if (!safeRoute || safeRoute.length === 0) return false;
    for (let i = 0; i < safeRoute.length - 1; i++) {
      if ((safeRoute[i] === n1 && safeRoute[i+1] === n2) || 
          (safeRoute[i] === n2 && safeRoute[i+1] === n1)) {
        return true;
      }
    }
    return false;
  };

  return (
    <svg viewBox="0 0 500 300" style={{width: '100%', height: 'auto', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', marginTop: '1rem'}}>
      <defs>
        <filter id="glow" filterUnits="userSpaceOnUse" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Draw Edges */}
      {allEdges.map((e, i) => {
        const p1 = nodes[e.source];
        const p2 = nodes[e.target];
        if(!p1 || !p2) return null;
        const active = isEdgeActive(e.source, e.target);
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        return (
          <g key={i}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={active ? '#10b981' : 'rgba(255,255,255,0.1)'} strokeWidth={active ? 5 : 2} filter={active ? 'url(#glow)' : ''}>
              {active && <animate attributeName="stroke-opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />}
            </line>
            <rect x={midX - 15} y={midY - 10} width="30" height="20" fill="var(--bg-dark)" rx="4" />
            <text x={midX} y={midY + 4} fill={active ? '#10b981' : 'var(--text-muted)'} fontSize="12" textAnchor="middle" fontWeight="bold">{e.weight} km</text>
          </g>
        )
      })}

      {/* Draw Directional Arrows for Active Route */}
      {safeRoute.length > 1 && safeRoute.map((node, i) => {
        if (i === safeRoute.length - 1) return null;
        const p1 = nodes[node];
        const p2 = nodes[safeRoute[i+1]];
        if (!p1 || !p2) return null;
        
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
        
        // Offset the arrow slightly along the line so it doesn't overlap the distance text
        const offset = 35; 
        const arrowX = midX + Math.cos(angle * Math.PI / 180) * offset;
        const arrowY = midY + Math.sin(angle * Math.PI / 180) * offset;

        return (
          <g key={`arrow-${i}`} transform={`translate(${arrowX}, ${arrowY}) rotate(${angle})`}>
            <polygon points="-8,-8 10,0 -8,8 -3,0" fill="#fff" filter="url(#glow)">
              <animateTransform attributeName="transform" type="translate" values="-6 0; 6 0; -6 0" dur="1.2s" repeatCount="indefinite" />
            </polygon>
          </g>
        );
      })}

      {/* Draw Nodes */}
      {Object.entries(nodes).map(([name, pos]) => {
        const isActive = safeRoute && safeRoute.includes(name);
        const isTarget = safeRoute && safeRoute.length > 0 && safeRoute[safeRoute.length - 1] === name;
        return (
          <g key={name}>
            <circle cx={pos.x} cy={pos.y} r={isTarget ? "22" : (isActive ? "20" : "18")} fill={isActive ? '#ef4444' : '#1e293b'} stroke={isActive ? '#fff' : 'var(--border-color)'} strokeWidth={isActive ? (isTarget ? "4" : "3") : "2"} filter={isActive ? 'url(#glow)' : ''}>
              {isTarget && <animate attributeName="r" values="22;26;22" dur="1.2s" repeatCount="indefinite" />}
              {isActive && !isTarget && <animate attributeName="stroke-opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />}
            </circle>
            <text x={pos.x} y={pos.y + 35} fill={isActive ? '#fff' : 'var(--text-muted)'} fontSize="13" textAnchor="middle" fontWeight="600">{name}</text>
          </g>
        )
      })}
    </svg>
  );
};

function App() {
  // Navigation State: 'home' | 'login' | 'dashboard'
  const [screen, setScreen] = useState('home');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeView, setActiveView] = useState('dashboard');
  
  // Data States
  const [houseId, setHouseId] = useState('101');
  const [wasteType, setWasteType] = useState('Organic');
  const [priority, setPriority] = useState('1');
  
  const [nextPickup, setNextPickup] = useState(null);
  const [route, setRoute] = useState(null);
  const [routeDistance, setRouteDistance] = useState(null);
  const [graphEdges, setGraphEdges] = useState([]);
  const [systemStats, setSystemStats] = useState({ totalPickups: 0, activeAlerts: 0, totalRewards: 0 });
  const [queue, setQueue] = useState([]);
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [predictedRoute, setPredictedRoute] = useState(null);
  const [truckLocation, setTruckLocation] = useState('Entrance');
  const [recentPickups, setRecentPickups] = useState([]);
  
  // Registration States
  const generateId = () => Math.floor(Math.random() * 9000) + 1000;
  const [newHouseId, setNewHouseId] = useState(generateId());
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newZone, setNewZone] = useState('Zone A');
  
  // Dynamic Dropdown Options for Houses
  const [availableHouses, setAvailableHouses] = useState([
    { id: '101', name: 'House 101 (Kamal - Zone A)' },
    { id: '105', name: 'House 105 (Nimal - Zone B)' },
    { id: '202', name: 'House 202 (Sunil - Zone C)' },
    { id: '999', name: 'City Hospital (999 - Critical)' }
  ]);
  
  const [alert, setAlert] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  // --- LOGIN LOGIC ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      setScreen('dashboard');
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Hint: admin / admin123');
    }
  };

  const handleLogout = () => {
    setScreen('home');
    setUsername('');
    setPassword('');
  }

  // --- BACKEND API LOGIC ---
  const submitRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ houseId: parseInt(houseId), wasteType, priority: parseInt(priority) })
      });
      const data = await res.json();
      if(res.ok) {
        showAlert('success', data.message);
        fetchQueue();
      } else {
        showAlert('error', data.error);
      }
    } catch (err) {
      showAlert('error', 'Server connection failed.');
    }
  };

  const dispatchTruck = async () => {
    try {
      const pickupRes = await fetch(`${API_URL}/next-pickup`);
      const pickupData = await pickupRes.json();
      
      if (pickupData.nextJob) {
        setNextPickup(pickupData.nextJob);
        
        let destZone = pickupData.nextJob.zone || 'Zone A';

        const routeRes = await fetch(`${API_URL}/route?start=${truckLocation}&destination=${destZone}`);
        const routeData = await routeRes.json();
        setRoute(routeData.shortestPath);
        setRouteDistance(routeData.distance);
        showAlert('success', `Found shortest route from ${truckLocation} to ${destZone}`);
        
        // Dynamic location update + Edge case for Medical Waste
        if (pickupData.nextJob.priority == 3) {
            setTruckLocation('Entrance');
            setTimeout(() => showAlert('info', 'Level 3 Waste collected. Truck returning to Dump Yard (Entrance) for disposal.'), 2000);
        } else {
            setTruckLocation(destZone);
        }
      } else {
        setNextPickup(null);
        setRoute(null);
        setRouteDistance(null);
        showAlert('error', pickupData.message);
      }
      fetchQueue();
      fetchStats();
      fetchRecentPickups();
    } catch (err) {
      showAlert('error', 'Failed to calculate route.');
    }
  };



  const addReward = async () => {
    if(!nextPickup) return;
    try {
      const res = await fetch(`${API_URL}/reward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ houseId: nextPickup.houseId, points: 20 })
      });
      const data = await res.json();
      if(data.success) {
        showAlert('success', data.message);
        setNextPickup(null); 
        setRoute(null);
        setRouteDistance(null);
      } else {
        showAlert('error', data.error || data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const registerHouse = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/house`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ houseId: newHouseId, ownerName: newOwnerName, zone: newZone })
      });
      const data = await res.json();
      if(data.success) {
        showAlert('success', data.message);
        // Dynamically add the new house to the dropdown options
        setAvailableHouses([...availableHouses, { 
          id: newHouseId.toString(), 
          name: `House ${newHouseId} (${newOwnerName} - ${newZone})` 
        }]);
        setNewHouseId(generateId()); 
        setNewOwnerName('');
      } else {
        showAlert('error', data.error);
      }
    } catch (err) {
      showAlert('error', 'Registration failed.');
    }
  };

  const fetchGraphMap = async () => {
    try {
      const res = await fetch(`${API_URL}/map`);
      const data = await res.json();
      setGraphEdges(data.edges || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/stats`);
      const data = await res.json();
      setSystemStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQueue = async () => {
    try {
      const res = await fetch(`${API_URL}/queue`);
      const data = await res.json();
      setQueue(data.queue || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecentPickups = async () => {
    try {
      const res = await fetch(`${API_URL}/recent-pickups`);
      const data = await res.json();
      setRecentPickups(data.recentPickups || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDirectoryUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      setDirectoryUsers(data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPrediction = async () => {
    try {
      const res = await fetch(`${API_URL}/predict-next?start=${truckLocation}`);
      const data = await res.json();
      if (data.route) {
        setPredictedRoute(data);
      } else {
        setPredictedRoute(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch stats periodically or when view changes
  useEffect(() => {
    if (screen === 'dashboard') {
      fetchGraphMap();
      fetchStats();
      fetchQueue();
      fetchPrediction();
      fetchRecentPickups();
      fetchDirectoryUsers();
      if(activeView === 'directory') fetchDirectoryUsers();
    }
  }, [screen, activeView, nextPickup, route, truckLocation]);


  if (screen === 'home') {
    return (
      <div className="landing-page">
        {/* Navigation */}
        <nav className="landing-nav">
          <div className="landing-brand">
            <Leaf size={24} color="var(--accent-primary)"/> Eco<span>Smart</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
            <div className="landing-links">
              <a href="#architecture">Architecture</a>
            </div>
            <button onClick={() => setScreen('login')} className="btn btn-outline" style={{padding: '0.5rem 1.25rem'}}>
              Admin Portal
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title">Next-Gen City Waste <br/><span>Management System</span></h1>
          <p className="hero-subtitle">
            Leveraging advanced algorithmic Data Structures (Heap, Graph, BST) to bring 
            intelligent, data-driven optimization to urban waste collection and recycling routing.
          </p>
          
          <div className="hero-actions">
            <button onClick={() => setScreen('login')} className="btn btn-primary" style={{padding: '0.75rem 2rem'}}>
              Access Control Panel <ArrowRight size={18} />
            </button>
          </div>
        </section>

        {/* About & Features Section */}
        <section id="architecture" className="about-section">
          <div className="section-header">
            <h2>System Architecture</h2>
            <p>Our SaaS platform is powered by highly optimized data structures to ensure efficiency at every layer of the operational pipeline.</p>
          </div>

          <div className="features-grid">
            {/* Feature 1: Heap */}
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444'}}>
                <Layers size={28} />
              </div>
              <h3>Priority Queueing (Max-Heap)</h3>
              <p>Standard queues fail during emergencies. Our system utilizes a <strong>Max-Heap</strong> to ensure critical waste (e.g., Medical/Hazardous from Hospitals) bubbles up to the root in $O(\log n)$ time, ensuring it is always collected first.</p>
            </div>

            {/* Feature 2: Graph */}
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6'}}>
                <Activity size={28} />
              </div>
              <h3>Dynamic Routing (Graph)</h3>
              <p>City maps are represented as <strong>Undirected Graphs</strong>. When a truck is dispatched, <strong>Dijkstra's Algorithm</strong> calculates the absolute shortest path. It even supports dynamic edge deletion to simulate real-time traffic blocks.</p>
            </div>

            {/* Feature 3: AVL Tree */}
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981'}}>
                <Award size={28} />
              </div>
              <h3>Household Directory (AVL Tree)</h3>
              <p>To ensure optimal performance as the city scales, the user database is structured as a <strong>Self-Balancing AVL Tree</strong>, guaranteeing $O(\log n)$ search/insertion times for lightning-fast profile retrieval and reward allocation.</p>
            </div>

            {/* Feature 4: DLL */}
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b'}}>
                <Clock size={28} />
              </div>
              <h3>Activity Cache (Doubly Linked List)</h3>
              <p>Recent dispatches are cached using a <strong>Doubly Linked List (DLL)</strong> implementing an LRU policy. This allows real-time monitoring of fleet operations with ultra-fast $O(1)$ Head insertions and Tail evictions without Array shifting overhead.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <p>&copy; {new Date().getFullYear()} EcoSmart Waste Control Systems. Academic Project.</p>
        </footer>
      </div>
    );
  }

  if (screen === 'login') {
    return (
      <div className="login-container">
        <div className="login-card">
          <div style={{display:'flex', justifyContent:'center', marginBottom:'1rem', color:'var(--accent-primary)'}}>
            <Lock size={48} />
          </div>
          <h1>♻️ Eco<span>Smart</span> Admin</h1>
          <p>Please sign in to access the control panel</p>
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Administrator ID</label>
              <input 
                type="text" 
                className="form-control" 
                value={username}
                onChange={(e)=>setUsername(e.target.value)}
                placeholder="Enter 'admin'"
                required 
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                placeholder="Enter 'admin123'"
                required 
              />
            </div>
            {loginError && <p style={{color:'var(--danger)', fontSize:'0.85rem', marginBottom:'1rem'}}>{loginError}</p>}
            <button type="submit" className="btn btn-primary" style={{marginTop:'0.5rem', width:'100%'}}>Access Dashboard</button>
            <button type="button" onClick={() => setScreen('home')} className="btn" style={{marginTop:'1rem', width:'100%', background:'transparent', color:'var(--text-muted)'}}>Back to Home</button>
          </form>
        </div>
      </div>
    );
  }

  // --- DASHBOARD RENDERERS ---
  const renderDashboard = () => (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Pickups Today</h3>
            <div className="value">{systemStats.totalPickups}</div>
          </div>
          <div className="stat-icon" style={{background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6'}}>
            <Truck size={24} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Active Queue (Alerts)</h3>
            <div className="value">{systemStats.activeAlerts}</div>
          </div>
          <div className="stat-icon" style={{background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444'}}>
            <AlertTriangle size={24} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Rewards Issued</h3>
            <div className="value">{systemStats.totalRewards} pts</div>
          </div>
          <div className="stat-icon" style={{background: 'rgba(16, 185, 129, 0.2)', color: '#10b981'}}>
            <Gift size={24} />
          </div>
        </div>
      </div>
      {/* Top Stats Row */}

      <div className="panel" style={{marginTop: '2rem'}}>
        <div className="panel-header">
          <h2 className="panel-title"><Award size={20} color="var(--accent-primary)"/> Recent Dispatch History</h2>
        </div>
        <p style={{color:'var(--text-muted)', marginBottom:'1.5rem', fontSize:'0.9rem'}}>
          Live log of the 5 most recent garbage collection dispatches across all zones.
        </p>
        <div className="queue-list">
          {recentPickups.length > 0 ? (
            recentPickups.map((item, idx) => (
              <div key={idx} className="queue-item" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <div style={{fontWeight: '600', marginBottom: '0.2rem'}}>House ID: {item.houseId} <span style={{color:'var(--text-muted)', fontSize:'0.85rem', marginLeft:'0.5rem'}}>({item.zone})</span></div>
                  <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>{item.wasteType}</div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <span className={`badge ${item.priority == 3 ? 'badge-red' : item.priority == 2 ? 'badge-orange' : 'badge-green'}`} style={{marginBottom: '0.3rem', display: 'inline-block'}}>
                    Level {item.priority}
                  </span>
                  <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Time: {item.completedAt}</div>
                </div>
              </div>
            ))
          ) : (
            <div style={{textAlign:'center', padding:'2rem', color:'var(--text-muted)'}}>
              No recent pickups.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderQueue = () => (
    <div className="content-grid">
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title"><Trash2 size={20} color="var(--accent-primary)"/> Add Collection Request</h2>
        </div>
        <p style={{color:'var(--text-muted)', marginBottom:'1.5rem', fontSize:'0.9rem'}}>This action submits a new prioritized request to the dispatch center.</p>
        
        <form onSubmit={submitRequest}>
          <div className="form-group">
            <label>Household / Entity ID</label>
            <select className="form-control" value={houseId} onChange={(e) => setHouseId(e.target.value)}>
              {availableHouses.map(house => (
                <option key={house.id} value={house.id}>{house.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Waste Type</label>
            <select className="form-control" value={wasteType} onChange={(e) => setWasteType(e.target.value)}>
              <option value="Organic">Organic Waste</option>
              <option value="Plastic">Recyclable Plastics</option>
              <option value="Medical">Hazardous / Medical</option>
            </select>
          </div>
          <div className="form-group">
            <label>Priority Level</label>
            <select className="form-control" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="1">Level 1 (Normal)</option>
              <option value="2">Level 2 (High Volume)</option>
              <option value="3">Level 3 (Critical/Hazardous)</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{width:'100%'}}>Insert to Priority Queue</button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title"><Trash2 size={20} color="var(--accent-primary)"/> Prioritized Pending Queue</h2>
        </div>
        <p style={{color:'var(--text-muted)', marginBottom:'1rem', fontSize:'0.9rem'}}>Live view of the intelligent dispatch queue.</p>
        <div className="queue-list" style={{maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem'}}>
          {queue.length > 0 ? (
            queue.map((item, idx) => (
              <div key={idx} className={`queue-item ${item.priority == 3 ? 'urgent' : ''}`}>
                <div>
                  <h4>{item.houseId == 999 ? 'City Hospital' : `House ${item.houseId}`} <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>({item.wasteType})</span></h4>
                </div>
                <div className={`badge ${item.priority == 3 ? 'badge-red' : item.priority == 2 ? 'badge-orange' : 'badge-green'}`}>
                  Level {item.priority}
                </div>
              </div>
            ))
          ) : (
            <div style={{textAlign:'center', padding:'2rem', color:'var(--text-muted)'}}>
              Queue is empty
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDispatch = () => (
    <div className="content-grid" style={{gridTemplateColumns: '1fr 1fr'}}>
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title"><Map size={20} color="var(--accent-secondary)"/> Route Dispatcher</h2>
        </div>
        <p style={{color:'var(--text-muted)', marginBottom:'1.5rem'}}>
          Automatically selects the highest priority request and computes the most efficient, fuel-saving route.
          <br/><br/>
          <span style={{background: 'rgba(59, 130, 246, 0.2)', padding: '0.4rem 0.8rem', borderRadius: '8px', color: 'var(--accent-secondary)'}}>
            🚛 Current Truck Location: <strong>{truckLocation}</strong>
          </span>
        </p>

        <div style={{marginBottom:'2rem'}}>
          <button onClick={dispatchTruck} className="btn btn-primary">Dispatch Next Truck</button>
        </div>

        {nextPickup && (
          <div className="map-container">
            <h3 style={{marginBottom:'1rem'}}>Active Mission</h3>
            <div style={{display:'flex', gap:'2rem', marginBottom:'1.5rem'}}>
              <div>
                <span style={{color:'var(--text-muted)', fontSize:'0.85rem'}}>Target Location</span>
                <p style={{fontSize:'1.25rem', fontWeight:'700'}}>
                  {nextPickup.houseId == 999 ? 'City Hospital' : `House ID: ${nextPickup.houseId}`}
                </p>
              </div>
              <div>
                <span style={{color:'var(--text-muted)', fontSize:'0.85rem'}}>Load Type</span>
                <p style={{fontSize:'1.25rem', fontWeight:'700'}}>{nextPickup.wasteType}</p>
              </div>
              <div>
                <span style={{color:'var(--text-muted)', fontSize:'0.85rem'}}>Priority</span>
                <p>
                  <span className={`badge ${nextPickup.priority == 3 ? 'badge-red' : nextPickup.priority == 2 ? 'badge-orange' : 'badge-green'}`}>
                    Level {nextPickup.priority}
                  </span>
                </p>
              </div>
            </div>

            {route && (
              <div style={{background:'rgba(0,0,0,0.2)', padding:'1.5rem', borderRadius:'8px'}}>
                <h3 style={{color:'var(--accent-secondary)', marginTop:'1rem', fontSize:'1rem'}}>Optimal Route Calculated</h3>
                <div style={{marginTop: '1.5rem'}}>
                  <CityMapGraphic activeRoute={route} allEdges={graphEdges} />
                  {routeDistance !== null && (
                    <div style={{marginTop: '1rem', textAlign: 'center', background: 'rgba(16, 185, 129, 0.2)', padding: '0.5rem', borderRadius: '8px', color: '#10b981', fontWeight: 'bold'}}>
                      Total Driving Distance: {routeDistance} km
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {!nextPickup && (
          <div className="map-container" style={{alignItems:'center', color:'var(--text-muted)'}}>
            <Map size={48} style={{opacity:0.2, marginBottom:'1rem'}}/>
            <p>No active missions. Dispatch a truck to begin routing.</p>
          </div>
        )}
      </div>

      <div className="panel">
        <h3 style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-secondary)', marginBottom: '1rem'}}><Map size={20}/> Live Next-Route Predictor</h3>

        <p style={{color:'var(--text-muted)', marginBottom:'1.5rem', fontSize:'0.9rem'}}>
          Dynamically monitors the priority queue and calculates optimized transit paths.
        </p>
        
        {predictedRoute ? (
            <div style={{background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px dashed var(--accent-secondary)'}}>
              <div style={{marginBottom: '1rem'}}>
                <span style={{color: 'var(--text-muted)'}}>Next up in Queue: </span>
                <strong>{predictedRoute.nextJob.houseId == 999 ? 'City Hospital' : `House ${predictedRoute.nextJob.houseId}`}</strong>
                <span className={`badge ${predictedRoute.nextJob.priority == 3 ? 'badge-red' : predictedRoute.nextJob.priority == 2 ? 'badge-orange' : 'badge-green'}`} style={{marginLeft: '10px'}}>
                  Level {predictedRoute.nextJob.priority}
                </span>
              </div>
              <p style={{color:'var(--text-muted)', lineHeight:'1.6', marginBottom:'1.5rem', fontSize:'0.9rem'}}>
              The system dynamically retrieves the user from the database to find their zone, and computes the shortest path from the Current Truck Location:
            </p>
              
              <div style={{marginTop: '1rem'}}>
                <CityMapGraphic activeRoute={predictedRoute.route} allEdges={graphEdges} />
                {predictedRoute.distance !== null && (
                  <div style={{marginTop: '1rem', textAlign: 'center', background: 'rgba(59, 130, 246, 0.2)', padding: '0.5rem', borderRadius: '8px', color: 'var(--accent-secondary)', fontWeight: 'bold'}}>
                    Predicted Distance: {predictedRoute.distance} km
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-muted)'}}>
              Queue is empty. No route predictions available.
            </div>
          )}
      </div>
    </div>
  );

  const renderRewards = () => (
    <div className="content-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'}}>
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title"><Award size={20} color="var(--accent-primary)"/> Register New Household</h2>
        </div>
        <p style={{color:'var(--text-muted)', marginBottom:'1.5rem', fontSize:'0.9rem'}}>
          This action performs a new profile registration in the central system.
        </p>
        <form onSubmit={registerHouse}>
          <div className="form-group">
            <label>New House ID (Auto-Generated)</label>
            <input type="number" className="form-control" value={newHouseId} readOnly disabled style={{background: 'rgba(255,255,255,0.05)', cursor: 'not-allowed', color: 'var(--text-muted)'}} />
          </div>
          <div className="form-group">
            <label>Owner Name</label>
            <input type="text" className="form-control" value={newOwnerName} onChange={(e) => setNewOwnerName(e.target.value)} placeholder="e.g. Sirisena" required />
          </div>
          <div className="form-group">
            <label>Located Zone</label>
            <select className="form-control" value={newZone} onChange={(e) => setNewZone(e.target.value)}>
              <option value="Zone A">Zone A</option>
              <option value="Zone B">Zone B</option>
              <option value="Zone C">Zone C</option>
              <option value="Zone D">Zone D</option>
              <option value="Hospital">Hospital Area</option>
            </select>
          </div>
          <button type="submit" className="btn btn-outline" style={{width:'100%', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)'}}>
            Register New Profile
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title"><Gift size={20} color="#f59e0b"/> Reward Allocation</h2>
        </div>
        <p style={{color:'var(--text-muted)', marginBottom:'1.5rem', fontSize:'0.9rem'}}>
          This action initiates a point allocation lookup for verified users.
        </p>
        
        {nextPickup ? (
          <div>
            <div style={{background:'rgba(16, 185, 129, 0.1)', padding:'1.5rem', borderRadius:'8px', border:'1px solid rgba(16, 185, 129, 0.2)', marginBottom:'1.5rem'}}>
              <h3 style={{color:'#10b981', marginBottom:'0.5rem'}}>Truck arrived at House {nextPickup.houseId}</h3>
              <p style={{color:'var(--text-muted)'}}>Waste collected successfully. Issue reward points to the house owner's account.</p>
            </div>
            <button onClick={addReward} className="btn btn-primary" style={{background:'#10b981', width:'100%'}}>
              <Gift size={18}/> Issue 20 Reward Points
            </button>
          </div>
        ) : (
          <div style={{textAlign:'center', padding:'3rem 1rem', color:'var(--text-muted)'}}>
            <Truck size={48} style={{opacity:0.2, margin:'0 auto 1rem auto'}}/>
            <p>Dispatch a truck and complete a route first before issuing rewards.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderDirectory = () => (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title"><Award size={20} color="var(--accent-primary)"/> Household Directory</h2>
      </div>
      <p style={{color:'var(--text-muted)', marginBottom:'1.5rem', fontSize:'0.9rem'}}>
        Comprehensive view of all registered households sorted by identity ID.
      </p>
      
      <div style={{overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px'}}>
          <thead>
            <tr style={{borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)'}}>
              <th style={{padding: '1rem', fontWeight: '500'}}>House ID</th>
              <th style={{padding: '1rem', fontWeight: '500'}}>Owner Name</th>
              <th style={{padding: '1rem', fontWeight: '500'}}>Zone</th>
              <th style={{padding: '1rem', fontWeight: '500'}}>Reward Points</th>
            </tr>
          </thead>
          <tbody>
            {directoryUsers.length > 0 ? directoryUsers.map((u, i) => (
              <tr key={i} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                <td style={{padding: '1rem', color: 'var(--accent-secondary)', fontWeight: 'bold'}}>{u.houseId}</td>
                <td style={{padding: '1rem'}}>{u.ownerName}</td>
                <td style={{padding: '1rem'}}>{u.zone}</td>
                <td style={{padding: '1rem'}}>
                  <span className="badge badge-green">{u.rewardPoints} pts</span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{padding: '2rem', textAlign: 'center', color: 'var(--text-muted)'}}>No households registered.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="panel" style={{maxWidth: '800px', margin: '0 auto'}}>
      <div className="panel-header" style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '2rem'}}>
        <h2 className="panel-title" style={{fontSize: '1.5rem'}}><Info size={24} color="var(--accent-primary)"/> About Eco Smart System</h2>
      </div>
      
      <div style={{display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem'}}>
        <div style={{background: 'var(--bg-dark)', padding: '2rem', borderRadius: '50%', border: '2px solid var(--accent-primary)'}}>
          <Leaf size={48} color="var(--accent-primary)" />
        </div>
        <div>
          <h1 style={{fontSize: '2rem', marginBottom: '0.5rem', color: '#fff'}}>Eco Smart v2.0</h1>
          <p style={{color: 'var(--text-muted)', fontSize: '1.1rem'}}>Enterprise Urban Waste Management Platform</p>
          <div style={{marginTop: '1rem', display: 'inline-block', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold'}}>
            System Status: Online & Optimized
          </div>
        </div>
      </div>

      <h3 style={{color: '#fff', marginBottom: '1.5rem', fontSize: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem'}}>Core Modules Architecture</h3>
      
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
        <div style={{background: 'var(--bg-dark)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem'}}>
            <Trash2 size={20} color="#ef4444" />
            <h4 style={{color: '#fff', fontSize: '1.1rem'}}>Priority Engine</h4>
          </div>
          <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6'}}>
            Smart prioritization subsystem that analyzes incoming waste requests and immediately escalates critical or hazardous medical waste for immediate dispatch.
          </p>
        </div>

        <div style={{background: 'var(--bg-dark)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem'}}>
            <Map size={20} color="#3b82f6" />
            <h4 style={{color: '#fff', fontSize: '1.1rem'}}>Dynamic Router</h4>
          </div>
          <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6'}}>
            AI-driven spatial routing algorithms that compute the absolute shortest delivery paths dynamically, significantly reducing fleet fuel consumption and carbon footprint.
          </p>
        </div>

        <div style={{background: 'var(--bg-dark)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem'}}>
            <Gift size={20} color="#10b981" />
            <h4 style={{color: '#fff', fontSize: '1.1rem'}}>Loyalty Database</h4>
          </div>
          <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6'}}>
            High-speed centralized hierarchical database ensuring instant user profile retrieval, registration, and seamless reward point allocation.
          </p>
        </div>

        <div style={{background: 'var(--bg-dark)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem'}}>
            <Clock size={20} color="#f59e0b" />
            <h4 style={{color: '#fff', fontSize: '1.1rem'}}>Activity Cache</h4>
          </div>
          <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6'}}>
            High-performance, memory-efficient caching engine designed for real-time monitoring and logging of recent dispatch activities.
          </p>
        </div>
      </div>
      
      <div style={{marginTop: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem'}}>
        <p>© 2026 Eco Smart Urban Solutions. All rights reserved.</p>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Leaf size={24} color="var(--accent-primary)"/> Eco<span>Smart</span>
        </div>
        <div className="sidebar-nav">
          <div className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}>
            <LayoutDashboard size={20} />
            Overview
          </div>
            <div className={`nav-item ${activeView === 'queue' ? 'active' : ''}`} onClick={() => setActiveView('queue')}>
              <Trash2 size={18}/> Pending Requests
            </div>
            <div className={`nav-item ${activeView === 'dispatch' ? 'active' : ''}`} onClick={() => setActiveView('dispatch')}>
              <Map size={18}/> Live Routing
            </div>
            <div className={`nav-item ${activeView === 'rewards' ? 'active' : ''}`} onClick={() => setActiveView('rewards')}>
              <Gift size={18}/> Loyalty Rewards
            </div>
            <div className={`nav-item ${activeView === 'directory' ? 'active' : ''}`} onClick={() => setActiveView('directory')}>
              <Users size={18}/> Registered Users
            </div>
            <div className={`nav-item ${activeView === 'about' ? 'active' : ''}`} onClick={() => setActiveView('about')}>
              <Info size={18}/> About System
            </div>
        </div>
        
        <div style={{padding: '2rem 1rem', borderTop: '1px solid var(--border-color)'}}>
           <div className="nav-item" onClick={handleLogout} style={{color: 'var(--danger)'}}>
            <LogOut size={20} />
            Sign Out
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            {activeView === 'dashboard' && 'System Dashboard'}
            {activeView === 'queue' && 'Queue Management'}
            {activeView === 'dispatch' && 'Live Dispatch Center'}
            {activeView === 'rewards' && 'Recycling Rewards Program'}
            {activeView === 'directory' && 'Household Directory'}
            {activeView === 'about' && 'About System'}
          </div>
          
          <div className="topbar-actions">
            <div style={{color:'var(--text-muted)', cursor:'pointer'}}><Bell size={20}/></div>
            <div className="profile-btn">
              <div className="avatar">A</div>
              <span style={{fontSize:'0.875rem', fontWeight:'600'}}>Admin</span>
            </div>
          </div>
        </header>

        <div className="view-area">
          {alert && (
            <div className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{marginBottom:'2rem'}}>
              {alert.type === 'success' ? <CheckCircle2 size={20}/> : <AlertTriangle size={20}/>}
              {alert.msg}
            </div>
          )}

          <div key={activeView} className="animate-view">
            {activeView === 'dashboard' && renderDashboard()}
            {activeView === 'queue' && renderQueue()}
            {activeView === 'dispatch' && renderDispatch()}
            {activeView === 'rewards' && renderRewards()}
            {activeView === 'directory' && renderDirectory()}
            {activeView === 'about' && renderAbout()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
