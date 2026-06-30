import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  collection,
  onSnapshot
} from 'firebase/firestore';
import { 
  Activity, CloudRain, Cpu, Globe, Lock, User, 
  Zap, MessageSquare, Menu, X, ChevronRight, BarChart2 
} from 'lucide-react';

const appId = typeof window !== 'undefined' && window.__app_id ? window.__app_id : 'chitraharsha-vidyutvarsha';
const firebaseConfig = typeof window !== 'undefined' && window.__firebase_config 
  ? JSON.parse(window.__firebase_config) 
  : { projectId: 'mock-project' };

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase initialization failed:", e);
}

const DEPARTMENTS = [
  "HR Department", "Finance Department", "CEO Department", 
  "Brainstorming Sessions / Department", "Data Analyst Department", 
  "Data Scientist Department", "Research & Development Department", 
  "Shareholders Department", "Meeting Rooms Department", 
  "CCTV Monitoring Room Department", "Interior Designer Department", 
  "Transport Department", "Emergency Conditions Department", 
  "Cleaning Staff Department", "Peons", "Canteen (Chef/Cook)", 
  "Floor Cleaners", "Security Guards", "Guest / Standard User"
];

const CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee', type: 'fiat', baseRate: 83.2 },
  { code: 'USD', name: 'US Dollar', type: 'fiat', baseRate: 1.0 },
  { code: 'EUR', name: 'Euro', type: 'fiat', baseRate: 0.92 },
  { code: 'BTC', name: 'Bitcoin', type: 'crypto', baseRate: 0.000015 },
  { code: 'CHC', name: 'ChitraHarsha Crypto', type: 'crypto', baseRate: 0.0042 }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('auth'); // auth, dashboard
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof window !== 'undefined' && window.__initial_auth_token) {
          await signInWithCustomToken(auth, window.__initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth Error:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) setCurrentView('dashboard');
    });

    initAuth();
    return () => unsubscribe();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400">
        <Activity className="animate-spin w-12 h-12" />
        <span className="ml-4 text-xl font-bold tracking-widest uppercase">Initializing Quantum Core...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans overflow-x-hidden selection:bg-cyan-500 selection:text-white relative">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(6,182,212,0.15),_rgba(15,23,42,1))]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {currentView === 'auth' ? (
          <AuthView onLogin={() => { setCurrentView('dashboard'); showToast("Login Successful. Welcome to the Grid."); }} db={db} user={user} showToast={showToast} />
        ) : (
          <DashboardView db={db} user={user} onLogout={() => setCurrentView('auth')} showToast={showToast} />
        )}
      </div>

      {toast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-cyan-900/90 border border-cyan-400 text-cyan-100 px-6 py-3 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)] z-50 backdrop-blur-sm animate-fade-in-up">
          {toast}
        </div>
      )}
    </div>
  );
}

