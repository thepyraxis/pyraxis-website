// ============================================
// CUSTOM CURSOR ENGINE
// ============================================
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

// Prevent interactions on touch devices globally for certain effects
if (isTouchDevice) {
    document.documentElement.classList.add('touch-device');
}

const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');

let mx = 0, my = 0;
let rx = 0, ry = 0;
let targetScale = 1;
let currentScale = 1;
let isHovering = false;
let mouseInitialized = false;

if (cursor && ring) {
    cursor.style.left = '0px';
    cursor.style.top = '0px';
    ring.style.left = '0px';
    ring.style.top = '0px';
}

document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    mouseInitialized = true;
}, { passive: true });

function animateCursor() {
    if (!mouseInitialized) { requestAnimationFrame(animateCursor); return; } // Prevent initial jump
    if (!cursor || !ring) return;

    const dotScale = isHovering ? 2 : 1;
    cursor.style.transform = `translate3d(${mx - 4}px, ${my - 4}px, 0) scale(${dotScale})`;

    const LERP = 0.28;
    rx += (mx - rx) * LERP;
    ry += (my - ry) * LERP;

    if (!isHovering) {
        const dx = mx - rx;
        const dy = my - ry;
        const velocity = Math.min(Math.sqrt(dx * dx + dy * dy) / 300, 0.2);
        targetScale = 1 + velocity;
    }

    currentScale += (targetScale - currentScale) * 0.16;
    ring.style.transform = `translate3d(${rx - 16}px, ${ry - 16}px, 0) scale(${currentScale})`;

    requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button, .service-card, .process-step').forEach(el => {
    el.addEventListener('mouseenter', () => {
        isHovering = true;
        targetScale = 1.6;
        if (ring) {
            ring.style.borderColor = 'rgba(88, 0, 208, 0.8)';
            ring.style.background = 'rgba(88, 0, 208, 0.12)';
            ring.style.boxShadow = '0 0 24px rgba(88, 0, 208, 0.3)';
        }
    });
    el.addEventListener('mouseleave', () => {
        isHovering = false;
        targetScale = 1;
        if (ring) {
            ring.style.borderColor = 'rgba(109, 40, 217, 0.35)';
            ring.style.background = 'rgba(109, 40, 217, 0.05)';
            ring.style.boxShadow = '0 0 10px rgba(109, 40, 217, 0.1)';
        }
    });
});

