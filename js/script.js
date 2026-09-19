(() => {
  "use strict";

  /* ============================================================
     1. LENIS SMOOTH SCROLLING & GSAP INTEGRATION
     ============================================================ */
  let lenis;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
      prevent: (node) => {
        if (!node) return false;
        return (
          node.hasAttribute?.("data-lenis-prevent") ||
          (node.closest && node.closest("[data-lenis-prevent]")) ||
          (node.closest && node.closest(".service-modal-overlay")) ||
          (node.closest && node.closest(".service-modal-container")) ||
          (node.closest && node.closest(".faq-chat-window")) ||
          (node.closest && node.closest(".faq-chat-body"))
        );
      }
    });

    // Sync Lenis with GSAP ScrollTrigger
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  /* ============================================================
     2. NAVBAR TOGGLE & SCROLL STATE
     ============================================================ */
  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  const setNavState = () => {
    if (navbar) {
      navbar.classList.toggle("is-scrolled", window.scrollY > 12);
    }
  };
  setNavState();
  window.addEventListener("scroll", setNavState, { passive: true });

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ============================================================
     3. AMBIENT BACKGROUND PARTICLE CANVAS
     ============================================================ */
  const bgCanvas = document.getElementById("bgCanvas");
  if (bgCanvas) {
    const bgCtx = bgCanvas.getContext("2d");
    let particles = [];
    const particleCount = 45;

    function resizeBgCanvas() {
      bgCanvas.width = window.innerWidth;
      bgCanvas.height = window.innerHeight;
    }
    resizeBgCanvas();
    window.addEventListener("resize", resizeBgCanvas);

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * bgCanvas.width;
        this.y = Math.random() * bgCanvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.alpha = Math.random() * 0.4 + 0.1;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > bgCanvas.width || this.y < 0 || this.y > bgCanvas.height) {
          this.reset();
        }
      }
      draw() {
        bgCtx.beginPath();
        bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        bgCtx.fillStyle = `rgba(95, 214, 255, ${this.alpha})`;
        bgCtx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animateBg() {
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animateBg);
    }
    animateBg();
  }

  /* ============================================================
     4. CINEMATIC 3D HERO FRAME SEQUENCE CANVAS
     ============================================================ */
  const FRAME_COUNT = 50;
  const FRAME_PATH = (i) => `assets/frames/ezgif-frame-${String(i).padStart(3, "0")}.jpg`;

  const hero = document.getElementById("hero");
  const heroCanvas = document.getElementById("heroCanvas");
  const progressFill = document.getElementById("progressFill");
  const heroIndexEl = document.getElementById("heroIndex");
  const heroContent = document.querySelector(".hero-content");
  const scrollCue = document.querySelector(".scroll-cue");

  if (hero && heroCanvas) {
    const ctx = heroCanvas.getContext("2d");
    const frames = [];
    let currentFrame = 0;

    function preloadFrames() {
      for (let i = 1; i <= FRAME_COUNT; i++) {
        const img = new Image();
        img.decoding = "async";
        img.src = FRAME_PATH(i);
        img.onload = () => {
          if (i === 1) drawFrame(0);
        };
        frames.push(img);
      }
    }

    function resizeHeroCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = heroCanvas.getBoundingClientRect();
      heroCanvas.width = Math.round(rect.width * dpr);
      heroCanvas.height = Math.round(rect.height * dpr);
      drawFrame(currentFrame, true);
    }

    function drawFrame(index, force) {
      const img = frames[index];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      if (!force && index === drawFrame._last) return;
      drawFrame._last = index;

      const cw = heroCanvas.width;
      const ch = heroCanvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;

      const scale = Math.max(cw / iw, ch / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    function getHeroProgress() {
      const rect = hero.getBoundingClientRect();
      const total = hero.offsetHeight - window.innerHeight;
      if (total <= 0) return 0;
      const scrolled = -rect.top;
      return Math.min(Math.max(scrolled / total, 0), 1);
    }

    function updateHero() {
      const progress = getHeroProgress();
      const targetFrame = Math.round(progress * (FRAME_COUNT - 1));
      currentFrame = targetFrame;
      drawFrame(currentFrame);

      if (progressFill) progressFill.style.height = `${progress * 100}%`;
      if (heroIndexEl) heroIndexEl.textContent = `${String(currentFrame + 1).padStart(2, "0")} / ${FRAME_COUNT}`;

      const fadeEnd = 0.25;
      const fadeT = Math.min(progress / fadeEnd, 1);
      const eased = 1 - Math.pow(1 - fadeT, 3);
      if (heroContent) {
        heroContent.style.opacity = String(1 - eased);
        heroContent.style.transform = `translateY(${eased * -24}px)`;
      }
      if (scrollCue) {
        scrollCue.style.opacity = String(1 - Math.min(progress / 0.1, 1));
      }
    }

    window.addEventListener("scroll", updateHero, { passive: true });
    window.addEventListener("resize", () => {
      resizeHeroCanvas();
      updateHero();
    });

    preloadFrames();
    requestAnimationFrame(() => {
      resizeHeroCanvas();
      updateHero();
    });
  }

  /* ============================================================
     5. THE PILLARS STANDARD — 3D PARALLAX & CARDS INTERACTION
     ============================================================ */
  const pillarsStandardSection = document.getElementById("about");
  const skylineCards = [
    document.getElementById("skylineCard1"),
    document.getElementById("skylineCard2"),
    document.getElementById("skylineCard3"),
    document.getElementById("skylineCard4")
  ].filter(Boolean);

  if (pillarsStandardSection && skylineCards.length > 0) {
    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    let isHovering = false;

    pillarsStandardSection.addEventListener("mousemove", (e) => {
      const rect = pillarsStandardSection.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseX = (x - rect.width / 2) / (rect.width / 2);
      mouseY = (y - rect.height / 2) / (rect.height / 2);
      isHovering = true;
    });

    pillarsStandardSection.addEventListener("mouseleave", () => {
      mouseX = 0;
      mouseY = 0;
      isHovering = false;
    });

    const depths = [14, 9, 16, 11];

    function animateSkylineParallax() {
      currentX += (mouseX - currentX) * 0.08;
      currentY += (mouseY - currentY) * 0.08;

      if (window.innerWidth > 1024) {
        if (isHovering || Math.abs(currentX) > 0.01 || Math.abs(currentY) > 0.01) {
          skylineCards.forEach((card, idx) => {
            const d = depths[idx] || 10;
            const tx = (currentX * d).toFixed(1);
            const ty = (currentY * d).toFixed(1);
            const rotX = (-currentY * 4).toFixed(1);
            const rotY = (currentX * 4).toFixed(1);
            card.style.transform = `translate3d(${tx}px, ${ty}px, ${d * 2}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
          });
        } else if (!isHovering) {
          skylineCards.forEach(card => {
            if (card.style.transform !== "") card.style.transform = "";
          });
        }
      }

      requestAnimationFrame(animateSkylineParallax);
    }
    animateSkylineParallax();

    // GSAP ScrollTrigger staggered entrance for cards
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.from(skylineCards, {
        opacity: 0,
        y: 40,
        scale: 0.94,
        stagger: 0.15,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: pillarsStandardSection,
          start: "top 75%",
          toggleActions: "play none none none"
        }
      });
    }
  }

  /* ============================================================
     6. SERVICES MODAL DRAWER SYSTEM FOR 6 SERVICE DESTINATIONS
     ============================================================ */
  const serviceData = {
    "meta-ads": {
      tag: "Performance Media & Analytics Pillar",
      title: "Meta Ads & Performance Analytics",
      overview: "Our algorithmic Meta ad scaling engine combines high-volume multi-variant creative testing, full-funnel Conversions API (CAPI) data modeling, and automated bid strategies to consistently achieve enterprise-grade ROAS.",
      deliverables: [
        "Dynamic Multi-Variant Ad Creatives (Video & Static)",
        "Conversions API (CAPI) & Pixel Setup",
        "Algorithmic Campaign Scaling & Budget Management",
        "Funnel Drop-Off Audit & Predictive Retargeting",
        "Real-Time ROAS & Attribution Telemetry Dashboard",
        "LTV & Cohort Retention Modeling"
      ],
      process: [
        { num: "01", title: "Data Telemetry Setup", desc: "First-party server-side tracking, CAPI setup, and custom event attribution." },
        { num: "02", title: "Creative Engine Testing", desc: "Deploying 15+ weekly ad variations across hooks, angles, and formats." },
        { num: "03", title: "Algorithmic Scale", desc: "Aggressively increasing spend on winning audience clusters while safeguarding unit economics." },
        { num: "04", title: "LTV & Payback Optimization", desc: "Optimizing for repeat customer purchases, high basket sizes, and shortened payback cycles." }
      ]
    },
    "business-eval": {
      tag: "Strategic Valuation Pillar",
      title: "Business Evaluation & Growth Valuation",
      overview: "Direct commercial and financial diagnostics for founders and executives. We audit your acquisition model, optimize your CAC/LTV payback ratios, assess your enterprise valuation multiple, and diagnose operational bottlenecks for rapid expansion.",
      deliverables: [
        "Comprehensive Funnel & Unit Economic Audit",
        "Enterprise Valuation & Multiple Appraisal",
        "CAC-to-LTV & Payback Period Modeling",
        "Revenue Leakage & Churn Diagnostics",
        "Investor-Ready Growth Model & Pitch Data Room",
        "90-Day Capital Allocation Roadmap"
      ],
      process: [
        { num: "01", title: "Commercial Due Diligence", desc: "Analyzing historical financials, cohort retention, customer acquisition costs, and churn metrics." },
        { num: "02", title: "Valuation & Bottleneck Diagnosis", desc: "Pinpointing margin leaks, pricing inefficiencies, and high-impact operational friction." },
        { num: "03", title: "Strategic Restructuring", desc: "Re-engineering unit economics, pricing tiers, and cash-flow conversion cycles." },
        { num: "04", title: "Scaling Execution & Governance", desc: "Continuous executive advisory to maintain target EBITDA and valuation growth." }
      ]
    },
    "social-marketing": {
      tag: "Content Dominance Pillar",
      title: "Social Media Marketing (SMM) & Viral Content",
      overview: "We turn social presence into an active, compounding customer acquisition funnel with high-frequency cinematic short-form video production across TikTok, Instagram Reels, and YouTube Shorts.",
      deliverables: [
        "Daily Scripting & Short-Form Video Editing",
        "Viral Category Hooks & Trend Forensics",
        "Omnichannel Distribution & Publishing Ops",
        "Community Management & Active Engagement",
        "Organic-to-Paid Ad Conversion Pipeline",
        "Weekly Cross-Platform Reach & Telemetry Reports"
      ],
      process: [
        { num: "01", title: "Content Blueprinting", desc: "Analyzing audience psychological triggers and viral category trends." },
        { num: "02", title: "Cinematic Production", desc: "High-end video editing with kinetic typography, motion graphics, and sound design." },
        { num: "03", title: "Omnichannel Syndication", desc: "Daily scheduled posting and engagement management across all major channels." },
        { num: "04", title: "Organic-to-Paid Amplification", desc: "Transforming top viral organic posts into high-converting paid ad assets." }
      ]
    },
    "brand-building": {
      tag: "Identity & Positioning Pillar",
      title: "Brand Building & Strategic Marketing",
      overview: "We construct enduring brand moats, high-status visual identities, and sharp market positioning that elevate your company above legacy competitors and command premium pricing.",
      deliverables: [
        "Core Brand Identity & Design System",
        "Strategic Positioning & Market Moat Analysis",
        "Category-Defining Narrative & Storytelling Playbook",
        "Omnichannel Visual Guidelines & Asset Kit",
        "High-Impact Launch Campaigns & PR Assets",
        "Buyer Persona Architecture & Messaging Matrix"
      ],
      process: [
        { num: "01", title: "Competitive Landscape Audit", desc: "Deconstructing competitor positioning and identifying uncontested market space." },
        { num: "02", title: "Identity Architecture", desc: "Crafting iconic visual systems, typography, color palettes, and digital touchpoints." },
        { num: "03", title: "Messaging Playbook", desc: "Defining high-converting value propositions for every buyer persona." },
        { num: "04", title: "Brand Ecosystem Rollout", desc: "Deploying the refreshed identity across web, social, sales collaterals, and advertising." }
      ]
    },
    "influencer-partnerships": {
      tag: "Creator Network Pillar",
      title: "Influencer Matchmaking & Brand Partnerships",
      overview: "Specialized creator-to-enterprise matchmaking. We represent and broker partnerships connecting individual high-performing influencers with top enterprise and blue-chip brands for multi-figure sponsorships, ambassadorships, and verified ROI activations.",
      deliverables: [
        "Targeted Creator-to-Brand Matchmaking",
        "Multi-Figure Sponsorship Contract Brokering",
        "Content Licensing & Whitelisting Rights",
        "End-to-End Campaign Coordination & Briefing",
        "Affiliate & High-Authority Ambassador Programs",
        "Sales Attribution & Reach Analytics Reports"
      ],
      process: [
        { num: "01", title: "Creator Vetting & Alignment", desc: "Auditing individual influencers for verified engagement, audience demographics, and brand safety." },
        { num: "02", title: "Enterprise Brand Pitching", desc: "Structuring tailored sponsorship proposals and negotiating high-value brand deals." },
        { num: "03", title: "Creative Production & Compliance", desc: "Managing content briefs, approval workflows, and whitelisted ad access." },
        { num: "04", title: "Attribution & Repeat Retainers", desc: "Tracking sales lift, ROI metrics, and converting one-off deals into recurring annual ambassadorships." }
      ]
    }
  };

  const serviceModalOverlay = document.getElementById("serviceModalOverlay");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalServiceTag = document.getElementById("modalServiceTag");
  const modalServiceTitle = document.getElementById("modalServiceTitle");
  const modalOverviewText = document.getElementById("modalOverviewText");
  const modalDeliverablesGrid = document.getElementById("modalDeliverablesGrid");
  const modalProcessList = document.getElementById("modalProcessList");

  function openServiceModal(serviceKey) {
    const data = serviceData[serviceKey];
    if (!data) return;

    if (modalServiceTag) modalServiceTag.textContent = data.tag;
    if (modalServiceTitle) modalServiceTitle.textContent = data.title;
    if (modalOverviewText) modalOverviewText.textContent = data.overview;

    if (modalDeliverablesGrid) {
      modalDeliverablesGrid.innerHTML = data.deliverables.map(item => `
        <div class="deliverable-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>${item}</span>
        </div>
      `).join("");
    }

    if (modalProcessList) {
      modalProcessList.innerHTML = data.process.map(step => `
        <div class="modal-process-step">
          <div class="modal-step-num">${step.num}</div>
          <div>
            <div style="font-weight: 700; color: var(--ink-100); font-size: 0.95rem;">${step.title}</div>
            <div style="font-size: 0.86rem; color: var(--ink-300); margin-top: 2px;">${step.desc}</div>
          </div>
        </div>
      `).join("");
    }

    if (serviceModalOverlay) {
      serviceModalOverlay.classList.add("is-active");
      serviceModalOverlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");
      if (lenis) lenis.stop();
      const container = serviceModalOverlay.querySelector(".service-modal-container");
      if (container) container.scrollTop = 0;
    }
  }

  function closeServiceModal() {
    if (serviceModalOverlay) {
      serviceModalOverlay.classList.remove("is-active");
      serviceModalOverlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
      if (lenis) lenis.start();
    }
  }

  // Direct scroll handler: scrolls the target element directly by wheel delta and cancels page scroll
  function bindDirectScroll(container) {
    if (!container) return;
    container.setAttribute("data-lenis-prevent", "");
    container.addEventListener("wheel", function (e) {
      e.stopPropagation();
      e.stopImmediatePropagation();
      this.scrollTop += e.deltaY;
      e.preventDefault();
    }, { passive: false });
  }

  const serviceModalContainer = document.getElementById("serviceModalContainer") || document.querySelector(".service-modal-container");
  bindDirectScroll(serviceModalContainer);

  document.querySelectorAll(".service-card").forEach(card => {
    card.addEventListener("click", () => {
      const key = card.getAttribute("data-service");
      openServiceModal(key);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeServiceModal);
  if (serviceModalOverlay) {
    serviceModalOverlay.addEventListener("click", (e) => {
      if (e.target === serviceModalOverlay) closeServiceModal();
    });
  }
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeServiceModal();
  });

  /* ============================================================
     7. LIVE PERFORMANCE DASHBOARD & Dynamic Chart Canvas
     ============================================================ */
  const dashChartCanvas = document.getElementById("dashChartCanvas");
  let activeTab = "all";

  const tabDatasets = {
    all: [1.8, 2.4, 2.9, 3.5, 4.1, 4.8],
    ads: [2.1, 2.8, 3.4, 4.0, 4.6, 5.2],
    eval: [12, 18, 24, 30, 36, 42],
    talent: [30, 60, 95, 120, 150, 185]
  };

  function renderDashboardChart() {
    if (!dashChartCanvas) return;
    const ctx = dashChartCanvas.getContext("2d");
    const rect = dashChartCanvas.parentElement.getBoundingClientRect();
    dashChartCanvas.width = rect.width;
    dashChartCanvas.height = rect.height;

    const cw = dashChartCanvas.width;
    const ch = dashChartCanvas.height;
    const data = tabDatasets[activeTab] || tabDatasets.all;

    ctx.clearRect(0, 0, cw, ch);

    // Gridlines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let y = 30; y < ch; y += 45) {
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(cw, y);
      ctx.stroke();
    }

    const maxVal = Math.max(...data) * 1.15;
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * (cw - 40) + 20;
      const y = ch - (val / maxVal) * (ch - 60) - 20;
      return { x, y };
    });

    // Draw Smooth Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const xc = (points[i].x + points[i - 1].x) / 2;
      const yc = (points[i].y + points[i - 1].y) / 2;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.strokeStyle = "#5fd6ff";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Fill Gradient under curve
    ctx.lineTo(points[points.length - 1].x, ch);
    ctx.lineTo(points[0].x, ch);
    ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, 0, 0, ch);
    fillGrad.addColorStop(0, "rgba(95, 214, 255, 0.25)");
    fillGrad.addColorStop(1, "rgba(95, 214, 255, 0.0)");
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // Data Points
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#f2a94e";
      ctx.fill();
      ctx.shadowColor = "#f2a94e";
      ctx.shadowBlur = 8;
    });
    ctx.shadowBlur = 0;
  }

  window.addEventListener("resize", renderDashboardChart);

  document.querySelectorAll(".dash-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".dash-tab-btn").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      activeTab = btn.getAttribute("data-tab");
      renderDashboardChart();
    });
  });

  renderDashboardChart();

  /* ============================================================
     8. DYNAMIC NUMBER COUNTERS ON SCROLL
     ============================================================ */
  function animateCounters() {
    const counterElements = document.querySelectorAll("[data-count]");
    counterElements.forEach(el => {
      const target = parseFloat(el.getAttribute("data-count"));
      const suffix = el.getAttribute("data-suffix") || "";
      const isDecimal = target % 1 !== 0;

      let start = 0;
      const duration = 1800;
      const stepTime = 20;
      const steps = duration / stepTime;
      const increment = target / steps;

      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          el.textContent = (isDecimal ? target.toFixed(1) : Math.round(target)) + suffix;
          clearInterval(timer);
        } else {
          el.textContent = (isDecimal ? start.toFixed(1) : Math.round(start)) + suffix;
        }
      }, stepTime);
    });
  }

  // Trigger counters when intro section is scrolled into view
  const aboutSec = document.getElementById("about");
  let countersTriggered = false;
  if (aboutSec) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !countersTriggered) {
        countersTriggered = true;
        animateCounters();
      }
    }, { threshold: 0.2 });
    observer.observe(aboutSec);
  }

  /* ============================================================
     9. TESTIMONIALS CAROUSEL SLIDER
     ============================================================ */
  const track = document.getElementById("testimonialTrack");
  const prevBtn = document.getElementById("prevSlideBtn");
  const nextBtn = document.getElementById("nextSlideBtn");
  let slideIndex = 0;

  function updateTestimonialSlider() {
    if (!track) return;
    const cards = track.children;
    if (cards.length === 0) return;
    const cardWidth = cards[0].offsetWidth + 30; // width + gap
    const maxIndex = cards.length - 1;
    if (slideIndex > maxIndex) slideIndex = 0;
    if (slideIndex < 0) slideIndex = maxIndex;

    track.style.transform = `translateX(-${slideIndex * cardWidth}px)`;
  }

  if (nextBtn) nextBtn.addEventListener("click", () => { slideIndex++; updateTestimonialSlider(); });
  if (prevBtn) prevBtn.addEventListener("click", () => { slideIndex--; updateTestimonialSlider(); });
  window.addEventListener("resize", updateTestimonialSlider);

  /* ============================================================
     10. AI FAQ ASSISTANT (FLOATING CORNER WIDGET)
     ============================================================ */
  const faqWidgetBtn = document.getElementById("faqWidgetBtn");
  const faqChatWindow = document.getElementById("faqChatWindow");
  const faqCloseBtn = document.getElementById("faqCloseBtn");
  const faqChatBody = document.getElementById("faqChatBody");
  const faqInput = document.getElementById("faqInput");
  const faqSendBtn = document.getElementById("faqSendBtn");
  const navFaqTrigger = document.getElementById("navFaqTrigger");

  const faqKnowledge = {
    "What services does Digital Pillars provide?": "Digital Pillars provides 5 core integrated disciplines: (1) Meta Ads & Performance Analytics, (2) Business Evaluation & Growth Valuation, (3) Social Media Marketing (SMM), (4) Brand Building & Strategic Marketing, and (5) Influencer Matchmaking & Enterprise Brand Partnerships.",
    "How fast do Meta Ads deliver ROI?": "Initial telemetry and creative testing deliver clear ROI signals within 7 to 14 days. Full algorithmic scaling is achieved within 30 to 45 days using our server-side CAPI data tracking and multi-variant creative pipelines.",
    "What is included in Business Evaluation?": "Our Business Evaluation & Growth Valuation covers comprehensive commercial audits, CAC/LTV payback modeling, enterprise valuation appraisal, margin leakage forensics, and investor-ready growth roadmap planning.",
    "How do you connect influencers to bigger brands?": "We act as a direct talent representation and matchmaking broker. We audit individual creators for verified engagement and demographics, then negotiate multi-figure sponsorship deals, long-term ambassadorships, and co-branded activations with leading enterprise and blue-chip brands.",
    "What is your Social Media Marketing approach?": "We produce high-frequency, cinematic short-form video hooks engineered for TikTok, Instagram Reels, and YouTube Shorts. We then bridge viral organic reach directly into high-converting paid ad assets."
  };

  function toggleFaqWindow(show) {
    if (!faqChatWindow) return;
    const isOpen = faqChatWindow.classList.contains("is-open");
    const targetState = show !== undefined ? show : !isOpen;

    if (targetState) {
      faqChatWindow.classList.add("is-open");
      faqChatWindow.setAttribute("aria-hidden", "false");
      if (faqInput) faqInput.focus();
    } else {
      faqChatWindow.classList.remove("is-open");
      faqChatWindow.setAttribute("aria-hidden", "true");
      if (lenis && (!serviceModalOverlay || !serviceModalOverlay.classList.contains("is-active"))) {
        lenis.start();
      }
    }
  }

  // Prevent parent scroll chaining & Lenis hijacking on Chatbot
  if (faqChatWindow) {
    faqChatWindow.setAttribute("data-lenis-prevent", "");
    faqChatWindow.addEventListener("mouseenter", () => {
      if (lenis) lenis.stop();
    });
    faqChatWindow.addEventListener("mouseleave", () => {
      if (lenis && (!serviceModalOverlay || !serviceModalOverlay.classList.contains("is-active"))) {
        lenis.start();
      }
    });
    faqChatWindow.addEventListener("wheel", (e) => {
      e.stopPropagation();
    }, { passive: true });
    faqChatWindow.addEventListener("touchmove", (e) => {
      e.stopPropagation();
    }, { passive: true });
  }

  bindDirectScroll(faqChatBody);

  if (faqWidgetBtn) faqWidgetBtn.addEventListener("click", () => toggleFaqWindow());
  if (faqCloseBtn) faqCloseBtn.addEventListener("click", () => toggleFaqWindow(false));
  if (navFaqTrigger) navFaqTrigger.addEventListener("click", (e) => {
    e.preventDefault();
    toggleFaqWindow(true);
  });

  function appendFaqMessage(sender, text) {
    if (!faqChatBody) return;
    const msgEl = document.createElement("div");
    msgEl.className = `faq-msg ${sender === "user" ? "faq-msg-user" : "faq-msg-ai"}`;
    msgEl.textContent = text;
    faqChatBody.appendChild(msgEl);
    faqChatBody.scrollTop = faqChatBody.scrollHeight;
  }

  function handleFaqSubmit(questionText) {
    const q = questionText || (faqInput ? faqInput.value.trim() : "");
    if (!q) return;

    appendFaqMessage("user", q);
    if (faqInput) faqInput.value = "";

    // Simulate AI thinking and typing
    setTimeout(() => {
      const answer = faqKnowledge[q] || `Regarding "${q}": Our growth directors design tailored solutions for your exact unit economics. Click "Book Consultation" below to speak directly with our engineering team!`;
      appendFaqMessage("ai", answer);
    }, 600);
  }

  if (faqSendBtn) faqSendBtn.addEventListener("click", () => handleFaqSubmit());
  if (faqInput) {
    faqInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleFaqSubmit();
    });
  }

  document.querySelectorAll(".faq-preset-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      const q = pill.getAttribute("data-q");
      handleFaqSubmit(q);
    });
  });

  /* ============================================================
     11. CONTACT FORM SUBMISSION FEEDBACK
     ============================================================ */
  const contactForm = document.getElementById("contactForm");
  const formSubmitBtn = document.getElementById("formSubmitBtn");
  const formSuccessMessage = document.getElementById("formSuccessMessage");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (formSubmitBtn) {
        formSubmitBtn.disabled = true;
        formSubmitBtn.innerHTML = `Processing Request...`;
      }
      setTimeout(() => {
        if (formSubmitBtn) formSubmitBtn.style.display = "none";
        if (formSuccessMessage) formSuccessMessage.style.display = "block";
      }, 1000);
    });
  }

  /* ============================================================
     12. STRATEGIC PARTNERSHIP 3D TILT & SCROLL PARALLAX
     ============================================================ */
  const partnershipSection = document.getElementById("partnership");
  const partnershipWrapper = document.getElementById("partnershipVisualWrapper");
  const partnershipImg = document.getElementById("partnershipImg");
  const chipBottom = document.getElementById("chipBottom");

  if (partnershipWrapper && partnershipImg) {
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;
    let isHovered = false;

    partnershipWrapper.addEventListener("mousemove", (e) => {
      const rect = partnershipWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Subtle responsive tilt range (-8deg to +8deg)
      targetTiltY = ((x - centerX) / centerX) * 8;
      targetTiltX = -((y - centerY) / centerY) * 8;
      isHovered = true;
    });

    partnershipWrapper.addEventListener("mouseleave", () => {
      targetTiltX = 0;
      targetTiltY = 0;
      isHovered = false;
    });

    // Smooth Lerp animation loop for 3D holographic tilt
    function animateTilt() {
      currentTiltX += (targetTiltX - currentTiltX) * 0.08;
      currentTiltY += (targetTiltY - currentTiltY) * 0.08;

      if (isHovered || Math.abs(currentTiltX) > 0.04 || Math.abs(currentTiltY) > 0.04) {
        partnershipImg.style.transform = `perspective(1000px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`;
        if (chipBottom) {
          chipBottom.style.transform = `translate3d(${(-currentTiltY * 1.2).toFixed(1)}px, ${(currentTiltX * 1.2).toFixed(1)}px, 20px)`;
        }
      } else if (!isHovered && partnershipImg.style.transform !== "") {
        partnershipImg.style.transform = "";
        if (chipBottom) chipBottom.style.transform = "";
      }

      requestAnimationFrame(animateTilt);
    }
    animateTilt();

    // GSAP ScrollTrigger entry reveal for Partnership section
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined" && partnershipSection) {
      gsap.fromTo(
        partnershipWrapper,
        { opacity: 0, y: 45, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: partnershipSection,
            start: "top 78%",
            toggleActions: "play none none none"
          }
        }
      );
    }
  }

})();