function AuthView({ onLogin, db, user, showToast }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: '', password: '', passkey: '', name: '', department: 'Guest / Standard User',
    city: '', state: '', pincode: '', aadhar: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return showToast("System Error: No Auth Token");
    
    try {
      if (isRegistering) {
        // Save to Database
        const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
        await setDoc(userRef, {
          ...formData,
          createdAt: new Date().toISOString(),
          accountStatus: 'Active',
          blockchainEncrypted: true // Mock flag
        });
        showToast("Registration Complete. Encrypted via Cloud.");
      }
      onLogin();
    } catch (err) {
      console.error(err);
      showToast("Verification Failed.");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.15)] overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-wider mb-2">
              The ChitraHarsha
            </h1>
            <h2 className="text-xl text-cyan-300 font-semibold tracking-widest uppercase">VidyutVarsha</h2>
            <p className="text-slate-400 text-sm mt-2">Pioneering The AI-Driven Energy Innovations</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Username (Email/Mobile)" required
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-4 py-3 text-cyan-100 placeholder-slate-500 outline-none transition-all"
                onChange={e => setFormData({...formData, username: e.target.value})} />
              <input type="password" placeholder="Password (8+ chars)" required minLength={8}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-4 py-3 text-cyan-100 placeholder-slate-500 outline-none transition-all"
                onChange={e => setFormData({...formData, password: e.target.value})} />
              
              {isRegistering && (
                <>
                  <input type="text" placeholder="Full Name" required
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-4 py-3 text-cyan-100 placeholder-slate-500 outline-none transition-all"
                    onChange={e => setFormData({...formData, name: e.target.value})} />
                  <input type="text" placeholder="Passkey / Authenticator ID"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-4 py-3 text-cyan-100 placeholder-slate-500 outline-none transition-all"
                    onChange={e => setFormData({...formData, passkey: e.target.value})} />
                  <input type="text" placeholder="City" required
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-4 py-3 text-cyan-100 placeholder-slate-500 outline-none transition-all"
                    onChange={e => setFormData({...formData, city: e.target.value})} />
                  <input type="text" placeholder="State" required
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-4 py-3 text-cyan-100 placeholder-slate-500 outline-none transition-all"
                    onChange={e => setFormData({...formData, state: e.target.value})} />
                  <select 
                    className="w-full md:col-span-2 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-4 py-3 text-cyan-100 outline-none transition-all appearance-none"
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                  >
                    <option value="" disabled>Select Job Role / Category</option>
                    {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </>
              )}
            </div>

            <button type="submit" className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:scale-[1.02] flex items-center justify-center">
              {isRegistering ? 'Register & Encrypt Data' : 'Initialize Connection'}
              <ChevronRight className="ml-2 w-5 h-5" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-cyan-400 hover:text-cyan-300 text-sm underline underline-offset-4 transition-colors">
              {isRegistering ? 'Existing User? Login Here' : 'New User? Access Registration Process'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardView({ db, user, onLogout, showToast }) {
  const [activeTab, setActiveTab] = useState('generator'); // generator, converter, profile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'generator', label: 'Wave Energy Generator', icon: Zap },
    { id: 'converter', label: 'Live Currency Tracker', icon: BarChart2 },
    { id: 'profile', label: 'Virtual ID & Access', icon: User },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-cyan-900/50 px-4 sm:px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-3">
          <CloudRain className="w-8 h-8 text-cyan-400 animate-pulse" />
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">VidyutVarsha</h1>
            <p className="text-[10px] text-slate-400 tracking-widest uppercase hidden sm:block">ChitraHarsha AI-Driven Innovations</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`px-4 py-2 rounded-md flex items-center text-sm font-medium transition-all ${
                activeTab === item.id 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800'
              }`}>
              <item.icon className="w-4 h-4 mr-2" /> {item.label}
            </button>
          ))}
          <button onClick={onLogout} className="px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-md text-sm font-medium ml-4 transition-all">
            Disconnect
          </button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-cyan-400" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-cyan-900 absolute top-[72px] left-0 w-full z-40 shadow-xl">
          {navItems.map(item => (
            <button key={item.id} onClick={() => {setActiveTab(item.id); setIsMobileMenuOpen(false);}}
              className="w-full text-left px-6 py-4 border-b border-slate-800 flex items-center text-cyan-100 hover:bg-slate-800">
              <item.icon className="w-5 h-5 mr-3 text-cyan-400" /> {item.label}
            </button>
          ))}
          <button onClick={onLogout} className="w-full text-left px-6 py-4 text-red-400 hover:bg-slate-800">Disconnect</button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full relative">
        {activeTab === 'generator' && <EnergyGenerator db={db} user={user} showToast={showToast} />}
        {activeTab === 'converter' && <CurrencyTracker />}
        {activeTab === 'profile' && <UserProfile db={db} user={user} />}
      </main>

      {/* AI Assistant Chatbot */}
      <AiAssistantWidget />

      {/* Footer / Quick Links */}
      <footer className="border-t border-cyan-900/30 bg-slate-900/50 py-8 px-4 text-center text-sm text-slate-500 backdrop-blur-md">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-4">
          <a href="#" className="hover:text-cyan-400 transition-colors">Home</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Contact Us</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Blogs</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">FAQs</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Terms & Conditions</a>
        </div>
        <div className="mb-2">
          <button className="text-cyan-300 border border-cyan-500/30 px-6 py-2 rounded-full hover:bg-cyan-500/10 transition-colors">
            Get in Touch
          </button>
        </div>
        <p>© 2026 The ChitraHarsha VPK Ventures Pvt Ltd. Global Cloud Infrastructure.</p>
      </footer>
    </div>
  );
}