// ============================================
// MAGNETIC BUTTONS
// ============================================
const magneticElements = document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta, .pill');
magneticElements.forEach(el => {
    if (isTouchDevice) return;
    if (!el.dataset.magnetic) {
        el.dataset.magnetic = 'true';
        el.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    }
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const strength = el.classList.contains('pill') ? 0.1 : 0.12;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px) scale(1.02)`;
    });
    el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0px, 0px) scale(1)';
    });
});

// ============================================
// SMOOTH SCROLL
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const id = this.getAttribute('href');
        if (id === '#') return;
        const target = document.querySelector(id);
        if (target) {
            e.preventDefault();
            const nav = document.getElementById('nav');
            const navHeight = nav ? nav.offsetHeight : 80;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
    });
});

// ============================================
// PARTICLE CANVAS — HERO BACKGROUND
// ============================================
const canvas = document.getElementById('particlesCanvas');
const parallaxLayers = document.querySelectorAll('.background-layer');
let heroSectionEl = document.getElementById('heroSection');
let canvasActive = true;

if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const totalParticleCount = 80;

    class Particle {
        constructor() { this.init(); }
        init() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            const typeRoll = Math.random();
            if (typeRoll < 0.08) {
                this.type = 'fastPurple';
                this.color = '139, 92, 246';
                this.size = Math.random() * 0.6 + 0.4;
                this.opacity = Math.random() * 0.2 + 0.8;
                this.vx = (Math.random() - 0.5) * 0.8;
                this.vy = (Math.random() - 0.5) * 0.8;
                this.twinkleSpeed = Math.random() * 0.08 + 0.03;
            } else if (typeRoll < 0.25) {
                this.type = 'white';
                this.color = '255, 255, 255';
                this.size = Math.random() * 0.4 + 0.2;
                this.opacity = Math.random() * 0.3 + 0.5;
                this.vx = (Math.random() - 0.5) * 0.15;
                this.vy = (Math.random() - 0.5) * 0.15;
                this.twinkleSpeed = Math.random() * 0.03 + 0.01;
            } else {
                this.type = 'normal';
                const colorShift = Math.random() > 0.8 ? '109, 40, 217' : '139, 92, 246';
                this.color = colorShift;
                this.size = Math.random() * 0.8 + 0.4;
                this.opacity = Math.random() * 0.3 + 0.5;
                this.vx = (Math.random() - 0.5) * 0.15;
                this.vy = (Math.random() - 0.5) * 0.15;
                this.twinkleSpeed = Math.random() * 0.03 + 0.01;
            }
            this.twinklePhase = Math.random() * Math.PI * 2;
        }
        update(mouseX, mouseY) {
            this.x += this.vx;
            this.y += this.vy;
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const forceRadius = 120;
            if (distance < forceRadius && distance > 0) {
                const force = (forceRadius - distance) / forceRadius;
                this.x += (dx / distance) * force * 0.4;
                this.y += (dy / distance) * force * 0.4;
            }
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
            this.twinklePhase += this.twinkleSpeed;
        }
        draw(pulse) {
            const twinkle = Math.sin(this.twinklePhase) * 0.5 + 0.5;
            let alpha = this.opacity * (0.6 + pulse * 0.2 + twinkle * 0.2);
            if (this.type === 'fastPurple') {
                alpha = this.opacity * (0.8 + pulse * 0.1 + twinkle * 0.1);
            }
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${alpha})`;
            ctx.fill();
            if (this.type === 'normal' && alpha > 0.5) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
                ctx.fill();
            }
        }
    }

    function initBackground() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = Array.from({ length: totalParticleCount }, () => new Particle());
    }

    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            canvasActive = entry.isIntersecting;
        });
    }, { threshold: 0 });
    if (heroSectionEl) heroObserver.observe(heroSectionEl);

    function animateBackground() {
        if (!canvasActive) {
            requestAnimationFrame(animateBackground);
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const pulse = (Math.sin(Date.now() / 3000) * 0.5 + 0.5);
        const mouseRelX = (mx - window.innerWidth / 2);
        const mouseRelY = (my - window.innerHeight / 2);

        parallaxLayers.forEach(layer => {
            if (!layer.classList.contains('layer-glow')) {
                const speed = parseFloat(layer.getAttribute('data-speed') || 0) * 0.3;
                layer.style.transform = `translate(${mouseRelX * speed}px, ${mouseRelY * speed}px)`;
            }
        });

        particles.forEach(p => {
            p.update(mx, my);
            p.draw(pulse);
        });
        requestAnimationFrame(animateBackground);
    }

    window.addEventListener('resize', initBackground);
    initBackground();
    animateBackground();
}

// ============================================
// MOBILE NAVIGATION
// ============================================
const toggle = document.querySelector('.mobile-nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        navLinks.classList.toggle('open');
        document.body.classList.toggle('no-scroll');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.classList.remove('no-scroll');
        });
    });
}

// ============================================
// NAV SCROLL STATE
// ============================================
const navEl = document.getElementById('nav');
let scrollTicking = false;
window.addEventListener('scroll', () => {
    if (!scrollTicking) {
        requestAnimationFrame(() => {
            if (navEl) navEl.classList.toggle('scrolled', window.scrollY > 60);
            scrollTicking = false;
        });
        scrollTicking = true;
    }
}, { passive: true });

// ============================================
// INTERSECTION OBSERVER — REVEAL ANIMATIONS
// ============================================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ============================================
// SYSTEM GRID MOUSE GLOW
// ============================================
document.querySelectorAll('.system-step, .process-step, .pill').forEach(step => {
    step.addEventListener('mousemove', e => {
        const rect = step.getBoundingClientRect();
        step.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
        step.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
    });
});

// Premium 3D Interaction for Engine Catalogue
document.querySelectorAll('.engine-stage').forEach(card => {
    if (isTouchDevice) return;

    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        card.style.setProperty('--rx', `${(y - 0.5) * -12}deg`);
        card.style.setProperty('--ry', `${(x - 0.5) * 12}deg`);
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
    });
});

// ============================================
// LOGO EROSION CANVAS — SIGNATURE ANIMATION
// ============================================
const logoCanvas = document.getElementById('logoErosionCanvas');

