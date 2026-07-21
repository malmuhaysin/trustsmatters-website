/* Trusts Matters v3 — interactions */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Nav + progress ---- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  var progress = document.getElementById("progress");
  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 12);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("show");
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  links.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      links.classList.remove("show");
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---- Reveal on scroll ---- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- Active nav ---- */
  var anchors = Array.prototype.slice.call(document.querySelectorAll('.nav__links a[href^="#"]'));
  var secs = anchors.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); }).filter(Boolean);
  if (secs.length && "IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          anchors.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id); });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    secs.forEach(function (s) { so.observe(s); });
  }

  /* ---- Practice tabs ---- */
  var tabCyber = document.getElementById("tab-cyber");
  var tabIt = document.getElementById("tab-it");
  var panelCyber = document.getElementById("panel-cyber");
  var panelIt = document.getElementById("panel-it");
  function setTab(cyber) {
    tabCyber.classList.toggle("active", cyber);
    tabIt.classList.toggle("active", !cyber);
    tabCyber.setAttribute("aria-selected", cyber ? "true" : "false");
    tabIt.setAttribute("aria-selected", cyber ? "false" : "true");
    panelCyber.classList.toggle("active", cyber);
    panelIt.classList.toggle("active", !cyber);
  }
  if (tabCyber && tabIt) {
    tabCyber.addEventListener("click", function () { setTab(true); });
    tabIt.addEventListener("click", function () { setTab(false); });
  }

  /* ---- Expandable capabilities ---- */
  document.querySelectorAll(".cap").forEach(function (cap) {
    var head = cap.querySelector(".cap__head");
    var body = cap.querySelector(".cap__body");
    head.addEventListener("click", function () {
      var open = cap.classList.toggle("openx");
      head.setAttribute("aria-expanded", open ? "true" : "false");
      body.style.maxHeight = open ? body.scrollHeight + "px" : "0px";
    });
  });

  /* ---- Methodology explorer ---- */
  var PHASES = [
    { n: "Phase 01", t: "Discover", p: "Understand the business before touching the technology.", w: "We map your assets, threats, obligations and goals.", o: "A clear picture of risk and priorities." },
    { n: "Phase 02", t: "Assess & Design", p: "Define the target state.", w: "We measure posture against standards, prioritize gaps and design the roadmap.", o: "A prioritized, regulator ready plan." },
    { n: "Phase 03", t: "Build", p: "Make it real.", w: "Controls, systems and software built with secure practices.", o: "Hardened, working capability." },
    { n: "Phase 04", t: "Deploy", p: "Launch with confidence.", w: "We migrate, test, harden and hand over.", o: "A smooth, verified go live." },
    { n: "Phase 05", t: "Operate & Improve", p: "Keep raising the bar.", w: "We monitor, report, audit and continuously improve.", o: "Sustained resilience and maturity." }
  ];
  var phaseBtns = document.querySelectorAll(".phase");
  var mpanel = document.getElementById("mpanel");
  phaseBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var i = parseInt(btn.getAttribute("data-i"), 10);
      phaseBtns.forEach(function (b) {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      var d = PHASES[i];
      document.getElementById("m-n").textContent = d.n;
      document.getElementById("m-t").textContent = d.t;
      document.getElementById("m-p").textContent = d.p;
      document.getElementById("m-w").textContent = d.w;
      document.getElementById("m-o").textContent = d.o;
      mpanel.classList.remove("swap");
      void mpanel.offsetWidth;
      mpanel.classList.add("swap");
    });
  });

  /* ---- Hero stat counter ---- */
  var counter = document.querySelector("[data-count]");
  if (counter && !reduce && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        co.disconnect();
        var target = parseInt(counter.getAttribute("data-count"), 10);
        var suffix = counter.querySelector("i");
        var start = null;
        function frame(t) {
          if (!start) start = t;
          var p = Math.min((t - start) / 1000, 1);
          counter.childNodes[0].textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
          if (p < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
    }, { threshold: 0.5 });
    co.observe(counter);
  }

  /* ---- Trust lattice (hero canvas) ---- */
  var canvas = document.getElementById("trustnet");
  if (canvas && !reduce && window.innerWidth > 700) {
    var ctx = canvas.getContext("2d");
    var W, H, nodes = [], mouse = { x: 0.5, y: 0.5 }, running = true;

    function resize() {
      var r = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = r.width * devicePixelRatio;
      H = canvas.height = r.height * devicePixelRatio;
    }
    resize();
    window.addEventListener("resize", resize);

    /* Nodes on concentric rings around a focal point (right of center) */
    var CX = 0.72, CY = 0.46;
    var rings = [0.085, 0.16, 0.24, 0.33];
    rings.forEach(function (rad, ri) {
      var count = 6 + ri * 4;
      for (var i = 0; i < count; i++) {
        var a = (i / count) * Math.PI * 2 + ri * 0.6;
        nodes.push({
          bx: CX + Math.cos(a) * rad * 1.15,
          by: CY + Math.sin(a) * rad,
          a: a, r: rad, ri: ri,
          sp: (0.05 + Math.random() * 0.08) * (ri % 2 ? 1 : -1),
          size: ri === 0 ? 2.6 : 2 - ri * 0.25,
          gold: Math.random() < 0.07,
          ph: Math.random() * Math.PI * 2
        });
      }
    });
    nodes.push({ bx: CX, by: CY, a: 0, r: 0, ri: -1, sp: 0, size: 3.4, gold: true, ph: 0 });

    document.addEventListener("mousemove", function (e) {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
    }, { passive: true });

    var t0 = performance.now();
    function tick(now) {
      if (!running) return;
      var t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      var px = (mouse.x - 0.5) * 18 * devicePixelRatio;
      var py = (mouse.y - 0.5) * 12 * devicePixelRatio;

      nodes.forEach(function (n) {
        var ang = n.a + t * n.sp;
        n.x = (n.ri < 0 ? n.bx : CX + Math.cos(ang) * n.r * 1.15) * W + px * (n.ri + 2) * 0.22;
        n.y = (n.ri < 0 ? n.by : CY + Math.sin(ang) * n.r) * H + py * (n.ri + 2) * 0.22;
      });

      /* Connections */
      ctx.lineWidth = 1;
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          var d2 = dx * dx + dy * dy;
          var max = 0.14 * W * 0.14 * W;
          if (d2 < max) {
            var o = (1 - d2 / max) * 0.34;
            ctx.strokeStyle = "rgba(19,164,176," + o.toFixed(3) + ")";
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      }
      /* Nodes */
      nodes.forEach(function (n) {
        var pulse = 0.75 + 0.25 * Math.sin(t * 1.6 + n.ph);
        var s = n.size * devicePixelRatio * pulse;
        ctx.beginPath();
        ctx.arc(n.x, n.y, s, 0, Math.PI * 2);
        ctx.fillStyle = n.gold ? "rgba(224,190,120," + (0.85 * pulse).toFixed(2) + ")" : "rgba(95,227,209," + (0.7 * pulse).toFixed(2) + ")";
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    /* Pause when hero offscreen */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var was = running;
          running = en.isIntersecting;
          if (running && !was) { t0 = performance.now() - 1; requestAnimationFrame(tick); }
        });
      }, { threshold: 0 }).observe(canvas);
    }
  }

  /* ---- Year ---- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
