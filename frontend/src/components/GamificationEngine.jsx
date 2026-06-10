import React, { useState, useEffect, useRef } from 'react';

// Mario RPG Progression States
const getLevelClassName = (level) => {
  if (level === 1) return 'Small Mario (Novice)';
  if (level === 2) return 'Super Mario (Apprentice)';
  if (level === 3) return 'Fire Mario (Journeyman)';
  if (level === 4) return 'Tanooki Mario (Adept)';
  if (level === 5) return 'Invincible Mario (Expert)';
  return 'Super Mario Hero (Master)';
};

// Real-time Sound Synthesis for Mario Beeps
const playArcadeSound = (type, muted) => {
  if (muted) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'xp') {
      // Mario Coin Sound: B5 (987.77Hz) for 0.08s, then E6 (1318.51Hz) for 0.25s
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      
      osc.frequency.setValueAtTime(987.77, ctx.currentTime);
      osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'level') {
      // Mario Mushroom Power-up arpeggio sound: E4, G4, E5, C5, D5, G5
      const notes = [330.00, 392.00, 659.25, 523.25, 587.33, 783.99];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
        
        gain.gain.setValueAtTime(0.04, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.25);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.25);
      });
    }
  } catch (e) {
    console.warn('AudioContext failed to load/play:', e);
  }
};

export default function GamificationEngine({ children }) {
  const [xp, setXp] = useState(() => Number(localStorage.getItem('vg-rpg-xp') || 0));
  const [level, setLevel] = useState(() => Number(localStorage.getItem('vg-rpg-level') || 1));
  const [muted, setMuted] = useState(() => localStorage.getItem('vg-rpg-mute') === 'true');
  const [showLevelUpAlert, setShowLevelUpAlert] = useState(false);
  const canvasRef = useRef(null);

  const particlesRef = useRef([]);
  const textPopupsRef = useRef([]);

  const getXpNeeded = (lvl) => lvl * 100;

  useEffect(() => {
    localStorage.setItem('vg-rpg-xp', xp.toString());
    localStorage.setItem('vg-rpg-level', level.toString());
    localStorage.setItem('vg-rpg-mute', muted.toString());
  }, [xp, level, muted]);

  // Canvas loop rendering gold coins and flat bounce stars
  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw and update particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.24; // gravity effect
        p.alpha -= p.decay;
        
        if (p.alpha <= 0) return false;

        ctx.save();
        ctx.globalAlpha = p.alpha;

        if (p.isCoin) {
          // Draw spinning Mario coin
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.fillStyle = '#fbd000'; // Coin Gold
          
          p.spinAngle += 0.25;
          const spinWidth = Math.abs(Math.sin(p.spinAngle)) * p.size * 2;
          
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, spinWidth / 2, p.size, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // Inner vertical stamp line
          ctx.strokeStyle = '#e52521'; // Mario Red outline
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - p.size / 2);
          ctx.lineTo(p.x, p.y + p.size / 2);
          ctx.stroke();
        } else {
          // Draw 8-bit star/sparks
          ctx.fillStyle = p.color;
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        
        ctx.restore();
        return true;
      });

      // 2. Draw and update text popups
      textPopupsRef.current = textPopupsRef.current.filter(t => {
        t.y -= 1.8;
        t.alpha -= 0.02;
        if (t.alpha <= 0) return false;

        ctx.save();
        ctx.globalAlpha = t.alpha;
        ctx.shadowBlur = 0;
        ctx.fillStyle = t.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.font = 'bold 16px "monospace"';
        ctx.strokeText(t.text, t.x - 20, t.y);
        ctx.fillText(t.text, t.x - 20, t.y);
        ctx.restore();
        return true;
      });

      animId = requestAnimationFrame(update);
    };
    update();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleGlobalClick = (e) => {
    const target = e.target;
    const isInteractive = 
      target.tagName === 'BUTTON' || 
      target.tagName === 'A' || 
      target.tagName === 'INPUT' || 
      target.tagName === 'SELECT' || 
      target.closest('button') || 
      target.closest('a') || 
      target.closest('.nav-item') ||
      target.classList.contains('clickable');

    const xpGained = isInteractive ? 10 : 2;

    // Add Floating Text (Red for button, Yellow for background)
    textPopupsRef.current.push({
      x: e.clientX,
      y: e.clientY - 10,
      text: `+${xpGained} XP`,
      color: isInteractive ? '#e52521' : '#ffd700',
      alpha: 1.0
    });

    // Add Burst Particles (Coins and Sparks)
    const colors = ['#e52521', '#43b047', '#002fbe', '#fbd000'];
    const pCount = isInteractive ? 12 : 4;
    for (let i = 0; i < pCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 3;
      particlesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: Math.random() * 4 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        isCoin: Math.random() > 0.3, // 70% chance of spinning gold coin
        spinAngle: Math.random() * Math.PI,
        alpha: 1.0,
        decay: Math.random() * 0.015 + 0.01
      });
    }

    if (isInteractive) {
      playArcadeSound('xp', muted);
      
      setXp(prev => {
        let newXp = prev + xpGained;
        let needed = getXpNeeded(level);
        if (newXp >= needed) {
          setLevel(l => {
            const nextLvl = l + 1;
            setShowLevelUpAlert(true);
            setTimeout(() => setShowLevelUpAlert(false), 3500);
            playArcadeSound('level', muted);
            return nextLvl;
          });
          newXp -= needed;
        }
        return newXp;
      });
    }
  };

  return (
    <div onClick={handleGlobalClick} style={{ minHeight: '100vh', position: 'relative' }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          pointerEvents: 'none', 
          zIndex: 9999 
        }} 
      />

      {/* Retro 8-bit sound controller */}
      <button 
        className="sound-mute-toggle"
        onClick={(e) => {
          e.stopPropagation();
          setMuted(prev => !prev);
        }}
        title="Toggle Mario Coin Audio"
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          zIndex: 9999,
          background: '#fbd000',
          border: '3px solid #000000',
          color: '#000000',
          padding: '8px 14px',
          borderRadius: '0px', // sharp corners
          fontSize: '12px',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '2px 2px 0px #000000',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <span>🪙</span> {muted ? 'MUTED' : 'MARIO COINS'}
      </button>

      {/* Mario Level Up Alert */}
      {showLevelUpAlert && (
        <div 
          className="level-up-overlay animate-scale-in"
          style={{
            position: 'fixed',
            top: '25%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10000,
            background: 'linear-gradient(135deg, #fbd000, #ffeb60)', // Question block yellow
            border: '4px solid #000000',
            boxShadow: '8px 8px 0px #000000',
            padding: '30px 50px',
            borderRadius: '0px',
            textAlign: 'center',
            fontFamily: '"Outfit", sans-serif',
            color: 'black',
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontSize: '38px', fontWeight: '900', color: '#e52521', WebkitTextStroke: '1.5px black', letterSpacing: '2px', marginBottom: '8px' }}>
            🍄 POWER UP!
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#002fbe', textTransform: 'uppercase', marginBottom: '10px' }}>
            Advanced to Level {level}
          </div>
          <div style={{ fontSize: '14px', color: '#222' }}>
            Current Class: <strong>{getLevelClassName(level)}</strong>
          </div>
        </div>
      )}

      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { xp, level, xpNeeded: getXpNeeded(level), classNameTitle: getLevelClassName(level) });
        }
        return child;
      })}
    </div>
  );
}
