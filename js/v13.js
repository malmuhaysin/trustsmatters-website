/* Trusts Matters — V1.3 visual layer engine */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var io = "IntersectionObserver" in window;

  /* ---------- 02 · Trust Loop: scroll + time driven rotation ---------- */
  var tloop = document.getElementById("tloop");
  if (tloop && !reduce) {
    var loopVisible = false, t0 = performance.now();
    if (io) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { loopVisible = e.isIntersecting; if (loopVisible) requestAnimationFrame(spinLoop); });
      }, { threshold: 0 }).observe(tloop);
    } else { loopVisible = true; requestAnimationFrame(spinLoop); }
    function spinLoop(now) {
      if (!loopVisible) return;
      var r = tloop.getBoundingClientRect();
      var vh = innerHeight;
      var p = Math.min(Math.max((vh - r.top) / (vh + r.height), 0), 1); /* 0..1 through viewport */
      var rot = p * 160 + (now - t0) / 1000 * 4; /* scroll sweep + slow idle spin */
      tloop.style.setProperty("--rot", rot.toFixed(2) + "deg");
      requestAnimationFrame(spinLoop);
    }
  }

  /* ---------- 03 · Ecosystem: lines, hover, expand ---------- */
  var ECO = {
    "Cybersecurity": { d: "Offense, defense, risk and governance in one practice: we test your systems like attackers and watch them like guards.", c: ["Governance & GRC", "Risk management", "Penetration testing", "Red teaming", "24/7 monitoring"] },
    "Technology":    { d: "Software and systems engineered with security in the architecture.", c: ["Web apps", "APIs", "UI/UX", "Secure SDLC"] },
    "Cloud":         { d: "Modern infrastructure, migrated and managed under SLA.", c: ["Azure", "AWS", "Google Cloud", "Managed IT"] },
    "Manpower":      { d: "IT and cybersecurity specialists embedded in your team, when you need them.", c: ["Resident engineers", "Security specialists", "Staff augmentation"] }
  };
  var eco = document.querySelector(".eco");
  if (eco) {
    var svg = eco.querySelector(".eco__lines");
    var hub = eco.querySelector(".eco__hub");
    var nodes = Array.prototype.slice.call(eco.querySelectorAll(".eco__node"));
    var panT = document.getElementById("ecoT"), panD = document.getElementById("ecoD"),
        panC = document.getElementById("ecoC"), panel = document.getElementById("ecoPanel");

    function drawLines() {
      if (innerWidth <= 860) { svg.innerHTML = ""; return; }
      var er = eco.getBoundingClientRect(), hr = hub.getBoundingClientRect();
      var hx = hr.left - er.left + hr.width / 2, hy = hr.top - er.top + hr.height / 2;
      svg.setAttribute("viewBox", "0 0 " + er.width + " " + er.height);
      svg.innerHTML = nodes.map(function (n, i) {
        var nr = n.getBoundingClientRect();
        var nx = nr.left - er.left + nr.width / 2, ny = nr.top - er.top + nr.height / 2;
        var mx = (hx + nx) / 2 + (ny < hy ? 30 : -30), my = (hy + ny) / 2 + (nx < hx ? -24 : 24);
        return '<path data-i="' + i + '" d="M' + hx + ',' + hy + ' Q' + mx + ',' + my + ' ' + nx + ',' + ny + '"/>';
      }).join("");
    }
    drawLines();
    addEventListener("resize", drawLines);

    function pathFor(i) { return svg.querySelector('path[data-i="' + i + '"]'); }
    nodes.forEach(function (n, i) {
      n.addEventListener("mouseenter", function () { var p = pathFor(i); if (p) p.classList.add("hot"); });
      n.addEventListener("mouseleave", function () { var p = pathFor(i); if (p && !n.classList.contains("active")) p.classList.remove("hot"); });
      n.addEventListener("click", function () { select(n, i); });
    });
    function select(n, i) {
      nodes.forEach(function (m, k) { m.classList.toggle("active", m === n);
        var p = pathFor(k); if (p) p.classList.toggle("hot", k === i); });
      var key = n.textContent.trim(), data = ECO[key];
      if (!data || !panel) return;
      panel.classList.add("swap");
      setTimeout(function () {
        panT.textContent = key; panD.textContent = data.d;
        panC.innerHTML = data.c.map(function (c) { return '<span class="chip">' + c + "</span>"; }).join("");
        panel.classList.remove("swap");
      }, 250);
    }
    if (nodes[0]) select(nodes[0], 0);
  }

  /* ---------- 04 · Pipeline + 07 · Comparison + 09 · Architecture: in-view triggers ---------- */
  function onSeen(sel, cls, th) {
    var el = document.querySelector(sel);
    if (!el) return;
    if (!io || reduce) { el.classList.add(cls); return; }
    new IntersectionObserver(function (es, obs) {
      es.forEach(function (e) { if (e.isIntersecting) { el.classList.add(cls); obs.disconnect(); } });
    }, { threshold: th || 0.3 }).observe(el);
  }
  onSeen(".pipe", "flow", 0.35);
  onSeen(".cmp", "run", 0.3);
  onSeen(".arch", "built", 0.25);

  /* ---------- 06 · Defense in motion canvas ---------- */
  var dcv = document.getElementById("defcv");
  if (dcv) {
    var dcx = dcv.getContext("2d");
    var DW = 0, DH = 0, core = { x: 0, y: 0 }, ringR = [0, 0];
    var dn = [], packets = [], threats = [], ripples = [];
    var visible = false, lastT = 0, spawnAcc = 0;

    function sizeDef() {
      var host = dcv.parentElement, r = host.getBoundingClientRect();
      var dpr = Math.min(devicePixelRatio || 1, 1.5);
      DW = r.width; DH = r.height;
      dcv.width = DW * dpr; dcv.height = DH * dpr;
      dcx.setTransform(dpr, 0, 0, dpr, 0, 0);
      core.x = DW * (innerWidth > 900 ? 0.72 : 0.5); core.y = DH * 0.52;
      ringR = [Math.min(DW, DH) * 0.17, Math.min(DW, DH) * 0.28];
      dn = [];
      var count = innerWidth > 900 ? 34 : 20;
      for (var i = 0; i < count; i++) {
        dn.push({ x: Math.random() * DW, y: Math.random() * DH,
          vx: (Math.random() - .5) * 14, vy: (Math.random() - .5) * 14, r: 1.5 + Math.random() * 2 });
      }
    }
    sizeDef();
    addEventListener("resize", sizeDef);

    if (io && !reduce) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          visible = e.isIntersecting;
          if (visible) { lastT = performance.now(); requestAnimationFrame(defTick); }
        });
      }, { threshold: 0.05 }).observe(dcv);
    } else { drawDef(0); } /* static single frame */

    function spawnPacket() {
      if (dn.length < 2) return;
      var a = dn[(Math.random() * dn.length) | 0], b = dn[(Math.random() * dn.length) | 0];
      if (a === b) return;
      packets.push({ a: a, b: b, t: 0, sp: .5 + Math.random() * .6 });
    }
    function spawnThreat() {
      var edge = (Math.random() * 4) | 0, x, y;
      if (edge === 0) { x = -12; y = Math.random() * DH; }
      else if (edge === 1) { x = DW + 12; y = Math.random() * DH; }
      else if (edge === 2) { x = Math.random() * DW; y = -12; }
      else { x = Math.random() * DW; y = DH + 12; }
      threats.push({ x: x, y: y, sp: 46 + Math.random() * 26 });
    }
    function drawDef(dt) {
      dcx.clearRect(0, 0, DW, DH);
      /* drifting nodes + links */
      dn.forEach(function (n) {
        n.x += n.vx * dt; n.y += n.vy * dt;
        if (n.x < 0 || n.x > DW) n.vx *= -1;
        if (n.y < 0 || n.y > DH) n.vy *= -1;
      });
      dcx.lineWidth = 1;
      for (var i = 0; i < dn.length; i++) for (var j = i + 1; j < dn.length; j++) {
        var dx = dn[i].x - dn[j].x, dy = dn[i].y - dn[j].y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 130) {
          dcx.strokeStyle = "rgba(19,164,176," + ((1 - d / 130) * .25) + ")";
          dcx.beginPath(); dcx.moveTo(dn[i].x, dn[i].y); dcx.lineTo(dn[j].x, dn[j].y); dcx.stroke();
        }
      }
      dn.forEach(function (n) {
        dcx.fillStyle = "rgba(95,227,209,.75)";
        dcx.beginPath(); dcx.arc(n.x, n.y, n.r, 0, 6.283); dcx.fill();
      });
      /* control layers (perimeter rings) */
      var pulse = 1 + Math.sin(performance.now() / 900) * .015;
      ringR.forEach(function (r, k) {
        dcx.strokeStyle = "rgba(19,164,176," + (k === 0 ? .55 : .3) + ")";
        dcx.lineWidth = k === 0 ? 1.6 : 1.2;
        dcx.setLineDash(k === 0 ? [] : [6, 10]);
        dcx.beginPath(); dcx.arc(core.x, core.y, r * pulse, 0, 6.283); dcx.stroke();
      });
      dcx.setLineDash([]);
      /* core */
      var g = dcx.createRadialGradient(core.x, core.y, 0, core.x, core.y, ringR[0] * .8);
      g.addColorStop(0, "rgba(19,164,176,.4)"); g.addColorStop(1, "rgba(19,164,176,0)");
      dcx.fillStyle = g; dcx.beginPath(); dcx.arc(core.x, core.y, ringR[0] * .8, 0, 6.283); dcx.fill();
      dcx.fillStyle = "rgba(95,227,209,.95)";
      dcx.beginPath(); dcx.arc(core.x, core.y, 5, 0, 6.283); dcx.fill();
      /* data packets along links */
      packets = packets.filter(function (p) {
        p.t += dt * p.sp;
        if (p.t >= 1) return false;
        var x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
        dcx.fillStyle = "rgba(95,227,209,.9)";
        dcx.beginPath(); dcx.arc(x, y, 2.6, 0, 6.283); dcx.fill();
        return true;
      });
      /* threats: move toward core, blocked at outer ring */
      threats = threats.filter(function (t) {
        var dx = core.x - t.x, dy = core.y - t.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < ringR[1]) { ripples.push({ x: t.x, y: t.y, r: 4, a: 1 }); return false; }
        t.x += dx / d * t.sp * dt; t.y += dy / d * t.sp * dt;
        dcx.fillStyle = "rgba(226,87,77,.95)";
        dcx.beginPath(); dcx.arc(t.x, t.y, 3.4, 0, 6.283); dcx.fill();
        dcx.strokeStyle = "rgba(226,87,77,.3)"; dcx.lineWidth = 1;
        dcx.beginPath(); dcx.moveTo(t.x, t.y); dcx.lineTo(t.x - dx / d * 16, t.y - dy / d * 16); dcx.stroke();
        return true;
      });
      /* block ripples */
      ripples = ripples.filter(function (rp) {
        rp.r += dt * 60; rp.a -= dt * 1.6;
        if (rp.a <= 0) return false;
        dcx.strokeStyle = "rgba(226,87,77," + rp.a.toFixed(2) + ")";
        dcx.lineWidth = 1.6;
        dcx.beginPath(); dcx.arc(rp.x, rp.y, rp.r, 0, 6.283); dcx.stroke();
        return true;
      });
    }
    function defTick(now) {
      if (!visible) return;
      var dt = Math.min((now - lastT) / 1000, .05); lastT = now;
      spawnAcc += dt;
      if (spawnAcc > .5) { spawnAcc = 0; spawnPacket(); if (Math.random() < .45) spawnThreat(); }
      drawDef(dt);
      requestAnimationFrame(defTick);
    }
  }
})();
