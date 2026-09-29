// Behaviour for research project pages (layout: project).
// Everything here is progressive enhancement: the page is complete without it.
(function () {
  "use strict";

  window.__ppReady = true;
  document.documentElement.classList.add("pp-js");

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function onReady(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  // ---------------------------------------------------------------- nav ----
  function initNav() {
    var nav = document.querySelector(".pp-nav");
    if (!nav) return;
    var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    var targets = links
      .map(function (a) {
        return { link: a, el: document.getElementById(a.getAttribute("href").slice(1)) };
      })
      .filter(function (t) {
        return t.el;
      });
    if (!targets.length) return;

    var current = null;
    function update() {
      var offset = 140;
      var active = targets[0];
      for (var i = 0; i < targets.length; i++) {
        if (targets[i].el.getBoundingClientRect().top - offset <= 0) active = targets[i];
      }
      // At the very bottom, the last section wins even if it is short.
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) active = targets[targets.length - 1];
      if (active === current) return;
      if (current) current.link.classList.remove("is-active");
      active.link.classList.add("is-active");
      current = active;
      var l = active.link;
      if (nav.scrollWidth > nav.clientWidth) {
        nav.scrollTo({ left: l.offsetLeft - nav.clientWidth / 2 + l.offsetWidth / 2, behavior: reduceMotion ? "auto" : "smooth" });
      }
    }

    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
          update();
          ticking = false;
        });
      },
      { passive: true }
    );
    update();
  }

  // ------------------------------------------------------------- charts ----
  function initCharts() {
    var charts = Array.prototype.slice.call(document.querySelectorAll(".pp-chart"));
    if (!charts.length) return;

    if ("IntersectionObserver" in window && !reduceMotion) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              e.target.classList.add("is-in");
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.25 }
      );
      charts.forEach(function (c) {
        io.observe(c);
      });
    } else {
      charts.forEach(function (c) {
        c.classList.add("is-in");
      });
    }

    charts.forEach(function (chart) {
      var tip = document.createElement("div");
      tip.className = "pp-tooltip";
      tip.setAttribute("role", "status");
      chart.appendChild(tip);
      var unit = chart.getAttribute("data-unit") || "";

      function show(row) {
        var d = row.dataset;
        var html = "<b>" + d.label + "</b>" + d.value + unit;
        if (d.sd) html += " ± " + d.sd;
        if (d.n) html += ' <span style="opacity:.75">(' + d.n + " seeds)</span>";
        if (d.note) html += '<span class="pp-tip-note">' + d.note + "</span>";
        tip.innerHTML = html;
        var cr = chart.getBoundingClientRect();
        var bar = row.querySelector(".pp-hrow-bar");
        var br = (bar || row).getBoundingClientRect();
        var x = br.right - cr.left + 12;
        var y = br.top - cr.top + br.height / 2;
        tip.classList.add("is-on");
        var tw = tip.offsetWidth;
        var th = tip.offsetHeight;
        if (x + tw > cr.width - 8) x = Math.max(8, br.right - cr.left - tw - 12);
        tip.style.left = x + "px";
        tip.style.top = Math.max(4, y - th - 10) + "px";
      }
      function hide() {
        tip.classList.remove("is-on");
      }

      Array.prototype.forEach.call(chart.querySelectorAll(".pp-hrow"), function (row) {
        row.addEventListener("pointerenter", function () {
          show(row);
        });
        row.addEventListener("pointerleave", hide);
        row.addEventListener("focus", function () {
          show(row);
        });
        row.addEventListener("blur", hide);
      });
    });
  }

  // --------------------------------------------------------------- tabs ----
  function initTabs() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-pp-tabs]"), function (group) {
      var buttons = Array.prototype.slice.call(group.querySelectorAll('[role="tab"]'));
      function select(btn, focus) {
        buttons.forEach(function (b) {
          var on = b === btn;
          b.setAttribute("aria-selected", on ? "true" : "false");
          b.tabIndex = on ? 0 : -1;
          var panel = document.getElementById(b.getAttribute("aria-controls"));
          if (!panel) return;
          panel.hidden = !on;
          if (on) {
            // Replay the grow-in so the switch reads as new data arriving.
            Array.prototype.forEach.call(panel.querySelectorAll(".pp-chart"), function (c) {
              if (reduceMotion) return;
              c.classList.remove("is-in");
              void c.offsetWidth;
              window.requestAnimationFrame(function () {
                c.classList.add("is-in");
              });
            });
          }
        });
        if (focus) btn.focus();
      }
      buttons.forEach(function (b, i) {
        b.addEventListener("click", function () {
          select(b, false);
        });
        b.addEventListener("keydown", function (e) {
          var k = e.key;
          if (k !== "ArrowRight" && k !== "ArrowLeft") return;
          e.preventDefault();
          var n = buttons.length;
          select(buttons[(i + (k === "ArrowRight" ? 1 : n - 1)) % n], true);
        });
      });
      var initial =
        buttons.filter(function (b) {
          return b.getAttribute("aria-selected") === "true";
        })[0] || buttons[0];
      if (initial) select(initial, false);
    });
  }

  // --------------------------------------------------------- copy bibtex ----
  function initCopy() {
    Array.prototype.forEach.call(document.querySelectorAll(".pp-copy"), function (btn) {
      btn.addEventListener("click", function () {
        var target = document.getElementById(btn.getAttribute("data-copy-target"));
        if (!target) return;
        var text = target.textContent;
        var label = btn.querySelector("span");
        function done() {
          btn.classList.add("is-done");
          if (label) label.textContent = "Copied";
          setTimeout(function () {
            btn.classList.remove("is-done");
            if (label) label.textContent = "Copy";
          }, 1800);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () {});
        } else {
          var ta = document.createElement("textarea");
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand("copy");
            done();
          } catch (err) {}
          document.body.removeChild(ta);
        }
      });
    });
  }

  // -------------------------------------------------------------- sliders ----
  function paintRange(el) {
    var min = parseFloat(el.min || 0);
    var max = parseFloat(el.max || 100);
    var pct = ((parseFloat(el.value) - min) / (max - min)) * 100;
    el.style.setProperty("--pp-fill", pct + "%");
  }
  function initRanges() {
    Array.prototype.forEach.call(document.querySelectorAll(".pp-range"), paintRange);
    document.addEventListener("input", function (e) {
      if (e.target && e.target.classList && e.target.classList.contains("pp-range")) paintRange(e.target);
    });
  }

  onReady(function () {
    initNav();
    initCharts();
    initTabs();
    initCopy();
    initRanges();
  });
})();
