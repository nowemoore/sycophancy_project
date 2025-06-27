import React, { useEffect, useRef } from 'react';

const Background = () => {
    const canvasRef = useRef(null);
    const animationIdRef = useRef(null);
    const particlesRef = useRef([]);
    const mouseRef = useRef({ x: 0, y: 0 });
    const scrollRef = useRef(0);
    const lastScrollRef = useRef(0);

    const config = {
        particleCount: 150,
        connectionDistance: 120,
        mouseInfluence: 150,
        scrollMultiplier: 1.2, // Increased for more scroll response
        baseSpeed: 0.08, // Much slower base movement
        glowIntensity: 0.8,
        scrollVelocityMultiplier: 0.5, // New: for scroll velocity effects
        naturalDrift: 0.02 // Very slow natural movement
    };

    // eslint-disable-next-line 
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Initialize canvas size
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Recreate particles when canvas resizes
            if (particlesRef.current.length === 0) {
                createParticles();
            }
        };
        
        // Create particles with initial positions based on scroll
        const createParticles = () => {
            particlesRef.current = [];
            for (let i = 0; i < config.particleCount; i++) {
                const baseX = Math.random() * canvas.width;
                const baseY = Math.random() * canvas.height;
                particlesRef.current.push({
                    x: baseX,
                    y: baseY,
                    baseX: baseX, // Fixed base position
                    baseY: baseY, // Fixed base position
                    vx: (Math.random() - 0.5) * 0.2, // Increased drift velocity
                    vy: (Math.random() - 0.5) * 0.2, // Increased drift velocity
                    size: Math.random() * 2 + 1,
                    opacity: Math.random() * 0.3 + 0.1,
                    hue: Math.random() * 60 + 290, // Magenta to teal color range
                    glowRadius: 0,
                    scrollOffset: Math.random() * 0.5 + 0.3 // Individual scroll sensitivity
                });
            }
        };

        // Update particles
        const updateParticles = () => {
            const scrollDelta = scrollRef.current - lastScrollRef.current;
            lastScrollRef.current = scrollRef.current;

            particlesRef.current.forEach(particle => {
                // Very slow natural drift of base positions with smoothing
                particle.baseX += particle.vx;
                particle.baseY += particle.vy;
                
                // Enhanced scroll-based movement
                const scrollInfluence = scrollRef.current * config.scrollMultiplier * particle.scrollOffset;
                const scrollVelocity = scrollDelta * config.scrollVelocityMultiplier;
                
                // Apply scroll effects to position (relative to base position)
                particle.x = particle.baseX + Math.sin(scrollInfluence * 0.01) * 30;
                particle.y = particle.baseY + scrollInfluence * 0.3 + scrollVelocity * 0.1;
                
                // Add some horizontal drift based on scroll
                particle.x += Math.cos(scrollInfluence * 0.005) * 20;
                
                // Mouse interaction (unchanged but works with new positioning)
                const dx = mouseRef.current.x - particle.x;
                const dy = mouseRef.current.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < config.mouseInfluence) {
                    const force = (config.mouseInfluence - distance) / config.mouseInfluence;
                    const angle = Math.atan2(dy, dx);
                    
                    // Temporary mouse effect on display position only
                    particle.x += Math.cos(angle) * force * 2;
                    particle.y += Math.sin(angle) * force * 2;
                    
                    particle.glowRadius = force * 15;
                    particle.opacity = Math.min(0.8, particle.opacity + force * 0.2);
                } else {
                    particle.glowRadius *= 0.85; // Faster fade out (was 0.95)
                    particle.opacity = Math.max(0.1, particle.opacity * 0.99); // Faster opacity fade (was 0.995)
                }
                
                // Boundary wrapping for base positions with very slow drift
                if (particle.baseX < -50) particle.baseX = canvas.width + 50;
                if (particle.baseX > canvas.width + 50) particle.baseX = -50;
                if (particle.baseY < -50) particle.baseY = canvas.height + 50;
                if (particle.baseY > canvas.height + 50) particle.baseY = -50;
            });
        };

        // Draw connections with scroll-aware opacity
        const drawConnections = () => {
            const scrollFactor = Math.abs(scrollRef.current - lastScrollRef.current) * 0.1;
            const baseOpacity = Math.max(0.05, 0.15 - scrollFactor);
            
            for (let i = 0; i < particlesRef.current.length; i++) {
                for (let j = i + 1; j < particlesRef.current.length; j++) {
                    const dx = particlesRef.current[i].x - particlesRef.current[j].x;
                    const dy = particlesRef.current[i].y - particlesRef.current[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < config.connectionDistance) {
                        const opacity = (1 - (distance / config.connectionDistance)) * baseOpacity;
                        ctx.strokeStyle = `hsla(320, 70%, 60%, ${opacity})`; // Magenta connections
                        ctx.lineWidth = 0.5;
                        
                        ctx.beginPath();
                        ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y);
                        ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y);
                        ctx.stroke();
                    }
                }
            }
        };

        // Draw particles (unchanged)
        const drawParticles = () => {
            particlesRef.current.forEach(particle => {
                // Draw glow effect
                if (particle.glowRadius > 0) {
                    const gradient = ctx.createRadialGradient(
                        particle.x, particle.y, 0,
                        particle.x, particle.y, particle.glowRadius
                    );
                    gradient.addColorStop(0, `hsla(${particle.hue}, 70%, 60%, ${config.glowIntensity})`);
                    gradient.addColorStop(1, `hsla(${particle.hue}, 70%, 60%, 0)`);
                    
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.glowRadius, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Draw particle
                ctx.fillStyle = `hsla(320, 10%, 95%, ${particle.opacity})`;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            updateParticles();
            drawConnections();
            drawParticles();
            
            animationIdRef.current = requestAnimationFrame(animate);
        };

        // Event handlers
        const handleMouseMove = (e) => {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;
        };

        const handleScroll = () => {
            scrollRef.current = window.scrollY;
        };

        const handleMouseLeave = () => {
            // Reset particles to base positions when mouse leaves
            particlesRef.current.forEach(particle => {
                particle.glowRadius = 0;
            });
        };

        // Initialize
        resize();
        createParticles();
        animate();

        // Add event listeners
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mouseleave', handleMouseLeave);

        // Cleanup
        return () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [config.connectionDistance, config.glowIntensity, config.mouseInfluence, config.particleCount, config.scrollMultiplier, config.scrollVelocityMultiplier]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'none'
            }}
        />
    );
};

export default Background;