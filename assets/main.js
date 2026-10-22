/* =========================================================
   郭奕炫 · 个人作品网站 交互脚本
   纯原生 JS，无任何外部依赖
   ========================================================= */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  /* ---------- 1. 首屏粒子网络背景 ---------- */
  function initNet() {
    const canvas = $("#net");
    if (!canvas || reduceMotion) return;
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = 1, points = [], raf = null;
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(88, Math.max(26, Math.round((w * h) / 23000)));
      points = new Array(count).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.6 + 0.7
      }));
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(120, 200, 235, 0.55)";
        ctx.fill();

        for (let j = i + 1; j < points.length; j++) {
          const q = points[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 21000) {
            const a = (1 - d2 / 21000) * 0.36;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = "rgba(90, 150, 220, " + a.toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        const mx = p.x - mouse.x, my = p.y - mouse.y;
        const md2 = mx * mx + my * my;
        if (md2 < 36000) {
          const a = (1 - md2 / 36000) * 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = "rgba(56, 224, 208, " + a.toFixed(3) + ")";
          ctx.lineWidth = 1.1;
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    window.addEventListener("mouseout", () => { mouse.x = mouse.y = -9999; });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
      else if (!raf) raf = requestAnimationFrame(frame);
    });

    resize();
    raf = requestAnimationFrame(frame);
  }

  /* ---------- 2. 导航：吸顶、进度条、移动菜单、当前区块高亮 ---------- */
  function initNav() {
    const nav = $("#nav");
    const bar = $("#progressBar");
    const toTop = $("#toTop");
    const burger = $("#burger");
    const links = $("#navLinks");

    function onScroll() {
      const y = window.scrollY || document.documentElement.scrollTop;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
      if (nav) nav.classList.toggle("is-stuck", y > 24);
      if (toTop) toTop.classList.toggle("is-on", y > 640);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (burger && links) {
      burger.addEventListener("click", () => {
        const open = links.classList.toggle("is-open");
        burger.setAttribute("aria-expanded", String(open));
      });
      $$("a", links).forEach((a) => a.addEventListener("click", () => {
        links.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      }));
    }

    if (toTop) toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

    const navLinks = $$("#navLinks a");
    const sections = navLinks
      .map((a) => document.getElementById(a.getAttribute("href").slice(1)))
      .filter(Boolean);

    if ("IntersectionObserver" in window && sections.length) {
      const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id));
        });
      }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
      sections.forEach((s) => spy.observe(s));
    }
  }

  /* ---------- 3. 滚动进场 ---------- */
  function initReveal() {
    const items = $$(".reveal");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach((el, i) => {
      el.style.transitionDelay = Math.min(i % 4, 3) * 70 + "ms";
      io.observe(el);
    });

    // 首屏元素直接显示，避免等待观察器回调
    requestAnimationFrame(() => {
      items.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.95 && r.bottom > -40) el.classList.add("is-in");
      });
    });

    // 兜底：3 秒后无论滚动与否全部显示
    window.setTimeout(() => items.forEach((el) => el.classList.add("is-in")), 3000);
  }

  /* ---------- 4. 数字滚动 ---------- */
  function initCounters() {
    const items = $$(".count");
    if (!items.length) return;
    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach((el) => { el.textContent = (el.dataset.prefix || "") + el.dataset.to + (el.dataset.suffix || ""); });
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const to = Number(el.dataset.to) || 0;
        const prefix = el.dataset.prefix || "";
        const suffix = el.dataset.suffix || "";
        const start = performance.now();
        const dur = 1100;
        (function step(now) {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = prefix + Math.round(to * eased) + suffix;
          if (t < 1) requestAnimationFrame(step);
        })(start);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    items.forEach((el) => io.observe(el));
  }

  /* ---------- 5. 首屏岗位轮播 ---------- */
  function initRoles() {
    const box = $("#roleRotator");
    if (!box) return;
    const roles = $$(".role", box);
    if (roles.length < 2) return;
    let i = 0;
    setInterval(() => {
      roles[i].classList.remove("is-on");
      i = (i + 1) % roles.length;
      roles[i].classList.add("is-on");
    }, 2600);
  }

  /* ---------- 6. 图片灯箱 ---------- */
  function initLightbox() {
    const box = $("#lightbox");
    const img = $("#lbImg");
    const cap = $("#lbCap");
    if (!box || !img) return;

    const triggers = $$("[data-full]");
    let index = 0;
    let lastFocus = null;

    function show(i) {
      index = (i + triggers.length) % triggers.length;
      const el = triggers[index];
      img.src = el.dataset.full;
      img.alt = el.dataset.cap || "";
      if (cap) cap.textContent = el.dataset.cap || "";
    }

    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      box.hidden = false;
      requestAnimationFrame(() => box.classList.add("is-open"));
      document.body.style.overflow = "hidden";
      const close = $("#lbClose");
      if (close) close.focus();
    }

    function close() {
      box.classList.remove("is-open");
      document.body.style.overflow = "";
      window.setTimeout(() => { box.hidden = true; img.src = ""; }, 220);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    triggers.forEach((el, i) => el.addEventListener("click", () => open(i)));
    const closeBtn = $("#lbClose");
    const prevBtn = $("#lbPrev");
    const nextBtn = $("#lbNext");
    if (closeBtn) closeBtn.addEventListener("click", close);
    if (prevBtn) prevBtn.addEventListener("click", () => show(index - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => show(index + 1));
    box.addEventListener("click", (e) => { if (e.target === box) close(); });

    document.addEventListener("keydown", (e) => {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });
  }

  /* ---------- 7. 复制联系方式 ---------- */
  function initCopy() {
    const toast = $("#toast");
    let timer = null;
    function flash(text) {
      if (!toast) return;
      toast.textContent = text;
      toast.classList.add("is-on");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => toast.classList.remove("is-on"), 1800);
    }
    $$("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const text = btn.dataset.copy;
        const done = () => flash("已复制：" + text);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(() => flash("复制失败，请手动选择：" + text));
        } else {
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); done(); } catch (err) { flash("复制失败，请手动选择：" + text); }
          document.body.removeChild(ta);
        }
      });
    });
  }

  /* ---------- 8. 照片轻微 3D 倾斜（仅桌面） ---------- */
  function initTilt() {
    if (reduceMotion || window.matchMedia("(hover: none)").matches) return;
    $$(".tilt").forEach((el) => {
      const parent = el.parentElement;
      if (!parent) return;
      parent.addEventListener("mousemove", (e) => {
        const r = parent.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(900px) rotateY(" + (px * 6).toFixed(2) + "deg) rotateX(" + (-py * 6).toFixed(2) + "deg) translateZ(0)";
      });
      parent.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- 9. 页脚年份 ---------- */
  function initYear() {
    const y = $("#year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function boot() {
    initNet();
    initNav();
    initReveal();
    initCounters();
    initRoles();
    initLightbox();
    initCopy();
    initTilt();
    initYear();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
