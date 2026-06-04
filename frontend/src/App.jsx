// Daisy GT - Complete Frontend Application
// Author: Douglas Owens Jr.
// Ecosystem: DaisyOS / SAYSO
// Full Racing HUD, Ghost Overlay, Physical Training, Social, NFTs

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin, googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import io from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ============ API CONFIGURATION ============
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:3000';

let socket = null;

// ============ MAIN APP ============
const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState({
    primary: '#FF1800',
    secondary: '#00FFFF',
    telemetry: '#FFFFFF',
    ghost: '#00FF88'
  });
  const [activeTab, setActiveTab] = useState('dashboard');

  // Initialize socket connection
  useEffect(() => {
    if (token) {
      socket = io(WS_URL, {
        auth: { token }
      });
      
      socket.on('connect', () => console.log('🔌 WebSocket connected'));
      socket.on('telemetry_update', (data) => {
        window.dispatchEvent(new CustomEvent('telemetryUpdate', { detail: data }));
      });
      socket.on('race_started', (data) => {
        toast.info(`🏁 Race started! ${data.participants.length} racers`);
      });
      
      return () => socket.disconnect();
    }
  }, [token]);

  // Load user from token
  useEffect(() => {
    if (token) {
      axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setUser(res.data.user);
        if (res.data.theme) setTheme(res.data.theme);
        setLoading(false);
      }).catch(() => {
        localStorage.removeItem('token');
        setToken(null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <h1>DAISY GT</h1>
        <p>Initializing telemetry systems...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen setToken={setToken} setUser={setUser} />;
  }

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router>
        <div className="app" style={{ '--primary-color': theme.primary, '--secondary-color': theme.secondary }}>
          <HelpWidget user={user} />
          
          {/* Floating chromatic flags background */}
          <div className="flag-background">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="chromatic-flag" style={{
                animationDelay: `${i * 0.5}s`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${15 + Math.random() * 20}s`
              }}>
                <div className="flag-inner"></div>
              </div>
            ))}
          </div>
          
          <nav className="main-nav">
            <div className="nav-logo">
              <h2>🏁 DAISY GT</h2>
              <span className="badge">v1.0</span>
            </div>
            <div className="nav-links">
              <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                📊 DASH
              </button>
              <button className={activeTab === 'race' ? 'active' : ''} onClick={() => setActiveTab('race')}>
                🏁 RACE
              </button>
              <button className={activeTab === 'training' ? 'active' : ''} onClick={() => setActiveTab('training')}>
                💪 TRAIN
              </button>
              <button className={activeTab === 'social' ? 'active' : ''} onClick={() => setActiveTab('social')}>
                🌍 SOCIAL
              </button>
              <button className={activeTab === 'garage' ? 'active' : ''} onClick={() => setActiveTab('garage')}>
                🚗 GARAGE
              </button>
              <button className={activeTab === 'clubs' ? 'active' : ''} onClick={() => setActiveTab('clubs')}>
                👥 CLUBS
              </button>
              <button className={activeTab === 'nft' ? 'active' : ''} onClick={() => setActiveTab('nft')}>
                💎 NFT
              </button>
              <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                👤 {user.display_name?.split(' ')[0] || 'PROFILE'}
              </button>
            </div>
            <div className="nav-user">
              <div className="user-avatar" style={{ backgroundImage: `url(${user.avatar_url})` }}>
                {!user.avatar_url && user.display_name?.[0]}
              </div>
              <button onClick={() => {
                googleLogout();
                localStorage.removeItem('token');
                window.location.reload();
              }} className="logout-btn">🚪</button>
            </div>
          </nav>
          
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard user={user} token={token} theme={theme} setTheme={setTheme} socket={socket} />} />
              <Route path="/race/:raceId?" element={<RaceMode user={user} token={token} socket={socket} />} />
              <Route path="/training" element={<TrainingMode user={user} token={token} />} />
              <Route path="/social" element={<SocialHub user={user} token={token} />} />
              <Route path="/garage" element={<Garage user={user} token={token} />} />
              <Route path="/clubs" element={<Clubs user={user} token={token} />} />
              <Route path="/nft" element={<NFTMarketplace user={user} token={token} />} />
              <Route path="/profile/:userId?" element={<Profile user={user} token={token} />} />
            </Routes>
          </main>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
};

// ============ LOGIN SCREEN ============
const LoginScreen = ({ setToken, setUser }) => {
  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const res = await axios.post(`${API_URL}/auth/google`, {
          token: response.access_token
        });
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        toast.success(`Welcome back, ${res.data.user.display_name}!`);
      } catch (error) {
        toast.error('Login failed. Try again.');
      }
    },
    onError: () => toast.error('Google login failed')
  });

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-logo">
          <h1>🏁 DAISY GT</h1>
          <p>Global Racing Platform</p>
          <div className="ecosystem-badge">Powered by DaisyOS | SAYSO</div>
        </div>
        <div className="login-features">
          <div className="feature">🚗 Real-time GPS Racing</div>
          <div className="feature">👻 Ghost Vehicle Overlay</div>
          <div className="feature">📊 Full Telemetry + Dyno</div>
          <div className="feature">💪 Physical Training + Leaderboards</div>
          <div className="feature">💎 NFT Race Collectibles</div>
          <div className="feature">👥 Clubs up to 12 Racers</div>
        </div>
        <button onClick={() => login()} className="google-login-btn">
          <img src="https://www.google.com/favicon.ico" alt="G" /> Sign in with Google
        </button>
        <div className="free-trial-badge">✨ 2-WEEK FREE TRIAL ✨</div>
        <div className="disclaimers">
          <p>⚠️ DISCLAIMER: Daisy GT is for entertainment only. Obey all traffic laws.</p>
          <p>⚠️ NOT RESPONSIBLE for injury, vehicle damage, or legal violations.</p>
          <p>⚠️ Racing on public roads prohibited where illegal.</p>
        </div>
      </div>
    </div>
  );
};

// ============ DASHBOARD (MAIN HUD) ============
const Dashboard = ({ user, token, theme, setTheme, socket }) => {
  const [activeRaces, setActiveRaces] = useState([]);
  const [recentRaces, setRecentRaces] = useState([]);
  const [leaderboards, setLeaderboards] = useState({});
  const [telemetry, setTelemetry] = useState({ speed: 0, rpm: 0, gForce: 0 });
  const [cameraActive, setCameraActive] = useState(false);
  const [faceExpression, setFaceExpression] = useState('neutral');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Load active races
  useEffect(() => {
    axios.get(`${API_URL}/races/active`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setActiveRaces(res.data));
    
    axios.get(`${API_URL}/races/history`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setRecentRaces(res.data.slice(0, 5)));
    
    // Load top leaderboards
    ['speed_king', 'bench_press_max', 'pullups_max', 'shuttle_run'].forEach(cat => {
      axios.get(`${API_URL}/leaderboards/${cat}?limit=5`).then(res => {
        setLeaderboards(prev => ({ ...prev, [cat]: res.data }));
      });
    });
  }, [token]);

  // Listen for telemetry updates
  useEffect(() => {
    const handler = (e) => setTelemetry(e.detail);
    window.addEventListener('telemetryUpdate', handler);
    return () => window.removeEventListener('telemetryUpdate', handler);
  }, []);

  // Face/emotion detection for dynamic colors
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
      
      // Simulate emotion detection (replace with Face-api.js later)
      setInterval(async () => {
        const emotions = ['focused', 'excited', 'calm', 'aggressive'];
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        setFaceExpression(randomEmotion);
        
        // Get AI mood colors based on face
        const colorRes = await axios.post(`${API_URL}/ai/mood-color`, {
          facialExpression: randomEmotion,
          speed: telemetry.speed,
          gForce: telemetry.gForce
        }, { headers: { Authorization: `Bearer ${token}` } });
        
        if (colorRes.data) setTheme(colorRes.data);
      }, 5000);
    } catch (error) {
      toast.error('Camera access denied');
    }
  };

  return (
    <div className="dashboard">
      {/* Telemetry HUD */}
      <div className="telemetry-hud">
        <div className="hud-card speed-card">
          <div className="hud-label">SPEED</div>
          <div className="hud-value" style={{ color: theme.telemetry }}>{Math.round(telemetry.speed)}</div>
          <div className="hud-unit">MPH</div>
        </div>
        <div className="hud-card rpm-card">
          <div className="hud-label">RPM</div>
          <div className="hud-value" style={{ color: theme.telemetry }}>{telemetry.rpm || 0}</div>
        </div>
        <div className="hud-card gforce-card">
          <div className="hud-label">G-FORCE</div>
          <div className="hud-value" style={{ color: theme.telemetry }}>{telemetry.gForce?.toFixed(2) || '0.00'}</div>
        </div>
        <div className="hud-card face-card">
          <div className="hud-label">DAISY MOOD</div>
          <div className="hud-value" style={{ color: theme.primary }}>{faceExpression.toUpperCase()}</div>
          {!cameraActive && <button onClick={startCamera} className="cam-btn">🎥 ENABLE FACE TRACKING</button>}
        </div>
      </div>
      
      {/* Video feed */}
      {cameraActive && (
        <div className="camera-feed">
          <video ref={videoRef} autoPlay playsInline muted className="face-video" />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}
      
      {/* Active Races */}
      <div className="dashboard-section">
        <h3>🏁 LIVE RACES <span className="spectator-badge">SPECTATE FREE</span></h3>
        <div className="race-grid">
          {activeRaces.map(race => (
            <Link to={`/race/${race.id}`} key={race.id} className="race-card">
              <div className="race-name">{race.race_name}</div>
              <div className="race-details">{race.racer_count || 0}/{race.max_racers} racers</div>
              <div className="race-status">{race.status === 'racing' ? '🔴 LIVE' : '🟢 WAITING'}</div>
              <button className="spectate-btn">👁️ SPECTATE</button>
            </Link>
          ))}
          {activeRaces.length === 0 && <div className="empty-state">No active races. Start one!</div>}
        </div>
        <Link to="/race/new"><button className="create-race-btn">🏁 CREATE NEW RACE</button></Link>
      </div>
      
      {/* Leaderboards */}
      <div className="dashboard-section">
        <h3>🏆 GLOBAL LEADERBOARDS</h3>
        <div className="leaderboard-grid">
          <div className="leaderboard-card">
            <h4>TOP SPEED</h4>
            {leaderboards.speed_king?.map((entry, i) => (
              <div key={i} className="leaderboard-entry">{i+1}. {entry.display_name} - {Math.round(entry.value)} mph</div>
            ))}
          </div>
          <div className="leaderboard-card">
            <h4>BENCH PRESS</h4>
            {leaderboards.bench_press_max?.map((entry, i) => (
              <div key={i} className="leaderboard-entry">{i+1}. {entry.display_name} - {Math.round(entry.value)} lbs</div>
            ))}
          </div>
          <div className="leaderboard-card">
            <h4>PULL-UPS</h4>
            {leaderboards.pullups_max?.map((entry, i) => (
              <div key={i} className="leaderboard-entry">{i+1}. {entry.display_name} - {Math.round(entry.value)} reps</div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Recent Races */}
      <div className="dashboard-section">
        <h3>📜 YOUR RECENT RACES</h3>
        <div className="history-list">
          {recentRaces.map(race => (
            <div key={race.id} className="history-item">
              <span>{race.race_name}</span>
              <span>Position: {race.my_position || 'N/A'}</span>
              <Link to={`/race/${race.id}`}>REPLAY ➜</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============ RACE MODE (WITH GHOST OVERLAY) ============
const RaceMode = ({ user, token, socket }) => {
  const { raceId } = useParams();
  const navigate = useNavigate();
  const [race, setRace] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [myTelemetry, setMyTelemetry] = useState({ speed: 0, lat: null, lng: null, heading: 0 });
  const [ghostData, setGhostData] = useState({});
  const [raceActive, setRaceActive] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // split, full, map
  const [selectedGhost, setSelectedGhost] = useState(null);
  const watchIdRef = useRef(null);

  // Start GPS tracking
  const startGPSTracking = useCallback(() => {
    if (!navigator.geolocation) return;
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const telemetry = {
          speed: position.coords.speed * 2.23694 || 0, // m/s to mph
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          altitude: position.coords.altitude,
          heading: position.coords.heading || 0,
          gForce: 0, // Would come from accelerometer
          rpm: 0
        };
        setMyTelemetry(telemetry);
        
        if (raceActive && raceId) {
          axios.post(`${API_URL}/races/telemetry/${raceId}`, telemetry, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(console.error);
        }
      },
      (error) => console.error('GPS error:', error),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
  }, [raceActive, raceId, token]);

  // Load race data
  useEffect(() => {
    if (raceId && raceId !== 'new') {
      axios.get(`${API_URL}/races/status/${raceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setRace(res.data.race);
        setParticipants(res.data.participants);
        if (res.data.race.status === 'racing') setRaceActive(true);
      });
    }
  }, [raceId, token]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !raceId) return;
    
    socket.emit('join_race', raceId);
    socket.on('telemetry_update', (data) => {
      if (data.userId !== user.id) {
        setGhostData(prev => ({ ...prev, [data.userId]: data }));
      }
    });
    socket.on('race_started', () => {
      setRaceActive(true);
      startGPSTracking();
      toast.info('🏁 RACE STARTED! GO GO GO!');
    });
    socket.on('player_finished', (data) => {
      toast.info(`🏆 ${data.userId} finished in position ${data.position}`);
    });
    
    return () => {
      socket.emit('leave_race', raceId);
      socket.off('telemetry_update');
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [socket, raceId, user.id, startGPSTracking]);

  // Create new race
  const createRace = async () => {
    const raceData = {
      raceName: `Race ${new Date().toLocaleTimeString()}`,
      maxRacers: 12,
      isPrivate: false,
      raceType: 'drag'
    };
    const res = await axios.post(`${API_URL}/races/create`, raceData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    navigate(`/race/${res.data.race.id}`);
  };

  // Start race (if creator)
  const startRace = async () => {
    await axios.post(`${API_URL}/races/start/${raceId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setRaceActive(true);
          startGPSTracking();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Join race
  const joinRace = async () => {
    const vehicles = await axios.get(`${API_URL}/garage`, { headers: { Authorization: `Bearer ${token}` } });
    const vehicleId = vehicles.data[0]?.id;
    await axios.post(`${API_URL}/races/join/${raceId}`, { vehicleId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    toast.success('Joined race!');
    window.location.reload();
  };

  if (raceId === 'new') {
    return (
      <div className="create-race-screen">
        <h1>CREATE NEW RACE</h1>
        <button onClick={createRace}>START RACE</button>
        <Link to="/dashboard">← BACK</Link>
      </div>
    );
  }

  if (!race) return <div className="loading">Loading race...</div>;

  return (
    <div className="race-mode">
      {/* Countdown overlay */}
      {countdown && <div className="countdown-overlay">{countdown}</div>}
      
      {/* View mode selector */}
      <div className="view-controls">
        <button className={viewMode === 'split' ? 'active' : ''} onClick={() => setViewMode('split')}>SPLIT</button>
        <button className={viewMode === 'full' ? 'active' : ''} onClick={() => setViewMode('full')}>FULL GHOST</button>
        <button className={viewMode === 'map' ? 'active' : ''} onClick={() => setViewMode('map')}>MAP</button>
      </div>
      
      {/* Main race view */}
      <div className={`race-view ${viewMode}`}>
        {/* Own vehicle view */}
        <div className="my-vehicle-view">
          <div className="speedometer-lar