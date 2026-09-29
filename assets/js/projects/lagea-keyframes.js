// LAGEA project page: key-frame selection and credit weights (Sec. 3.1.2) on an illustrative episode.
//   s_t = cos(x_t, g), v_t = s_t - s_{t-1}, a_t = v_t - v_{t-1}, v_0 = a_0 = 0
//   p_t = w_s [z(s_t)]_+ + w_v z(|v_t|) + w_a z(|a_t|)             (z: per-episode z-score)
//   K   = both endpoints + up to M most salient steps, at least MIN_GAP apart
//   w~_t = max_k (1 - |t - k| / (h + 1))_+,  w_t = beta + (1 - beta) w~_t,  w^_t = w_t / mean(w)
(function () {
  "use strict";

  var root = document.getElementById("pp-keyframes");
  if (!root) return;

  var svg = root.querySelector("[data-kf-plot]");
  var mIn = root.querySelector("[data-m]");
  var hIn = root.querySelector("[data-h]");
  var bIn = root.querySelector("[data-b]");
  var mOut = root.querySelector("[data-m-out]");
  var hOut = root.querySelector("[data-h-out]");
  var bOut = root.querySelector("[data-b-out]");
  var summary = root.querySelector("[data-kf-summary]");

  var T = 64;
  var W_S = 0.5,
    W_V = 0.3,
    W_A = 0.2;
  var MIN_GAP = 5;
  var NS = "http://www.w3.org/2000/svg";

  // Plot geometry (viewBox 720 x 330).
  var X0 = 58,
    X1 = 706;
  var TOP = { y0: 20, y1: 138 }; // goal similarity
  var BOT = { y0: 186, y1: 292 }; // credit weight

  function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  // Deterministic small wiggle so the demo looks like a real signal but never changes between visits.
  function wiggle(t) {
    return 0.012 * Math.sin(t * 1.7) + 0.008 * Math.sin(t * 4.1 + 1.3);
  }

  // An approach, a slip away from the goal, then contact and a settle near the goal.
  var s = [];
  for (var t = 0; t < T; t++) {
    var v = 0.12 + 0.42 * sigmoid((t - 13) / 2.6) - 0.3 * Math.exp(-Math.pow((t - 29) / 3.2, 2)) + 0.32 * sigmoid((t - 44) / 1.6) + wiggle(t);
    s.push(Math.max(-1, Math.min(1, v)));
  }

  function zscore(xs) {
    var n = xs.length,
      mean = 0,
      sd = 0,
      i;
    for (i = 0; i < n; i++) mean += xs[i];
    mean /= n;
    for (i = 0; i < n; i++) sd += (xs[i] - mean) * (xs[i] - mean);
    sd = Math.sqrt(sd / n) || 1;
    return xs.map(function (x) {
      return (x - mean) / sd;
    });
  }

  var vel = [0],
    acc = [0, 0];
  for (t = 1; t < T; t++) vel.push(s[t] - s[t - 1]);
  for (t = 2; t < T; t++) acc.push(vel[t] - vel[t - 1]);
  var zs = zscore(s);
  var zv = zscore(vel.map(Math.abs));
  var za = zscore(acc.map(Math.abs));
  var saliency = s.map(function (_, i) {
    return W_S * Math.max(0, zs[i]) + W_V * zv[i] + W_A * za[i];
  });

  function keyframes(M) {
    var order = saliency
      .map(function (p, i) {
        return i;
      })
      .sort(function (a, b) {
        return saliency[b] - saliency[a];
      });
    var chosen = [];
    for (var j = 0; j < order.length && chosen.length < M; j++) {
      var i = order[j];
      if (i === 0 || i === T - 1) continue;
      var ok = chosen.every(function (k) {
        return Math.abs(k - i) >= MIN_GAP;
      });
      if (ok) chosen.push(i);
    }
    return chosen.sort(function (a, b) {
      return a - b;
    });
  }

  function weights(K, h, beta) {
    var w = [];
    for (var t = 0; t < T; t++) {
      var best = 0;
      for (var j = 0; j < K.length; j++) best = Math.max(best, 1 - Math.abs(t - K[j]) / (h + 1));
      w.push(beta + (1 - beta) * Math.max(0, best));
    }
    var mean =
      w.reduce(function (a, b) {
        return a + b;
      }, 0) / T;
    return w.map(function (x) {
      return x / mean;
    });
  }

  function el(name, attrs, text) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  }

  function xAt(t) {
    return X0 + (t / (T - 1)) * (X1 - X0);
  }

  var S_MIN = 0,
    S_MAX = 1;
  function ySim(v) {
    return TOP.y1 - ((v - S_MIN) / (S_MAX - S_MIN)) * (TOP.y1 - TOP.y0);
  }

  function draw(K, w) {
    while (svg.lastChild && svg.lastChild.nodeName !== "desc" && svg.lastChild.nodeName !== "title") svg.removeChild(svg.lastChild);
    // keep <title> and <desc> (first two children)
    var g = el("g", {});

    // --- top panel: goal similarity ---
    [0, 0.5, 1].forEach(function (v) {
      g.appendChild(el("line", { x1: X0, x2: X1, y1: ySim(v), y2: ySim(v), class: "pp-kf-grid" }));
      g.appendChild(el("text", { x: X0 - 8, y: ySim(v) + 4, "text-anchor": "end", class: "pp-d-small" }, v.toFixed(1)));
    });
    g.appendChild(el("text", { x: X0, y: 12, class: "pp-d-small" }, "goal similarity sₜ"));

    // key-frame guides spanning both panels
    var allK = [0].concat(K, [T - 1]);
    allK.forEach(function (k) {
      var isEnd = k === 0 || k === T - 1;
      g.appendChild(
        el("line", { x1: xAt(k), x2: xAt(k), y1: TOP.y0 - 4, y2: BOT.y1, class: isEnd ? "pp-kf-guide is-end" : "pp-kf-guide" })
      );
    });

    var d = s
      .map(function (v, i) {
        return (i ? "L" : "M") + xAt(i).toFixed(1) + "," + ySim(v).toFixed(1);
      })
      .join(" ");
    g.appendChild(el("path", { d: d, class: "pp-kf-line" }));

    allK.forEach(function (k) {
      var isEnd = k === 0 || k === T - 1;
      g.appendChild(el("circle", { cx: xAt(k), cy: ySim(s[k]), r: isEnd ? 4 : 5.5, class: isEnd ? "pp-kf-dot is-end" : "pp-kf-dot" }));
    });

    // story labels
    [
      [12, "approach"],
      [29, "slips away"],
      [44, "contact"],
    ].forEach(function (a) {
      g.appendChild(el("text", { x: xAt(a[0]), y: TOP.y1 + 16, "text-anchor": "middle", class: "pp-d-small pp-d-halo" }, a[1]));
    });

    // --- bottom panel: credit weights ---
    var wMax = Math.max(3, Math.ceil(Math.max.apply(null, w)));
    function yW(v) {
      return BOT.y1 - (v / wMax) * (BOT.y1 - BOT.y0);
    }
    g.appendChild(el("text", { x: X0, y: BOT.y0 - 10, class: "pp-d-small pp-d-halo" }, "credit weight ŵₜ"));
    [0, wMax].forEach(function (v) {
      g.appendChild(el("text", { x: X0 - 8, y: yW(v) + 4, "text-anchor": "end", class: "pp-d-small" }, String(v)));
    });
    g.appendChild(el("line", { x1: X0, x2: X1, y1: yW(0), y2: yW(0), class: "pp-kf-axis" }));

    var bw = ((X1 - X0) / T) * 0.72;
    w.forEach(function (v, i) {
      var y = yW(v);
      g.appendChild(el("rect", { x: xAt(i) - bw / 2, y: y, width: bw, height: Math.max(0.5, yW(0) - y), rx: 1.5, class: "pp-kf-bar" }));
    });
    g.appendChild(el("line", { x1: X0, x2: X1, y1: yW(1), y2: yW(1), class: "pp-kf-uniform" }));
    // legend for the dashed reference line, kept above the bars
    g.appendChild(el("line", { x1: X1 - 196, x2: X1 - 172, y1: BOT.y0 - 14, y2: BOT.y0 - 14, class: "pp-kf-uniform" }));
    g.appendChild(el("text", { x: X1, y: BOT.y0 - 10, "text-anchor": "end", class: "pp-d-small" }, "uniform broadcast (= 1)"));
    g.appendChild(el("text", { x: (X0 + X1) / 2, y: 322, "text-anchor": "middle", class: "pp-d-small" }, "time step t  (64-step episode)"));

    svg.appendChild(g);
  }

  function update() {
    var M = parseInt(mIn.value, 10);
    var h = parseInt(hIn.value, 10);
    var beta = parseFloat(bIn.value);
    var K = keyframes(M);
    var w = weights(K, h, beta);
    draw(K, w);

    mOut.textContent = String(M);
    hOut.textContent = h + (h === 1 ? " step" : " steps");
    bOut.textContent = beta.toFixed(2);

    var sorted = w.slice().sort(function (a, b) {
      return b - a;
    });
    var quarter = Math.round(T / 4);
    var top = 0;
    for (var i = 0; i < quarter; i++) top += sorted[i];
    var share = (top / T) * 100; // weights have unit mean, so the total is T

    summary.innerHTML =
      "Key frames at steps <b>" +
      [0].concat(K, [T - 1]).join(", ") +
      "</b> (endpoints always kept). The busiest quarter of the episode now carries <b>" +
      share.toFixed(0) +
      "%</b> of the feedback credit, where a uniform broadcast would give it 25%. " +
      (beta > 0
        ? "The floor β keeps every step at a weight of at least " + Math.min.apply(null, w).toFixed(2) + "."
        : "With β = 0, steps far from every key frame get no feedback credit at all.");
  }

  [mIn, hIn, bIn].forEach(function (input) {
    input.addEventListener("input", update);
  });
  update();
})();
