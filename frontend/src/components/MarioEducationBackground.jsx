import React, { useState, useEffect } from 'react';

export default function MarioEducationBackground({ children }) {
  const [time, setTime] = useState(999);
  const [coins, setCoins] = useState(0);
  const [bouncedBlock1, setBouncedBlock1] = useState(false);
  const [bouncedBlock2, setBouncedBlock2] = useState(false);
  const [block1Hits, setBlock1Hits] = useState(0);
  const [block2Hits, setBlock2Hits] = useState(0);

  // Countdown timer animation
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => (prev > 0 ? prev - 1 : 999));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleBlockClick = (blockId) => {
    // Play Mario Coin Sound if possible
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
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
      }
    } catch (e) {
      console.warn(e);
    }

    setCoins(prev => prev + 1);

    if (blockId === 1) {
      setBouncedBlock1(true);
      setBlock1Hits(prev => prev + 1);
      setTimeout(() => setBouncedBlock1(false), 200);
    } else {
      setBouncedBlock2(true);
      setBlock2Hits(prev => prev + 1);
      setTimeout(() => setBouncedBlock2(false), 200);
    }
  };

  return (
    <div className="mario-edu-container" style={{
      position: 'relative',
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#5c94fc', // NES Sky Blue
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <style>{`
        @keyframes drift {
          0% { transform: translateX(110vw); }
          100% { transform: translateX(-20vw); }
        }
        @keyframes walkAndJump {
          0% { left: -40px; transform: scaleX(1) translateY(0); }
          25% { left: 20%; transform: scaleX(1) translateY(0); }
          27% { left: 22%; transform: scaleX(1) translateY(-25px); } /* Jump */
          29% { left: 24%; transform: scaleX(1) translateY(0); }
          50% { left: 42%; transform: scaleX(1) translateY(0); }
          51% { left: 42%; transform: scaleX(-1) translateY(0); }
          75% { left: 20%; transform: scaleX(-1) translateY(0); }
          77% { left: 18%; transform: scaleX(-1) translateY(-25px); } /* Jump */
          79% { left: 16%; transform: scaleX(-1) translateY(0); }
          99% { left: -40px; transform: scaleX(-1) translateY(0); }
          100% { left: -40px; transform: scaleX(1) translateY(0); }
        }
        @keyframes goombaWalk {
          0% { right: -30px; }
          100% { right: 110vw; }
        }
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes blockBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes diplomaSpawn {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          50% { transform: translateY(-40px) scale(1.2); opacity: 1; }
          100% { transform: translateY(-80px) scale(1); opacity: 0; }
        }
        .mario-cloud {
          position: absolute;
          animation: drift linear infinite;
        }
        .mario-character {
          position: absolute;
          bottom: 48px;
          animation: walkAndJump 12s linear infinite;
        }
        .mario-block {
          cursor: pointer;
          transition: transform 0.1s;
        }
        .mario-block:active {
          transform: scale(0.9);
        }
        .diploma-popup {
          position: absolute;
          animation: diplomaSpawn 0.8s ease-out forwards;
          pointer-events: none;
          font-size: 24px;
        }
      `}</style>

      {/* Top NES Status Bar */}
      <div className="nes-status-bar" style={{
        position: 'absolute',
        top: '16px',
        left: '0',
        right: '0',
        display: 'flex',
        justifyContent: 'space-around',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontSize: '14px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        zIndex: 10,
        padding: '0 20px',
        letterSpacing: '1px',
        textShadow: '2px 2px 0px #000000'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div>GPA</div>
          <div>4.0</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div>COINS</div>
          <div>🪙 x ${String(coins).padStart(2, '0')}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div>WORLD</div>
          <div>1-1</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div>TIME</div>
          <div>${String(time).padStart(3, '0')}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div>GRADE</div>
          <div style={{ color: '#fbd000' }}>A+</div>
        </div>
      </div>

      {/* Drifting Clouds (SMB-style white pixel-look clouds) */}
      <div className="mario-cloud" style={{ top: '8%', animationDuration: '35s', animationDelay: '-5s' }}>
        <svg width="64" height="32" viewBox="0 0 64 32">
          <path d="M16 8h32v4h8v4h4v12h-4v4H4v-4H0V16h4v-4h12V8z" fill="#ffffff" stroke="#000000" strokeWidth="2" />
        </svg>
      </div>
      <div className="mario-cloud" style={{ top: '16%', animationDuration: '55s', animationDelay: '-25s' }}>
        <svg width="48" height="24" viewBox="0 0 48 24">
          <path d="M12 6h24v3h6v3h3v9h-3v3H3v-3H0v-9h3v-3h9V6z" fill="#ffffff" stroke="#000000" strokeWidth="2" opacity="0.8" />
        </svg>
      </div>
      <div className="mario-cloud" style={{ top: '24%', animationDuration: '45s', animationDelay: '-15s' }}>
        <svg width="64" height="32" viewBox="0 0 64 32">
          <path d="M16 8h32v4h8v4h4v12h-4v4H4v-4H0V16h4v-4h12V8z" fill="#ffffff" stroke="#000000" strokeWidth="2" opacity="0.6" />
        </svg>
      </div>

      {/* Floating placement & upskill stats */}
      <div className="retro-stat-box" style={{
        position: 'absolute',
        left: '4%',
        top: '25%',
        background: '#000000',
        border: '3px solid #fbd000',
        color: '#fbd000',
        padding: '6px 12px',
        fontFamily: 'monospace',
        fontSize: '11px',
        fontWeight: 'bold',
        boxShadow: '3px 3px 0px #000000',
        animation: 'bob 3s ease-in-out infinite',
        zIndex: 5,
        letterSpacing: '0.5px'
      }}>
        PLACEMENT: 98%
      </div>

      <div className="retro-stat-box" style={{
        position: 'absolute',
        right: '4%',
        top: '25%',
        background: '#000000',
        border: '3px solid #43b047',
        color: '#43b047',
        padding: '6px 12px',
        fontFamily: 'monospace',
        fontSize: '11px',
        fontWeight: 'bold',
        boxShadow: '3px 3px 0px #000000',
        animation: 'bob 3.5s ease-in-out infinite',
        animationDelay: '0.5s',
        zIndex: 5,
        letterSpacing: '0.5px'
      }}>
        SALARY: +42%
      </div>

      <div className="retro-stat-box" style={{
        position: 'absolute',
        left: '6%',
        top: '42%',
        background: '#000000',
        border: '3px solid #ffffff',
        color: '#ffffff',
        padding: '6px 12px',
        fontFamily: 'monospace',
        fontSize: '11px',
        fontWeight: 'bold',
        boxShadow: '3px 3px 0px #000000',
        animation: 'bob 4s ease-in-out infinite',
        animationDelay: '1s',
        zIndex: 5,
        letterSpacing: '0.5px'
      }}>
        UPSKILL: LVL UP
      </div>

      <div className="retro-stat-box" style={{
        position: 'absolute',
        right: '6%',
        top: '42%',
        background: '#000000',
        border: '3px solid #e52521',
        color: '#e52521',
        padding: '6px 12px',
        fontFamily: 'monospace',
        fontSize: '11px',
        fontWeight: 'bold',
        boxShadow: '3px 3px 0px #000000',
        animation: 'bob 3.2s ease-in-out infinite',
        animationDelay: '1.5s',
        zIndex: 5,
        letterSpacing: '0.5px'
      }}>
        OFFERS: 100+
      </div>

      {/* Left-side Interactive Block Stack (NES Book block) */}
      <div className="mario-block-container" style={{
        position: 'absolute',
        left: '8%',
        bottom: '160px',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Diploma popping out animation */}
        {bouncedBlock1 && (
          <span className="diploma-popup" style={{ bottom: '40px' }}>📜</span>
        )}
        <div 
          onClick={() => handleBlockClick(1)}
          className="mario-block"
          style={{
            width: '40px',
            height: '40px',
            background: block1Hits > 5 ? '#8d8d8d' : '#fbd000', // Turns into solid block after 5 hits
            border: '3px solid #000000',
            boxShadow: '3px 3px 0px #000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: '900',
            animation: bouncedBlock1 ? 'blockBounce 0.2s ease-out' : 'none'
          }}
        >
          {block1Hits > 5 ? '' : '📖'}
        </div>
        <div style={{
          width: '32px',
          height: '60px',
          background: 'repeating-linear-gradient(0deg, #c84c0c, #c84c0c 12px, #000 12px, #000 14px)',
          border: '3px solid #000000',
          borderBottom: 'none',
          marginTop: '6px'
        }} />
      </div>

      {/* Right-side Interactive Block Stack (NES Graduation Cap block) */}
      <div className="mario-block-container" style={{
        position: 'absolute',
        right: '8%',
        bottom: '220px',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Book popping out animation */}
        {bouncedBlock2 && (
          <span className="diploma-popup" style={{ bottom: '40px' }}>🎓</span>
        )}
        <div 
          onClick={() => handleBlockClick(2)}
          className="mario-block"
          style={{
            width: '40px',
            height: '40px',
            background: block2Hits > 5 ? '#8d8d8d' : '#fbd000',
            border: '3px solid #000000',
            boxShadow: '3px 3px 0px #000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: '900',
            animation: bouncedBlock2 ? 'blockBounce 0.2s ease-out' : 'none'
          }}
        >
          {block2Hits > 5 ? '' : '🎓'}
        </div>
        <div style={{
          width: '40px',
          height: '40px',
          background: '#c84c0c',
          border: '3px solid #000000',
          marginTop: '6px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
          padding: '4px'
        }}>
          <div style={{ height: '4px', background: '#000' }} />
          <div style={{ height: '4px', background: '#000' }} />
        </div>
      </div>

      {/* Green Hills (SMB pixel-style green round mountains) */}
      <div style={{
        position: 'absolute',
        bottom: '48px',
        left: '4%',
        width: '120px',
        height: '60px',
        background: '#43b047',
        border: '3px solid #000000',
        borderRadius: '60px 60px 0 0',
        borderBottom: 'none',
        zIndex: 2
      }}>
        <div style={{ width: '6px', height: '6px', background: '#000', borderRadius: '50%', position: 'absolute', top: '15px', left: '30px' }} />
        <div style={{ width: '6px', height: '6px', background: '#000', borderRadius: '50%', position: 'absolute', top: '25px', left: '80px' }} />
      </div>

      <div style={{
        position: 'absolute',
        bottom: '48px',
        right: '5%',
        width: '180px',
        height: '90px',
        background: '#43b047',
        border: '3px solid #000000',
        borderRadius: '90px 90px 0 0',
        borderBottom: 'none',
        zIndex: 2
      }}>
        {/* School House details */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '50px',
          height: '40px',
          background: '#ffffff',
          border: '3px solid #000000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          zIndex: 3
        }}>
          {/* Red Roof */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            width: '0',
            height: '0',
            borderLeft: '28px solid transparent',
            borderRight: '28px solid transparent',
            borderBottom: '20px solid #e52521',
          }} />
          {/* Roof border overlay */}
          <div style={{
            position: 'absolute',
            top: '-22px',
            width: '56px',
            height: '3px',
            background: '#000000',
            transform: 'rotate(35deg) translate(8px, -12px)'
          }} />
          <div style={{
            position: 'absolute',
            top: '-22px',
            width: '56px',
            height: '3px',
            background: '#000000',
            transform: 'rotate(-35deg) translate(-8px, -12px)'
          }} />
          {/* Door */}
          <div style={{
            width: '16px',
            height: '22px',
            background: '#c84c0c',
            border: '2px solid #000000',
            borderBottom: 'none'
          }} />
        </div>
      </div>

      {/* Graduation Candidate walking/jumping character */}
      <div className="mario-character" style={{
        width: '32px',
        height: '42px',
        zIndex: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Black Graduation Cap */}
        <div style={{
          width: '28px',
          height: '6px',
          background: '#000000',
          border: '2.5px solid #000000',
          position: 'relative',
          transform: 'rotate(-5deg)'
        }}>
          {/* Tassel */}
          <div style={{
            position: 'absolute',
            right: '-4px',
            top: '2px',
            width: '6px',
            height: '10px',
            borderLeft: '2px solid #fbd000',
            borderBottom: '4px solid #fbd000'
          }} />
        </div>
        {/* Face */}
        <div style={{
          width: '20px',
          height: '16px',
          background: '#fcb494',
          border: '3px solid #000000',
          borderTop: 'none',
          marginTop: '-1px',
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '2px 4px 0 4px'
        }}>
          {/* Eyes */}
          <div style={{ width: '3px', height: '4px', background: '#000' }} />
          <div style={{ width: '3px', height: '4px', background: '#000' }} />
        </div>
        {/* Red Mario shirt */}
        <div style={{
          width: '24px',
          height: '16px',
          background: '#e52521',
          border: '3px solid #000000',
          borderTop: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 2px'
        }}>
          {/* Overalls strap */}
          <div style={{ width: '4px', height: '100%', background: '#002fbe' }} />
          {/* Diploma in hand */}
          <div style={{ 
            width: '8px', 
            height: '14px', 
            background: '#ffffff', 
            border: '2px solid #000000',
            position: 'absolute',
            left: '-6px',
            top: '24px',
            transform: 'rotate(45deg)'
          }} />
          <div style={{ width: '4px', height: '100%', background: '#002fbe' }} />
        </div>
        {/* Legs/Feet */}
        <div style={{
          width: '24px',
          height: '6px',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <div style={{ width: '8px', height: '6px', background: '#000000', border: '2px solid #000000', borderTop: 'none' }} />
          <div style={{ width: '8px', height: '6px', background: '#000000', border: '2px solid #000000', borderTop: 'none' }} />
        </div>
      </div>

      {/* Walking Goomba with mortarboard cap */}
      <div style={{
        position: 'absolute',
        bottom: '48px',
        width: '24px',
        height: '28px',
        zIndex: 3,
        animation: 'goombaWalk 16s linear infinite',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Tiny mortarboard */}
        <div style={{
          width: '18px',
          height: '4px',
          background: '#000000',
          border: '1.5px solid #000000',
          position: 'relative'
        }} />
        {/* Goomba Body */}
        <div style={{
          width: '20px',
          height: '14px',
          background: '#c84c0c',
          border: '2.5px solid #000000',
          borderTop: 'none',
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '1px'
        }}>
          {/* Eyes */}
          <div style={{ width: '2px', height: '4px', background: '#ffffff', border: '1px solid #000', borderTop: 'none' }} />
          <div style={{ width: '2px', height: '4px', background: '#ffffff', border: '1px solid #000', borderTop: 'none' }} />
        </div>
        {/* Feet */}
        <div style={{
          width: '22px',
          height: '4px',
          background: '#000000',
          border: '1px solid #000000',
          borderTop: 'none'
        }} />
      </div>

      {/* Main Authentication card container */}
      <div style={{ zIndex: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {children}
      </div>

      {/* Mario NES Brick Ground */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        height: '48px',
        background: 'repeating-linear-gradient(90deg, #c84c0c, #c84c0c 20px, #000000 20px, #000000 22px), repeating-linear-gradient(0deg, #c84c0c, #c84c0c 16px, #000000 16px, #000000 18px)',
        borderTop: '4px solid #000000',
        zIndex: 4
      }} />
    </div>
  );
}
