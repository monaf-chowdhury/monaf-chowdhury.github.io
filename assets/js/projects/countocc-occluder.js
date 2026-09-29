// CountOCC project page: drag an occluder over a tray and compare the visible count with the amodal count.
// An object counts as hidden when the occluder covers its centre, the same rule the paper uses to split
// predictions into visible and occluded instances. This is an illustration of the task, not model output.
(function () {
  "use strict";

  var root = document.getElementById("pp-occluder");
  if (!root) return;

  var svg = root.querySelector("[data-oc-scene]");
  var sizeIn = root.querySelector("[data-size]");
  var sizeOut = root.querySelector("[data-size-out]");
  var peekIn = root.querySelector("[data-peek]");
  var summary = root.querySelector("[data-oc-summary]");
  var layoutBtns = root.querySelectorAll("[data-layout]");
  var NS = "http://www.w3.org/2000/svg";

  var W = 560,
    H = 360,
    TRAY = { x: 18, y: 18, w: 524, h: 324 },
    R = 25,
    N = 20;
  // Donut glazes, loosely after Fig. 1 of the paper: chocolate, sugar, white.
  var GLAZES = [
    { ring: "#6b4430", top: "#4a2c1e" },
    { ring: "#c8894c", top: "#dba56a" },
    { ring: "#d9c7a7", top: "#f1e7d3" },
  ];

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var layouts = {
    grid: (function () {
      var pts = [];
      for (var r = 0; r < 4; r++) for (var c = 0; c < 5; c++) pts.push({ x: 84 + c * 98, y: 70 + r * 73, glaze: r % 3 });
      return pts;
    })(),
    scatter: (function () {
      var rand = mulberry32(11),
        pts = [],
        tries = 0;
      while (pts.length < N && tries < 5000) {
        tries++;
        var p = { x: TRAY.x + R + 8 + rand() * (TRAY.w - 2 * R - 16), y: TRAY.y + R + 8 + rand() * (TRAY.h - 2 * R - 16) };
        var ok = pts.every(function (q) {
          return Math.hypot(p.x - q.x, p.y - q.y) > 2 * R + 6;
        });
        if (ok) {
          p.glaze = pts.length % 3;
          pts.push(p);
        }
      }
      return pts;
    })(),
  };

  // Starts over 6 of the 20 grid objects (30%), inside the 25–35% band of FSC-147-OCC.
  var state = { layout: "grid", size: 230, cx: 265, cy: 180, peek: false };

  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function occRect() {
    var w = state.size,
      h = Math.round(state.size * 0.82);
    var x = Math.max(TRAY.x, Math.min(TRAY.x + TRAY.w - w, state.cx - w / 2));
    var y = Math.max(TRAY.y, Math.min(TRAY.y + TRAY.h - h, state.cy - h / 2));
    return { x: x, y: y, w: w, h: h };
  }

  function isHidden(p, r) {
    return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
  }

  function donut(g, p, ghost) {
    if (ghost) {
      g.appendChild(el("circle", { cx: p.x, cy: p.y, r: R, class: "pp-oc-ghost" }));
      g.appendChild(el("circle", { cx: p.x, cy: p.y, r: 8, class: "pp-oc-ghost" }));
      return;
    }
    var glaze = GLAZES[p.glaze];
    g.appendChild(el("circle", { cx: p.x, cy: p.y, r: R, fill: glaze.ring }));
    g.appendChild(el("circle", { cx: p.x - 1, cy: p.y - 1, r: R - 5, fill: glaze.top }));
    g.appendChild(el("circle", { cx: p.x, cy: p.y, r: 8, fill: "#2b2622" }));
  }

  var occEl = null;

  function draw() {
    while (svg.lastChild && svg.lastChild.nodeName !== "desc" && svg.lastChild.nodeName !== "title") svg.removeChild(svg.lastChild);
    var g = el("g", {});
    g.appendChild(el("rect", { x: TRAY.x, y: TRAY.y, width: TRAY.w, height: TRAY.h, rx: 18, fill: "#2b2622" }));
    g.appendChild(el("rect", { x: TRAY.x + 8, y: TRAY.y + 8, width: TRAY.w - 16, height: TRAY.h - 16, rx: 12, fill: "none", stroke: "#443d36", "stroke-width": 2 }));

    var r = occRect();
    var pts = layouts[state.layout];
    pts.forEach(function (p) {
      donut(g, p, false);
    });

    occEl = el("rect", {
      x: r.x,
      y: r.y,
      width: r.w,
      height: r.h,
      fill: "#000",
      class: "pp-oc-box",
      tabindex: "0",
      role: "slider",
      "aria-label": "Occluder position: drag, or use the arrow keys",
      "aria-valuetext": "",
    });
    g.appendChild(occEl);

    if (state.peek) {
      pts.forEach(function (p) {
        if (isHidden(p, r)) donut(g, p, true);
      });
    }
    svg.appendChild(g);
    bindOccluder();
    report(pts, r);
  }

  function setRow(name, n) {
    var row = root.querySelector('[data-row="' + name + '"]');
    row.querySelector("[data-n]").textContent = String(n);
    row.querySelector(".pp-readrow-bar").style.width = (n / N) * 100 + "%";
  }

  function report(pts, r) {
    var hidden = pts.filter(function (p) {
      return isHidden(p, r);
    }).length;
    var visible = pts.length - hidden;
    setRow("vis", visible);
    setRow("occ", hidden);
    setRow("all", pts.length);
    occEl.setAttribute("aria-valuetext", hidden + " of " + pts.length + " objects hidden");

    var pct = Math.round((hidden / pts.length) * 100);
    var context =
      state.layout === "grid"
        ? "On a regular tray the missing positions are easy to guess from the rows and columns around the box; that is the kind of pattern CAPTURe tests."
        : "Scattered, nothing outside the box says how many objects are under it. The evidence has to come from reconstructing the features under the mask.";
    summary.innerHTML =
      "<b>" +
      hidden +
      " of " +
      pts.length +
      "</b> objects (" +
      pct +
      "%) are hidden, so a counter that only sees visible objects reports " +
      visible +
      ". FSC-147-OCC hides 25–35% per image. " +
      context;
  }

  // Dragging and keyboard control.
  var drag = null;
  function toSvg(evt) {
    var pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }
  function bindOccluder() {
    occEl.addEventListener("pointerdown", function (e) {
      var p = toSvg(e),
        r = occRect();
      drag = { dx: p.x - (r.x + r.w / 2), dy: p.y - (r.y + r.h / 2), id: e.pointerId };
      svg.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    occEl.addEventListener("keydown", function (e) {
      var step = e.shiftKey ? 30 : 10,
        moved = true;
      if (e.key === "ArrowLeft") state.cx -= step;
      else if (e.key === "ArrowRight") state.cx += step;
      else if (e.key === "ArrowUp") state.cy -= step;
      else if (e.key === "ArrowDown") state.cy += step;
      else moved = false;
      if (moved) {
        e.preventDefault();
        clampCentre();
        draw();
        occEl.focus();
      }
    });
  }
  function clampCentre() {
    var r = occRect();
    state.cx = r.x + r.w / 2;
    state.cy = r.y + r.h / 2;
  }
  svg.addEventListener("pointermove", function (e) {
    if (!drag) return;
    var p = toSvg(e);
    state.cx = p.x - drag.dx;
    state.cy = p.y - drag.dy;
    clampCentre();
    draw();
  });
  function endDrag(e) {
    if (!drag) return;
    try {
      svg.releasePointerCapture(drag.id);
    } catch (err) {}
    drag = null;
  }
  svg.addEventListener("pointerup", endDrag);
  svg.addEventListener("pointercancel", endDrag);

  sizeIn.addEventListener("input", function () {
    state.size = parseInt(sizeIn.value, 10);
    sizeOut.textContent = state.size + " px";
    clampCentre();
    draw();
  });
  peekIn.addEventListener("change", function () {
    state.peek = peekIn.checked;
    draw();
  });
  Array.prototype.forEach.call(layoutBtns, function (btn) {
    btn.addEventListener("click", function () {
      state.layout = btn.getAttribute("data-layout");
      Array.prototype.forEach.call(layoutBtns, function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      draw();
    });
  });

  draw();
})();
