// T3Time project page: what the frequency branch sees (Eq. 1).
// A 96-step window x_t = A1 sin(2π t/24) + A2 sin(2π t/12 + 0.6) + trend · t/L + noise · e_t is z-scored like the model's
// input, then its real FFT gives L_f = floor(L/2) + 1 = 49 bins; the bars are the magnitudes |X̂_k| / L.
(function () {
  "use strict";

  var root = document.getElementById("pp-spectrum");
  if (!root) return;

  var svg = root.querySelector("[data-sp-plot]");
  var inputs = {
    a1: root.querySelector("[data-a1]"),
    a2: root.querySelector("[data-a2]"),
    tr: root.querySelector("[data-tr]"),
    nz: root.querySelector("[data-nz]"),
  };
  var outs = {
    a1: root.querySelector("[data-a1-out]"),
    a2: root.querySelector("[data-a2-out]"),
    tr: root.querySelector("[data-tr-out]"),
    nz: root.querySelector("[data-nz-out]"),
  };
  var summary = root.querySelector("[data-sp-summary]");

  var L = 96;
  var LF = Math.floor(L / 2) + 1;
  var NS = "http://www.w3.org/2000/svg";
  var X0 = 58,
    X1 = 706;
  var TOP = { y0: 22, y1: 128 };
  var BOT = { y0: 184, y1: 290 };

  // Fixed Gaussian noise (seeded), so moving a slider never reshuffles it.
  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var rand = mulberry32(7);
  var eps = [];
  for (var i = 0; i < L; i++) {
    var u = Math.max(1e-9, rand()),
      v = rand();
    eps.push(Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v));
  }

  function series(p) {
    var x = [];
    for (var t = 0; t < L; t++) {
      x.push(p.a1 * Math.sin((2 * Math.PI * t) / 24) + p.a2 * Math.sin((2 * Math.PI * t) / 12 + 0.6) + (p.tr * t) / L + p.nz * eps[t]);
    }
    return x;
  }

  function zscore(x) {
    var m = 0,
      s = 0,
      t;
    for (t = 0; t < x.length; t++) m += x[t];
    m /= x.length;
    for (t = 0; t < x.length; t++) s += (x[t] - m) * (x[t] - m);
    s = Math.sqrt(s / x.length);
    return x.map(function (v) {
      return s > 1e-9 ? (v - m) / s : 0;
    });
  }

  // Real DFT magnitudes for k = 0..floor(L/2), scaled by 1/L.
  function rfftMag(x) {
    var mags = [];
    for (var k = 0; k < LF; k++) {
      var re = 0,
        im = 0;
      for (var t = 0; t < L; t++) {
        var a = (2 * Math.PI * k * t) / L;
        re += x[t] * Math.cos(a);
        im -= x[t] * Math.sin(a);
      }
      mags.push(Math.sqrt(re * re + im * im) / L);
    }
    return mags;
  }

  function el(name, attrs, text) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  }

  function draw(z, mags, peak) {
    while (svg.lastChild && svg.lastChild.nodeName !== "desc" && svg.lastChild.nodeName !== "title") svg.removeChild(svg.lastChild);
    var g = el("g", {});

    // top: the z-scored window
    var zMax = 3;
    function yT(v) {
      var c = Math.max(-zMax, Math.min(zMax, v));
      return (TOP.y0 + TOP.y1) / 2 - (c / zMax) * ((TOP.y1 - TOP.y0) / 2);
    }
    function xT(t) {
      return X0 + (t / (L - 1)) * (X1 - X0);
    }
    g.appendChild(el("text", { x: X0, y: 12, class: "pp-d-small" }, "input window, z-scored  (L = 96)"));
    [-2, 0, 2].forEach(function (v) {
      g.appendChild(el("line", { x1: X0, x2: X1, y1: yT(v), y2: yT(v), class: v === 0 ? "pp-kf-axis" : "pp-kf-grid" }));
      g.appendChild(el("text", { x: X0 - 8, y: yT(v) + 4, "text-anchor": "end", class: "pp-d-small" }, String(v)));
    });
    [0, 24, 48, 72].forEach(function (t) {
      g.appendChild(el("line", { x1: xT(t), x2: xT(t), y1: TOP.y0, y2: TOP.y1, class: "pp-kf-grid" }));
    });
    var d = z
      .map(function (v, t) {
        return (t ? "L" : "M") + xT(t).toFixed(1) + "," + yT(v).toFixed(1);
      })
      .join(" ");
    g.appendChild(el("path", { d: d, class: "pp-kf-line" }));

    // bottom: 49 magnitude bars
    var mMax = 0.75; // a z-scored pure sine peaks at sqrt(2)/2
    function yB(v) {
      return BOT.y1 - (Math.min(v, mMax) / mMax) * (BOT.y1 - BOT.y0);
    }
    var slot = (X1 - X0) / LF;
    function xB(k) {
      return X0 + (k + 0.5) * slot;
    }
    g.appendChild(el("text", { x: X0, y: BOT.y0 - 12, class: "pp-d-small" }, "magnitude |X̂ₖ| over 49 frequency tokens"));
    g.appendChild(el("line", { x1: X0, x2: X1, y1: BOT.y1, y2: BOT.y1, class: "pp-kf-axis" }));
    mags.forEach(function (m, k) {
      var y = yB(m);
      g.appendChild(
        el("rect", {
          x: xB(k) - slot * 0.34,
          y: y,
          width: slot * 0.68,
          height: Math.max(0.5, BOT.y1 - y),
          rx: 1.5,
          class: k === peak ? "pp-kf-bar" : "pp-sp-bar",
        })
      );
    });
    [0, 4, 8, 16, 24, 32, 40, 48].forEach(function (k) {
      g.appendChild(el("text", { x: xB(k), y: BOT.y1 + 15, "text-anchor": "middle", class: "pp-d-small" }, String(k)));
    });
    g.appendChild(el("text", { x: (X0 + X1) / 2, y: 324, "text-anchor": "middle", class: "pp-d-small" }, "frequency bin k   (period = 96 / k steps)"));
    if (peak > 0) {
      g.appendChild(
        el("text", { x: xB(peak) + 8, y: Math.max(BOT.y0 + 8, yB(mags[peak]) + 4), class: "pp-d-small pp-d-accent pp-d-halo" }, "k = " + peak)
      );
    }
    svg.appendChild(g);
  }

  function update() {
    var p = {
      a1: parseFloat(inputs.a1.value),
      a2: parseFloat(inputs.a2.value),
      tr: parseFloat(inputs.tr.value),
      nz: parseFloat(inputs.nz.value),
    };
    outs.a1.textContent = p.a1.toFixed(2);
    outs.a2.textContent = p.a2.toFixed(2);
    outs.tr.textContent = p.tr.toFixed(2);
    outs.nz.textContent = p.nz.toFixed(2);

    var z = zscore(series(p));
    var mags = rfftMag(z);

    var peak = 1;
    for (var k = 1; k < LF; k++) if (mags[k] > mags[peak]) peak = k;

    // Energy share in the two periodic bins (k = 4 and k = 8) versus everything else.
    var total = 0;
    for (k = 1; k < LF; k++) total += mags[k] * mags[k];
    var inCycles = total > 0 ? ((mags[4] * mags[4] + mags[8] * mags[8]) / total) * 100 : 0;

    draw(z, mags, p.a1 + p.a2 + p.tr + p.nz > 0 ? peak : -1);

    if (p.a1 + p.a2 + p.tr + p.nz === 0) {
      summary.innerHTML = "A flat window has no spectrum at all. Add a cycle, a trend or noise.";
      return;
    }
    var period = 96 / peak;
    summary.innerHTML =
      "The strongest bin is <b>k = " +
      peak +
      "</b>, a period of " +
      (Number.isInteger(period) ? period : period.toFixed(1)) +
      " steps. The two cycle bins (k = 4 and 8) hold <b>" +
      inCycles.toFixed(0) +
      "%</b> of the spectral energy; the remaining bins share the rest" +
      (p.tr > 0.5 ? ", and the trend leaks into the lowest bins." : ".");
  }

  Object.keys(inputs).forEach(function (key) {
    inputs[key].addEventListener("input", update);
  });
  update();
})();
