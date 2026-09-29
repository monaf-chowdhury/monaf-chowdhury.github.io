// Goal-representation project page: what random Fourier position features "see".
//
// Position features append [sin(2*pi*B*xy); cos(2*pi*B*xy)] with B (F x 2) drawn once from N(0, s^2).
// The inner product of two such codes is the kernel k(x, x') = (1/F) * sum_i cos(2*pi * b_i . (x - x')),
// which is what we paint: how similar each location's features are to the agent's.
// Wavelengths are in maze cells, matching the three settings reported in the paper (8.5, 2.1, 0.5 cells).
// For contrast, the "exact geodesic" mode uses the diagnostic state code: each cell's row of BFS distances
// to every free cell, standardised per landmark, compared by cosine similarity.
(function () {
  "use strict";

  var root = document.getElementById("pp-fourier");
  if (!root) return;

  var canvas = root.querySelector("canvas");
  var ctx = canvas.getContext("2d");
  var modeButtons = Array.prototype.slice.call(root.querySelectorAll("[data-mode]"));
  var modeText = root.querySelector("[data-mode-text]");
  var near = root.querySelector('[data-row="near"]');
  var far = root.querySelector('[data-row="far"]');

  // The large-maze layout used by antmaze-large (# = wall).
  var MAZE = [
    "############",
    "#....#.....#",
    "#.##.#.#.#.#",
    "#......#...#",
    "#.####.###.#",
    "#..#.#.....#",
    "##.#.#.#.###",
    "#..#...#...#",
    "############",
  ];
  var ROWS = MAZE.length;
  var COLS = MAZE[0].length;
  var CELL = 48; // css px per cell
  var SUB = 8; // samples per cell side
  var F = 128;

  function isFree(c, r) {
    return r >= 0 && r < ROWS && c >= 0 && c < COLS && MAZE[r].charAt(c) !== "#";
  }

  // Deterministic Gaussian draws (mulberry32 + Box-Muller) so the picture is stable across visits.
  function rng(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var rand = rng(20260930);
  function gauss() {
    var u = 1 - rand();
    var v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  var Z = [];
  for (var i = 0; i < F; i++) Z.push([gauss(), gauss()]);

  var MODES = {
    "8.5": {
      kind: "rff",
      wavelength: 8.5,
      text:
        "<b>Long wavelength (ς = 0.025).</b> Nearby positions keep similar features while distant ones separate. " +
        "This is the best setting in the paper: GCIVL reaches 83.9% on antmaze-large with DGR's learned goal representation.",
    },
    "2.1": {
      kind: "rff",
      wavelength: 2.1,
      text: "<b>Medium wavelength (ς = 0.1).</b> Similarity falls away within about a cell. Still a large gain over no features, but below the long wavelength.",
    },
    "0.5": {
      kind: "rff",
      wavelength: 0.5,
      text:
        "<b>Short wavelength (ς = 0.4).</b> Features decorrelate within a fraction of a cell, like a random code: states are separable " +
        "but all sense of proximity is gone. The weakest of the three.",
    },
    geo: {
      kind: "geo",
      text:
        "<b>Exact geodesic state code (diagnostic, needs the map).</b> It respects the walls, but it varies smoothly and nearly linearly, " +
        "so neighbouring cells look almost identical. In the paper it is the weakest state code: a random table does better.",
    },
  };

  // --- exact geodesic code: all-pairs BFS over free cells, z-scored per landmark ---
  var cells = [];
  var index = {};
  for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c < COLS; c++) {
      if (isFree(c, r)) {
        index[r + "," + c] = cells.length;
        cells.push([c, r]);
      }
    }
  }
  var N = cells.length;
  var D = [];
  for (var a = 0; a < N; a++) {
    var dist = new Array(N).fill(Infinity);
    dist[a] = 0;
    var queue = [a];
    for (var q = 0; q < queue.length; q++) {
      var cur = cells[queue[q]];
      [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].forEach(function (d) {
        var j = index[cur[1] + d[1] + "," + (cur[0] + d[0])];
        if (j !== undefined && dist[j] === Infinity) {
          dist[j] = dist[queue[q]] + 1;
          queue.push(j);
        }
      });
    }
    D.push(dist);
  }
  // code[cell][landmark] = standardised distance from landmark to cell
  var code = [];
  for (var cc = 0; cc < N; cc++) code.push(new Float64Array(N));
  for (var l = 0; l < N; l++) {
    var mean = 0;
    for (var k = 0; k < N; k++) mean += D[l][k];
    mean /= N;
    var sd = 0;
    for (k = 0; k < N; k++) sd += (D[l][k] - mean) * (D[l][k] - mean);
    sd = Math.sqrt(sd / N) || 1;
    for (k = 0; k < N; k++) code[k][l] = (D[l][k] - mean) / sd;
  }
  function cosine(u, v) {
    var dot = 0;
    var nu = 0;
    var nv = 0;
    for (var t = 0; t < u.length; t++) {
      dot += u[t] * v[t];
      nu += u[t] * u[t];
      nv += v[t] * v[t];
    }
    return dot / Math.sqrt(nu * nv);
  }

  // --- state ---
  var mode = "8.5";
  var agent = { x: 6.5, y: 3.5 };
  var colors = null;

  function readColors() {
    var cs = getComputedStyle(root);
    function hex(name, fallback) {
      var v = (cs.getPropertyValue(name) || fallback).trim();
      if (v.charAt(0) === "#" && v.length === 4) v = "#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
      return [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16)];
    }
    colors = {
      lo: hex("--pp-heat-0", "#f7f4fb"),
      hi: hex("--pp-heat-1", "#4f2f86"),
      wall: hex("--pp-maze-wall", "#3b424c"),
      accent: (cs.getPropertyValue("--pp-accent") || "#8a67c0").trim(),
      surface: (cs.getPropertyValue("--pp-surface") || "#fff").trim() || "#fff",
    };
  }

  function rgb(t) {
    t = Math.max(0, Math.min(1, t));
    t = Math.pow(t, 0.85);
    var lo = colors.lo;
    var hi = colors.hi;
    return "rgb(" + Math.round(lo[0] + (hi[0] - lo[0]) * t) + "," + Math.round(lo[1] + (hi[1] - lo[1]) * t) + "," + Math.round(lo[2] + (hi[2] - lo[2]) * t) + ")";
  }

  function frequencies(wavelength) {
    return Z.map(function (z) {
      return [z[0] / wavelength, z[1] / wavelength];
    });
  }

  function rffKernel(B, dx, dy) {
    var s = 0;
    for (var t = 0; t < B.length; t++) s += Math.cos(2 * Math.PI * (B[t][0] * dx + B[t][1] * dy));
    return s / B.length;
  }

  function sizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = COLS * CELL * dpr;
    canvas.height = ROWS * CELL * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function setRow(el, value) {
    if (!el) return;
    el.querySelector("[data-v]").textContent = (value >= 0 ? "" : "−") + Math.abs(value).toFixed(2);
    el.querySelector(".pp-readrow-bar").style.width = Math.max(0, Math.min(1, value)) * 100 + "%";
  }

  function draw() {
    if (!colors) readColors();
    var m = MODES[mode];
    var step = CELL / SUB;
    ctx.clearRect(0, 0, COLS * CELL, ROWS * CELL);

    if (m.kind === "rff") {
      var B = frequencies(m.wavelength);
      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          if (!isFree(c, r)) continue;
          for (var i = 0; i < SUB; i++) {
            for (var j = 0; j < SUB; j++) {
              var x = c + (j + 0.5) / SUB;
              var y = r + (i + 0.5) / SUB;
              ctx.fillStyle = rgb(rffKernel(B, x - agent.x, y - agent.y));
              ctx.fillRect(c * CELL + j * step, r * CELL + i * step, step + 0.5, step + 0.5);
            }
          }
        }
      }
      // Stationary kernel: report its average over directions at 1 and 3 cells.
      var ring = function (radius) {
        var s = 0;
        for (var a = 0; a < 16; a++) {
          var th = (a / 16) * 2 * Math.PI;
          s += rffKernel(B, radius * Math.cos(th), radius * Math.sin(th));
        }
        return s / 16;
      };
      setRow(near, ring(1));
      setRow(far, ring(3));
    } else {
      var here = index[Math.floor(agent.y) + "," + Math.floor(agent.x)];
      var sims = code.map(function (v) {
        return cosine(code[here], v);
      });
      cells.forEach(function (cell, idx) {
        ctx.fillStyle = rgb(sims[idx]);
        ctx.fillRect(cell[0] * CELL, cell[1] * CELL, CELL + 0.5, CELL + 0.5);
      });
      var avgAt = function (d) {
        var s = 0;
        var n = 0;
        for (var t = 0; t < N; t++) {
          if (D[here][t] === d) {
            s += sims[t];
            n++;
          }
        }
        return n ? s / n : NaN;
      };
      setRow(near, avgAt(1));
      var f = avgAt(3);
      setRow(far, isNaN(f) ? 0 : f);
    }

    // walls on top so heat never bleeds into them
    ctx.fillStyle = "rgb(" + colors.wall.join(",") + ")";
    for (var rr = 0; rr < ROWS; rr++) {
      for (var cc2 = 0; cc2 < COLS; cc2++) {
        if (!isFree(cc2, rr)) ctx.fillRect(cc2 * CELL, rr * CELL, CELL + 0.5, CELL + 0.5);
      }
    }

    // the agent
    ctx.beginPath();
    ctx.arc(agent.x * CELL, agent.y * CELL, 8, 0, 2 * Math.PI);
    ctx.fillStyle = colors.accent;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
  }

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(function () {
      pending = false;
      draw();
    });
  }

  function moveTo(x, y) {
    if (!isFree(Math.floor(x), Math.floor(y))) return;
    agent.x = x;
    agent.y = y;
    schedule();
  }

  function fromEvent(e) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * COLS,
      y: ((e.clientY - rect.top) / rect.height) * ROWS,
    };
  }

  var dragging = false;
  canvas.addEventListener("pointerdown", function (e) {
    dragging = true;
    if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
    var p = fromEvent(e);
    moveTo(p.x, p.y);
  });
  canvas.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var p = fromEvent(e);
    moveTo(p.x, p.y);
  });
  function stop() {
    dragging = false;
  }
  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointercancel", stop);

  canvas.addEventListener("keydown", function (e) {
    var d = { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, -0.25], ArrowDown: [0, 0.25] }[e.key];
    if (!d) return;
    e.preventDefault();
    moveTo(agent.x + d[0], agent.y + d[1]);
  });

  function selectMode(key) {
    mode = key;
    modeButtons.forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-mode") === key ? "true" : "false");
    });
    if (modeText) modeText.innerHTML = MODES[key].text;
    schedule();
  }
  modeButtons.forEach(function (b) {
    b.addEventListener("click", function () {
      selectMode(b.getAttribute("data-mode"));
    });
  });

  // Repaint with the right palette when the site theme flips.
  new MutationObserver(function () {
    readColors();
    schedule();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  sizeCanvas();
  window.addEventListener("resize", function () {
    sizeCanvas();
    schedule();
  });
  selectMode(mode);
})();
