function toggleNav() {
  document.querySelector(".navbar").classList.toggle("nav-open");
  document.body.classList.toggle("nav-open");
}

function fecharNav() {
  document.querySelector(".navbar").classList.remove("nav-open");
  document.body.classList.remove("nav-open");
}

function copiarTexto(texto, nomeServidor) {
  navigator.clipboard.writeText(texto).then(() => {
    mostrarToast(`📋 IP de ${nomeServidor} copiado!`);
    tocarEfeitoNether();
  }).catch(() => {
    mostrarToast(`📋 IP: ${texto}`);
    tocarEfeitoNether();
  });
}

function tocarEfeitoNether() {
  const overlay = document.getElementById("portal-overlay");
  if (overlay) {
    overlay.classList.remove("portal-overlay-anim");
    void overlay.offsetWidth;
    overlay.classList.add("portal-overlay-anim");
  }

  criarParticulasNether();

  
}

function criarParticulasNether() {
  const container = document.getElementById("portal-overlay");
  if (!container) return;

  const chars = ["✦", "✧", "✦", "✧", "✦", "✧", "✦", "✧"];
  const colors = ["#b060ff", "#c080ff", "#d4af37", "#e0b0ff", "#ffd700"];

  for (let i = 0; i < 16; i++) {
    const span = document.createElement("span");
    span.textContent = chars[i % chars.length];
    span.style.cssText = [
      "position:fixed",
      "z-index:10000",
      "pointer-events:none",
      "font-size:" + (14 + Math.random() * 16) + "px",
      "color:" + colors[Math.floor(Math.random() * colors.length)],
      "text-shadow:0 0 10px currentColor",
      "left:50%",
      "top:50%",
      "transform:translate(-50%,-50%)",
      "transition:all .7s cubic-bezier(.25,.46,.45,.94)",
      "opacity:0"
    ].join(";");
    container.parentElement.appendChild(span);

    const angle = Math.random() * Math.PI * 2;
    const dist = 100 + Math.random() * 200;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;

    requestAnimationFrame(function() {
      span.style.opacity = "1";
      span.style.transform = "translate(calc(-50% + " + dx + "px),calc(-50% + " + dy + "px)) rotate(" + (Math.random() * 720 - 360) + "deg)";
    });

    setTimeout(function() {
      span.remove();
    }, 750);
  }
}

(function () {
  const heroSection = document.getElementById("inicio");
  if (!heroSection) return;

  const canvas = document.getElementById("hero-particles");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const lightingEl = heroSection.querySelector(".hero-lighting");

  let w = 0, h = 0;
  let targetMX = 0, targetMY = 0, currentMX = 0, currentMY = 0;
  let particles = [];
  let rafId = null;
  let running = false;
  const PARTICLE_COUNT = 55;

  const COLORS = [
    "rgba(170,0,255,", "rgba(200,100,255,", "rgba(255,180,50,",
    "rgba(255,215,0,", "rgba(180,120,255,", "rgba(255,255,255,"
  ];

  function resize() {
    const rect = heroSection.getBoundingClientRect();
    w = canvas.width = rect.width;
    h = canvas.height = rect.height;
  }

  function createParticle() {
    const isWarm = Math.random() > 0.45;
    const baseColor = isWarm ? COLORS[2] : COLORS[0];
    const isBright = Math.random() > 0.7;
    const maxR = isBright ? 3.5 : 1.6;
    const maxAlpha = isBright ? 0.55 : 0.3;
    const baseAlpha = Math.random() * (maxAlpha - 0.1) + 0.1;

    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      r: Math.random() * maxR + 0.4,
      alpha: baseAlpha,
      color: baseColor,
      phase: Math.random() * Math.PI * 2,
      speed: 0.002 + Math.random() * 0.003,
      bright: isBright
    };
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }
  }

  function drawParticles(t) {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      const flicker = 0.7 + 0.3 * Math.sin(t * p.speed + p.phase);
      const a = p.alpha * flicker;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.1, p.r), 0, Math.PI * 2);
      ctx.fillStyle = p.color + a + ")";
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;
    }
  }

  function updateParallax() {
    currentMX += (targetMX - currentMX) * 0.06;
    currentMY += (targetMY - currentMY) * 0.06;
    if (lightingEl) {
      lightingEl.style.transform = `translate(${currentMX * 6}px,${currentMY * 6}px)`;
    }
  }

  function animate(t) {
    if (!running) return;
    drawParticles(t);
    updateParallax();
    rafId = requestAnimationFrame(animate);
  }

  function start() {
    if (running) return;
    running = true;
    resize();
    initParticles();
    rafId = requestAnimationFrame(animate);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  document.addEventListener("mousemove", function (e) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    targetMX = (e.clientX - cx) / cx;
    targetMY = (e.clientY - cy) / cy;
  });

  const observer = new IntersectionObserver(function (entries) {
    for (const entry of entries) {
      if (entry.isIntersecting) start();
      else stop();
    }
  }, { threshold: 0 });

  observer.observe(heroSection);

  window.addEventListener("resize", function () {
    resize();
    initParticles();
  });
})();