if (logoCanvas) {
    const lctx = logoCanvas.getContext('2d', { willReadFrequently: true });
    const logoImg = new Image();
    logoImg.src = 'pyr/logo/Picsart_26-05-30_00-55-59-918.png';

    let logoData = null;
    let logoParticles = [];
    const MAX_LOGO_PARTICLES = 100;

    class ErosionParticle {
        constructor(x, y, color) {
            this.x = x; this.y = y; this.color = color;
            this.vx = (Math.random() * -1.0) - 0.4;
            this.vy = (Math.random() * -0.8) - 1.2;
            this.size = Math.random() * 1.5 + 0.5;
            this.life = 1.0;
            this.decay = Math.random() * 0.008 + 0.003;
        }
        update() { this.x += this.vx; this.y += this.vy; this.life -= this.decay; }
        draw() {
            lctx.fillStyle = this.color.replace('rgb', 'rgba').replace(')', `, ${this.life})`);
            lctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }

    logoImg.onload = () => {
        logoCanvas.width = 800; logoCanvas.height = 800;
        const offscreen = document.createElement('canvas');
        offscreen.width = logoCanvas.width; offscreen.height = logoCanvas.height;
        const octx = offscreen.getContext('2d');
        const scale = Math.min(logoCanvas.width / logoImg.width, logoCanvas.height / logoImg.height) * 0.8;
        const x = (logoCanvas.width - logoImg.width * scale) / 2;
        const y = (logoCanvas.height - logoImg.height * scale) / 2;
        octx.drawImage(logoImg, x, y, logoImg.width * scale, logoImg.height * scale);
        logoData = octx.getImageData(0, 0, logoCanvas.width, logoCanvas.height);
        animateLogo();
    };
    logoImg.onerror = () => {
        console.warn('Logo image failed to load. Erosion effect disabled.');
        if (logoCanvas) logoCanvas.style.display = 'none';
    };

    function animateLogo() {
        if (!canvasActive) { requestAnimationFrame(animateLogo); return; }

        const rect = logoCanvas.getBoundingClientRect();
        const canvasMX = (mx - rect.left) * (logoCanvas.width / rect.width);
        const canvasMY = (my - rect.top) * (logoCanvas.height / rect.height);
        const logoScale = Math.min(logoCanvas.width / logoImg.width, logoCanvas.height / logoImg.height) * 0.8;

        if (!isTouchDevice && mouseInitialized && canvasMX > 0 && canvasMX < logoCanvas.width && canvasMY > 0 && canvasMY < logoCanvas.height) {
            lctx.clearRect(0, 0, logoCanvas.width, logoCanvas.height);
            lctx.drawImage(logoImg, (logoCanvas.width - logoImg.width * logoScale) / 2, (logoCanvas.height - logoImg.height * logoScale) / 2, logoImg.width * logoScale, logoImg.height * logoScale);
            
            lctx.save();
            lctx.globalCompositeOperation = 'source-atop';
            const energyGlow = lctx.createRadialGradient(canvasMX, canvasMY, 0, canvasMX, canvasMY, 65);
            energyGlow.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            energyGlow.addColorStop(0.5, 'rgba(139, 92, 246, 0.25)');
            energyGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            lctx.fillStyle = energyGlow; lctx.fillRect(0, 0, logoCanvas.width, logoCanvas.height);
            lctx.restore();

            for (let i = 0; i < 3; i++) {
                if (logoParticles.length < MAX_LOGO_PARTICLES && logoData) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = Math.random() * 65;
                    const px = Math.floor(canvasMX + Math.cos(angle) * dist);
                    const py = Math.floor(canvasMY + Math.sin(angle) * dist);
                    if (px >= 0 && px < logoCanvas.width && py >= 0 && py < logoCanvas.height) {
                        const index = (py * logoCanvas.width + px) * 4;
                        if (logoData.data[index + 3] > 100) {
                            logoParticles.push(new ErosionParticle(px, py, `rgb(${logoData.data[index]},${logoData.data[index+1]},${logoData.data[index+2]})`));
                        }
                    }
                }
            }

            for (let i = logoParticles.length - 1; i >= 0; i--) {
                logoParticles[i].update();
                if (logoParticles[i].life <= 0) logoParticles.splice(i, 1); else logoParticles[i].draw();
            }
        } else {
            // Static draw for mobile or idle to save CPU
            if (logoParticles.length === 0) {
                 lctx.clearRect(0, 0, logoCanvas.width, logoCanvas.height);
                 lctx.drawImage(logoImg, (logoCanvas.width - logoImg.width * logoScale) / 2, (logoCanvas.height - logoImg.height * logoScale) / 2, logoImg.width * logoScale, logoImg.height * logoScale);
            }
        }
        requestAnimationFrame(animateLogo);
    }
}