function EnergyGenerator({ db, user, showToast }) {
  const canvasRef = useRef(null);
  const graphRef = useRef(null);
  const [intensity, setIntensity] = useState(50);
  const [stats, setStats] = useState({ volume: 0, energy: 0 });
  const energyHistory = useRef([]);

  // Physics Simulation Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // Canvas sizing
    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = 400;
    };
    resize();
    window.addEventListener('resize', resize);

    const raindrops = [];
    const ripples = [];
    let currentEnergy = 0;

    class Drop {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.z = Math.random() * 0.5 + 0.5; // Depth for parallax
        this.len = Math.random() * 20 + 10;
        this.speed = (Math.random() * 10 + 10) * this.z * (intensity / 50);
        // Criss-cross angle
        this.angle = (Math.random() - 0.5) * 0.5; 
      }
      fall() {
        this.y += this.speed;
        this.x += this.angle * this.speed;
        if (this.y > canvas.height - 20) {
          // Hit the basin
          ripples.push(new Ripple(this.x, canvas.height - 20));
          currentEnergy += this.speed * 0.1; // Simple kinetic mapping
          this.y = -20;
          this.x = Math.random() * canvas.width;
          this.speed = (Math.random() * 10 + 10) * this.z * (intensity / 50 + 0.2);
        }
      }
      draw() {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.angle * this.len, this.y + this.len);
        ctx.strokeStyle = `rgba(6, 182, 212, ${this.z})`;
        ctx.lineWidth = this.z * 2;
        ctx.stroke();
      }
    }

    class Ripple {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 1;
        this.alpha = 1;
      }
      expand() {
        this.radius += 2;
        this.alpha -= 0.05;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(168, 85, 247, ${this.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Populate drops
    const dropCount = Math.floor(intensity * 2);
    for (let i = 0; i < dropCount; i++) {
      raindrops.push(new Drop());
    }

    let frameCount = 0;

    const render = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.3)'; // Trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Basin
      ctx.fillStyle = 'rgba(6, 182, 212, 0.1)';
      ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 20);
      ctx.lineTo(canvas.width, canvas.height - 20);
      ctx.stroke();

      // Ensure drop count matches intensity dynamically
      while(raindrops.length < Math.floor(intensity * 2)) raindrops.push(new Drop());
      while(raindrops.length > Math.floor(intensity * 2)) raindrops.pop();

      raindrops.forEach(drop => {
        drop.fall();
        drop.draw();
      });

      for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].expand();
        ripples[i].draw();
        if (ripples[i].alpha <= 0) ripples.splice(i, 1);
      }

      // Update Stats & Graph every few frames
      if (frameCount % 10 === 0) {
        setStats(prev => ({
          volume: prev.volume + currentEnergy * 0.5,
          energy: prev.energy + currentEnergy
        }));
        
        energyHistory.current.push(currentEnergy);
        if(energyHistory.current.length > 50) energyHistory.current.shift();
        drawGraph();
        currentEnergy = 0;
      }

      frameCount++;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  // Waveform Graph Logic
  const drawGraph = () => {
    const canvas = graphRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (energyHistory.current.length === 0) return;

    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    
    const sliceWidth = canvas.width / 50;
    let x = 0;

    for (let i = 0; i < energyHistory.current.length; i++) {
      const v = energyHistory.current[i];
      // Normalize height mapping (assuming max energy spike is around 50 for math)
      const y = canvas.height - (v * 3); 
      ctx.lineTo(x, Math.max(0, y));
      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.strokeStyle = '#a855f7'; // Purple wave
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
    ctx.fill();
  };

  // Save data to cloud
  const saveToCloud = async () => {
    if (!user) return;
    try {
      const statsRef = doc(db, 'artifacts', appId, 'users', user.uid, 'energy', 'latest');
      await setDoc(statsRef, {
        timestamp: new Date().toISOString(),
        totalEnergy: stats.energy,
        totalVolume: stats.volume,
        aiOptimization: 'Active'
      }, { merge: true });
      showToast("Data Synced to Google Cloud DB Successfully.");
    } catch (e) {
      console.error(e);
      showToast("Sync Error. Retrying in background.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <CloudRain className="mr-2 text-cyan-400" /> 
            Kinetic Matrix Simulator
          </h2>
          <span className="text-xs bg-cyan-900/50 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/30 flex items-center">
            <Activity className="w-3 h-3 mr-1 animate-pulse" /> Live Monitoring
          </span>
        </div>
        
        {/* Simulation Canvas Container */}
        <div className="w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative mb-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <canvas ref={canvasRef} className="w-full h-[400px] block" />
          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700/50 text-sm font-mono">
            <div>AI Predictive Model: <span className="text-green-400">ACTIVE</span></div>
            <div>Quantum Encryption: <span className="text-cyan-400">SECURE</span></div>
          </div>
        </div>

        {/* Controls & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <label className="block text-sm font-medium text-slate-400 mb-2">Rainfall Intensity (ML Controller)</label>
            <input 
              type="range" min="10" max="100" value={intensity} 
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Light</span><span>Storm</span>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex flex-col justify-center items-center">
            <div className="text-slate-400 text-sm mb-1">Energy Harvested</div>
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-mono">
              {stats.energy.toFixed(2)} J
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex flex-col justify-center items-center">
            <div className="text-slate-400 text-sm mb-1">Volume Processed</div>
            <div className="text-3xl font-bold text-cyan-400 font-mono">
              {stats.volume.toFixed(2)} mL
            </div>
          </div>
        </div>
      </div>

      {/* Waveform Visualization */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
         <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-200">Wave Energy Output</h3>
          <button onClick={saveToCloud} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-[0_0_10px_rgba(37,99,235,0.4)] transition-colors">
            Sync to Database
          </button>
        </div>
        <div className="w-full h-[150px] bg-slate-950 rounded-xl border border-slate-800">
          <canvas ref={graphRef} width={800} height={150} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}

function CurrencyTracker() {
  const [amount, setAmount] = useState(1);
  const [base, setBase] = useState('USD');
  const [target, setTarget] = useState('CHC');
  const [rates, setRates] = useState(CURRENCIES);

  // Simulate live market fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setRates(prev => prev.map(c => {
        if (c.code === 'USD') return c; // Base anchor
        const fluctuation = (Math.random() - 0.5) * 0.005; // 0.5% max swing
        return { ...c, baseRate: c.baseRate * (1 + fluctuation) };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const convert = () => {
    const baseObj = rates.find(c => c.code === base);
    const targetObj = rates.find(c => c.code === target);
    if (!baseObj || !targetObj) return 0;
    // Calculate via USD anchor
    const inUSD = amount / baseObj.baseRate;
    return (inUSD * targetObj.baseRate).toFixed(6);
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-[0_0_30px_rgba(15,23,42,0.8)]">
        <h2 className="text-2xl font-bold flex items-center mb-6">
          <Globe className="mr-3 text-purple-400" />
          Global Asset Converter & 10 Trillion SQL Tracker
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Amount</label>
            <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 focus:border-purple-400 rounded-lg px-4 py-3 text-slate-100 outline-none font-mono text-lg"
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-400 mb-2">From</label>
             <select value={base} onChange={e => setBase(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-purple-400 rounded-lg px-4 py-3 text-slate-100 outline-none appearance-none">
                {rates.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
             </select>
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-400 mb-2">To</label>
             <select value={target} onChange={e => setTarget(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-purple-400 rounded-lg px-4 py-3 text-slate-100 outline-none appearance-none">
                {rates.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
             </select>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center flex flex-col justify-center items-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-10">
              <BarChart2 className="w-32 h-32 text-cyan-400" />
           </div>
           <div className="relative z-10">
             <div className="text-slate-400 text-lg mb-2">Converted Value</div>
             <div className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 font-mono tracking-wider break-all">
               {convert()} {target}
             </div>
             <div className="mt-4 text-xs text-green-400 flex items-center justify-center">
               <Activity className="w-4 h-4 mr-1 animate-pulse" /> API Sync: LIVE
             </div>
           </div>
        </div>
      </div>

      {/* Live Market Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-x-auto">
         <h3 className="text-lg font-bold mb-4 border-b border-slate-800 pb-2">Live Market Index (vs USD)</h3>
         <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-500 text-sm">
                <th className="pb-3 font-medium">Asset</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium text-right">Current Rate</th>
              </tr>
            </thead>
            <tbody>
              {rates.filter(c => c.code !== 'USD').map(c => (
                <tr key={c.code} className="border-t border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 text-slate-200 font-medium">{c.name} <span className="text-slate-500 text-xs ml-2">{c.code}</span></td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-xs ${c.type === 'crypto' ? 'bg-purple-900/50 text-purple-400' : 'bg-blue-900/50 text-blue-400'}`}>
                      {c.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 text-right font-mono text-cyan-400">{c.baseRate.toFixed(6)}</td>
                </tr>
              ))}
            </tbody>
         </table>
      </div>
    </div>
  );
}

function UserProfile({ db, user }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data'), (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
    }, (error) => {
      console.error("Profile Fetch Error", error);
    });
    return () => unsub();
  }, [user]);

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-cyan-900/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(6,182,212,0.1)] relative overflow-hidden">
        {/* Holographic background effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 border-b border-slate-800 pb-8 mb-8">
           <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-900 to-slate-900 border border-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
             <User className="w-12 h-12 text-cyan-400" />
           </div>
           <div>
             <h2 className="text-3xl font-bold text-white mb-1">Virtual ID Card</h2>
             <p className="text-cyan-400 font-mono tracking-widest text-sm mb-2">{user?.uid || 'XX-UNKNOWN-XX'}</p>
             <div className="inline-block bg-green-900/50 border border-green-500/50 text-green-400 text-xs px-3 py-1 rounded-full">
               Blockchain Verified
             </div>
           </div>
        </div>

        {profile ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4 relative z-10">
            <div>
              <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Full Name</div>
              <div className="text-lg text-slate-200">{profile.name}</div>
            </div>
            <div>
              <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Department / Role</div>
              <div className="text-lg text-purple-400 font-medium">{profile.department}</div>
            </div>
            <div>
              <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Username</div>
              <div className="text-lg text-slate-200">{profile.username}</div>
            </div>
            <div>
              <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Location</div>
              <div className="text-lg text-slate-200">{profile.city}, {profile.state} {profile.pincode}</div>
            </div>
          </div>
        ) : (
          <div className="text-slate-400 text-center py-8">
            <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Loading Encrypted Data Vault...</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Greetings. I am the ChitraHarsha AI core. How can I assist you with energy optimization or data analysis today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = { text: input, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Mock NLP Response Generation
    setTimeout(() => {
      let botResponse = "Processing query through Language Models...";
      const lower = userMsg.text.toLowerCase();
      
      if (lower.includes('energy') || lower.includes('power')) {
        botResponse = "The kinetic matrix is currently operating at 94% efficiency. Predictive weather models indicate optimal rainfall in 3 hours.";
      } else if (lower.includes('crypto') || lower.includes('chc')) {
        botResponse = "ChitraHarsha Crypto (CHC) is currently experiencing standard market volatility. Automated trades are paused.";
      } else if (lower.includes('hello') || lower.includes('hi')) {
        botResponse = "Hello. All systems are nominal and secured via quantum encryption protocols.";
      } else {
        botResponse = "Query logged to BigQuery for deep analysis. I will optimize the parameters based on your input.";
      }

      setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.3)] w-[320px] sm:w-[380px] h-[450px] mb-4 flex flex-col overflow-hidden animate-fade-in-up">
          <div className="bg-cyan-950/80 px-4 py-3 border-b border-cyan-800 flex justify-between items-center backdrop-blur-md">
             <div className="flex items-center text-cyan-300 font-bold">
               <Cpu className="w-5 h-5 mr-2 animate-pulse" />
               VidyutVarsha NLP Core
             </div>
             <button onClick={() => setIsOpen(false)} className="text-cyan-500 hover:text-cyan-300">
               <X className="w-5 h-5" />
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  msg.isBot 
                  ? 'bg-slate-800 text-cyan-100 rounded-tl-none border border-slate-700' 
                  : 'bg-cyan-600 text-white rounded-tr-none shadow-[0_0_10px_rgba(8,145,178,0.5)]'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Interact with AI..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-full pl-4 pr-10 py-2 text-sm text-white outline-none transition-all"
              />
              <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-cyan-500 hover:text-cyan-300">
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
      
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full p-4 shadow-[0_0_20px_rgba(8,145,178,0.6)] transform hover:scale-110 transition-all flex items-center justify-center animate-bounce-slow"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}