// U-ActionNet project page: Fourier substance separation (Sec. III-B3) on a synthetic clip.
//   A(k) = sum_n f(n) e^{-2 pi i k n / T}      temporal DFT at every pixel
//   D    = sum_k |A(k)|^2 * |fr_k|^2            power weighted by squared frequency: moving pixels light up
//   S    = f ⊙ D                               keep what both moves and is salient (high activation)
// The "feature map" is a hand-made scene (grass, a parked car, one person), not model activations.
(function () {
  "use strict";

  var root = document.getElementById("pp-fss");
  if (!root) return;

  var W = 48,
    H = 30,
    T = 16;
  var panels = {
    f: root.querySelector('[data-panel="f"]'),
    d: root.querySelector('[data-panel="d"]'),
    s: root.querySelector('[data-panel="s"]'),
  };
  var actionBtns = root.querySelectorAll("[data-action]");
  var shakeIn = root.querySelector("[data-shake]");
  var frameIn = root.querySelector("[data-frame]");
  var frameOut = root.querySelector("[data-frame-out]");
  var playBtn = root.querySelector("[data-play]");
  var summary = root.querySelector("[data-fss-summary]");
  var rows = {
    actor: root.querySelector('[data-row="actor"]'),
    car: root.querySelector('[data-row="car"]'),
    bg: root.querySelector('[data-row="bg"]'),
  };

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Static grass texture on a field a little larger than the frame, so camera shake can move over it.
  var PAD = 3,
    FW = W + 2 * PAD,
    FH = H + 2 * PAD;
  var grass = new Float32Array(FW * FH);
  (function () {
    var rand = mulberry32(7);
    var coarse = [];
    var CW = Math.ceil(FW / 4) + 2,
      CH = Math.ceil(FH / 4) + 2;
    for (var i = 0; i < CW * CH; i++) coarse.push(rand());
    for (var y = 0; y < FH; y++)
      for (var x = 0; x < FW; x++) {
        var gx = x / 4,
          gy = y / 4,
          x0 = Math.floor(gx),
          y0 = Math.floor(gy),
          tx = gx - x0,
          ty = gy - y0;
        var a = coarse[y0 * CW + x0],
          b = coarse[y0 * CW + x0 + 1],
          c = coarse[(y0 + 1) * CW + x0],
          d = coarse[(y0 + 1) * CW + x0 + 1];
        var v = (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
        grass[y * FW + x] = 0.1 + 0.2 * v + 0.05 * rand();
      }
  })();

  var CAR = { x: 34, y: 5, w: 8, h: 5, v: 0.8 };

  // The person as a list of [dx, dy] cells relative to the feet, per action and frame.
  function person(action, t) {
    var cells = [
      [0, -7],
      [1, -7],
      [0, -6],
      [1, -6], // head
      [0, -5],
      [1, -5],
      [0, -4],
      [1, -4],
      [0, -3],
      [1, -3], // torso
    ];
    var x = 22;
    if (action === "walk") {
      x = 9 + Math.round(t * 1.25);
      var stride = t % 2 === 0;
      cells.push(stride ? [-1, -1] : [0, -2], stride ? [-1, 0] : [0, -1], stride ? [2, -1] : [1, -2], stride ? [2, 0] : [1, -1]);
      cells.push([-1, -4], [2, -4]);
    } else {
      cells.push([0, -2], [0, -1], [0, 0], [1, -2], [1, -1], [1, 0]);
      cells.push([-1, -4]);
      if (action === "wave") {
        // right arm swings between raised and level with a period of four frames
        var up = t % 4 < 2;
        cells.push(up ? [2, -6] : [2, -4], up ? [3, -7] : [3, -4], up ? [3, -8] : [4, -4]);
      } else {
        cells.push([2, -4]);
      }
    }
    return { x: x, y: 24, cells: cells };
  }

  function shakeAt(t) {
    // a jittery, repeatable camera path
    var dx = [0, 1, 1, 0, -1, -1, 0, 1, 0, -1, 0, 1, 1, 0, -1, 0][t];
    var dy = [0, 0, 1, 1, 0, -1, -1, 0, 1, 0, -1, 0, 1, 0, 0, -1][t];
    return { dx: dx, dy: dy };
  }

  function buildClip(action, shake) {
    var frames = [],
      actorMask = [],
      carMask = [];
    for (var t = 0; t < T; t++) {
      var s = shake ? shakeAt(t) : { dx: 0, dy: 0 };
      var f = new Float32Array(W * H),
        am = new Uint8Array(W * H),
        cm = new Uint8Array(W * H);
      for (var y = 0; y < H; y++)
        for (var x = 0; x < W; x++) f[y * W + x] = grass[(y + PAD - s.dy) * FW + (x + PAD - s.dx)];
      for (var cy = 0; cy < CAR.h; cy++)
        for (var cx = 0; cx < CAR.w; cx++) {
          var px = CAR.x + cx + s.dx,
            py = CAR.y + cy + s.dy;
          if (px >= 0 && px < W && py >= 0 && py < H) {
            f[py * W + px] = CAR.v;
            cm[py * W + px] = 1;
          }
        }
      var p = person(action, t);
      p.cells.forEach(function (c) {
        var px = p.x + c[0] + s.dx,
          py = p.y + c[1] + s.dy;
        if (px >= 0 && px < W && py >= 0 && py < H) {
          f[py * W + px] = 0.95;
          am[py * W + px] = 1;
          cm[py * W + px] = 0;
        }
      });
      frames.push(f);
      actorMask.push(am);
      carMask.push(cm);
    }
    return { frames: frames, actorMask: actorMask, carMask: carMask };
  }

  // Dynamic mask: temporal power at each pixel, weighted by squared (normalised) frequency.
  var COS = [],
    SIN = [];
  for (var k = 0; k <= T / 2; k++) {
    COS.push([]);
    SIN.push([]);
    for (var n = 0; n < T; n++) {
      COS[k].push(Math.cos((2 * Math.PI * k * n) / T));
      SIN[k].push(Math.sin((2 * Math.PI * k * n) / T));
    }
  }
  function dynamicMask(frames) {
    var D = new Float32Array(W * H);
    for (var i = 0; i < W * H; i++) {
      var acc = 0;
      for (var k = 1; k <= T / 2; k++) {
        var re = 0,
          im = 0;
        for (var n = 0; n < T; n++) {
          re += frames[n][i] * COS[k][n];
          im -= frames[n][i] * SIN[k][n];
        }
        var w = k / (T / 2);
        acc += (re * re + im * im) * w * w;
      }
      D[i] = acc / (T * T);
    }
    return D;
  }

  var REF = (function () {
    var D = dynamicMask(buildClip("walk", false).frames),
      m = 0;
    for (var i = 0; i < D.length; i++) m = Math.max(m, D[i]);
    return m;
  })();

  // Colour ramps: ink on paper for activations, paper to leaf green for the mask and the separated signal.
  var PAPER = [244, 239, 229],
    INK = [29, 26, 22],
    MID = [169, 199, 138],
    LEAF = [46, 84, 18];
  function mix(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }
  function inkRamp(v) {
    return mix(PAPER, INK, Math.max(0, Math.min(1, v)));
  }
  function leafRamp(v) {
    v = Math.pow(Math.max(0, Math.min(1, v)), 0.6);
    return v < 0.5 ? mix(PAPER, MID, v / 0.5) : mix(MID, LEAF, (v - 0.5) / 0.5);
  }

  function paint(canvas, values, ramp, scale) {
    var ctx = canvas.getContext("2d");
    var img = ctx.createImageData(W, H);
    for (var i = 0; i < W * H; i++) {
      var c = ramp(values[i] / scale);
      img.data[4 * i] = c[0];
      img.data[4 * i + 1] = c[1];
      img.data[4 * i + 2] = c[2];
      img.data[4 * i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }

  var state = { action: "walk", shake: false, t: 0 };
  var clip, D, dScale, sScale, shares;

  function recompute() {
    clip = buildClip(state.action, state.shake);
    D = dynamicMask(clip.frames);
    // Regions over the whole clip: everywhere the person goes, the car (wherever the shake puts it), and the rest.
    var path = new Uint8Array(W * H),
      car = new Uint8Array(W * H);
    for (var t = 0; t < T; t++)
      for (var j = 0; j < W * H; j++) {
        if (clip.actorMask[t][j]) path[j] = 1;
        if (clip.carMask[t][j]) car[j] = 1;
      }
    var dMax = 0,
      sMax = 0,
      area = 0;
    var sum = { actor: 0, car: 0, bg: 0 };
    for (var i = 0; i < W * H; i++) {
      dMax = Math.max(dMax, D[i]);
      area += path[i];
    }
    for (t = 0; t < T; t++) {
      var f = clip.frames[t];
      for (j = 0; j < W * H; j++) {
        var s = f[j] * D[j];
        sMax = Math.max(sMax, s);
        if (path[j]) sum.actor += s;
        else if (car[j]) sum.car += s;
        else sum.bg += s;
      }
    }
    // A floor keeps a scene with almost no motion from being stretched into noise.
    dScale = Math.max(dMax, 0.25 * REF);
    sScale = Math.max(sMax, 0.25 * REF * 0.95);
    // A clip with no motion leaves only floating-point residue in the mask; treat it as empty.
    var total = sum.actor + sum.car + sum.bg;
    var moving = total > 1e-6 * REF;
    shares = {
      actor: moving ? sum.actor / total : 0,
      car: moving ? sum.car / total : 0,
      bg: moving ? sum.bg / total : 0,
      area: area / (W * H),
      moving: moving,
    };
    paint(panels.d, D, leafRamp, dScale);
    updateReadout();
    drawFrame();
  }

  function drawFrame() {
    var f = clip.frames[state.t];
    var S = new Float32Array(W * H);
    for (var i = 0; i < W * H; i++) S[i] = f[i] * D[i];
    paint(panels.f, f, inkRamp, 1);
    paint(panels.s, S, leafRamp, sScale);
    frameIn.value = String(state.t);
    frameOut.textContent = state.t + 1 + " / " + T;
  }

  function pct(x) {
    return (x * 100).toFixed(0) + "%";
  }

  function updateReadout() {
    ["actor", "car", "bg"].forEach(function (key) {
      rows[key].querySelector("[data-n]").textContent = pct(shares[key]);
      rows[key].querySelector(".pp-readrow-bar").style.width = (shares[key] * 100).toFixed(1) + "%";
    });
    var a = pct(shares.actor),
      area = pct(shares.area),
      car = pct(shares.car);
    var why = " This branch detects motion, not people, which is why it runs alongside the person crop and the self-attention branch.";
    var text;
    if (!shares.moving) {
      text = "Nothing in this clip moves, so the mask is empty and nothing is separated." + why;
    } else if (state.action === "still") {
      text =
        "With the person still and the camera shaking, only edges flicker: the person's region holds <b>" +
        a +
        "</b> of the separated signal and the car's outline <b>" +
        car +
        "</b>." +
        why;
    } else if (state.shake) {
      text =
        "The shake makes every edge flicker, so the car's outline and the grass texture light up in the mask too. Weighting by activation still leaves <b>" +
        a +
        "</b> where the person moves, while the bright car takes <b>" +
        car +
        "</b>: moving pixels are not only people, which is why the mask is multiplied by the activations, and why the clip is cropped to its people first.";
    } else if (state.action === "wave") {
      text =
        "Only the waving arm changes over time, so the mask lights up the arm and leaves the still body dark. The region the person occupies holds <b>" +
        a +
        "</b> of the separated signal.";
    } else {
      text =
        "The person's path covers <b>" +
        area +
        "</b> of the frame but holds <b>" +
        a +
        "</b> of the separated signal. The parked car is just as salient but static, so the mask removes it; the grass is neither.";
    }
    summary.innerHTML = text;
  }

  var timer = null;
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    playBtn.setAttribute("aria-pressed", "false");
    playBtn.setAttribute("aria-label", "Play the clip");
    playBtn.textContent = "▶";
  }
  function play() {
    playBtn.setAttribute("aria-pressed", "true");
    playBtn.setAttribute("aria-label", "Pause the clip");
    playBtn.textContent = "❚❚";
    timer = setInterval(function () {
      state.t = (state.t + 1) % T;
      drawFrame();
    }, 170);
  }

  playBtn.addEventListener("click", function () {
    if (timer) stop();
    else play();
  });
  frameIn.addEventListener("input", function () {
    stop();
    state.t = parseInt(frameIn.value, 10);
    drawFrame();
  });
  shakeIn.addEventListener("change", function () {
    state.shake = shakeIn.checked;
    recompute();
  });
  Array.prototype.forEach.call(actionBtns, function (btn) {
    btn.addEventListener("click", function () {
      state.action = btn.getAttribute("data-action");
      Array.prototype.forEach.call(actionBtns, function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      recompute();
    });
  });

  recompute();
})();
