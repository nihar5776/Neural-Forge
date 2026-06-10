import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const PageTransition = ({ children, className = '', style = {} }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

export const FadeIn = ({ children, delay = 0, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer = ({ children, delayChildren = 0.1, staggerChildren = 0.1, className = '' }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className = '' }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
};

// -------------------------------------------------------------
// HYPER-PREMIUM ACETERNITY COMPONENTS
// -------------------------------------------------------------

export const TiltCard = ({ children, className = '', style = {}, onClick }) => {
  const ref = useRef(null);
  const [hasInputFocus, setHasInputFocus] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e) => {
    if (hasInputFocus) return;
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 300, damping: 24 } }}
      style={{
        ...style,
        perspective: 1000,
        rotateX: hasInputFocus ? 0 : rotateX,
        rotateY: hasInputFocus ? 0 : rotateY,
        transformStyle: hasInputFocus ? 'flat' : 'preserve-3d',
        cursor: onClick ? 'pointer' : 'default'
      }}
      className={`card ${className}`}
      onClick={onClick}
    >
      <div 
        style={{ transform: hasInputFocus ? 'translateZ(0)' : 'translateZ(20px)', transition: 'transform 0.3s' }}
        onFocus={(e) => {
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            setHasInputFocus(true);
            x.set(0); y.set(0);
          }
        }}
        onBlur={() => setHasInputFocus(false)}
      >
        {children}
      </div>
    </motion.div>
  );
};

// GSAP Hacker Text Decoder for AI output
export const NeuralDecodeText = ({ text, className = '' }) => {
  const textRef = useRef(null);

  useEffect(() => {
    if (!textRef.current || !text) return;
    if (!window.gsap) return;
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    const originalText = text;
    
    const obj = { value: 0 };
    
    window.gsap.to(obj, {
      value: originalText.length,
      duration: Math.min(originalText.length * 0.02, 1.5),
      ease: "power2.out",
      onUpdate: () => {
        const progress = Math.floor(obj.value);
        let currentText = '';
        
        for (let i = 0; i < originalText.length; i++) {
          if (i < progress) {
            currentText += originalText[i];
          } else if (originalText[i] === ' ') {
            currentText += ' ';
          } else {
            currentText += chars[Math.floor(Math.random() * chars.length)];
          }
        }
        
        if (textRef.current) {
          textRef.current.innerText = currentText;
        }
      }
    });
  }, [text]);

  return <span ref={textRef} className={className}>{text}</span>;
};

// Advanced Magnetic Button Interaction
export const MagneticButton = ({ children, className = '', onClick, disabled, style = {}, type = "button" }) => {
  const buttonRef = useRef(null);
  
  const handleMouseMove = (e) => {
    if (disabled || !buttonRef.current || !window.gsap) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const h = rect.width / 2;
    const v = rect.height / 2;
    const x = e.clientX - rect.left - h;
    const y = e.clientY - rect.top - v;

    window.gsap.to(buttonRef.current, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.4,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = () => {
    if (!buttonRef.current || !window.gsap) return;
    window.gsap.to(buttonRef.current, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: 'elastic.out(1, 0.3)'
    });
  };

  return (
    <div style={{ display: 'inline-block', perspective: '800px', width: style.width }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <button ref={buttonRef} type={type} className={className} onClick={onClick} disabled={disabled} style={{ ...style, willChange: 'transform' }}>
        {children}
      </button>
    </div>
  );
};

// Neural Card with hover light sweep
export const AnimatedCard = ({ children, className = '', style = {}, onClick }) => {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={onClick ? { y: -4, scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`card ${className}`}
      style={{ ...style, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <div 
        className="card-volumetric-light" 
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: `radial-gradient(circle 250px at ${mousePos.x}px ${mousePos.y}px, hsla(190, 100%, 55%, 0.15), transparent 100%)`,
          pointerEvents: 'none',
          zIndex: 0,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s'
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </motion.div>
  );
};
