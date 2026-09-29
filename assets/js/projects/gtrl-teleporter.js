// GTRL project page: the teleporter of Example 1, computed exactly.
// From s, one action reaches A or B with probability 1/2. A is one step from g; B is L steps from g.
//   transitive fixed point  V_DC = gamma^2              (d_G(s, g) = 2)
//   optimal value           V*   = 1/2 gamma^2 + 1/2 gamma^(L+1)
//   one-step TD target      gamma * E[V*(s', g)] = gamma * (1/2 gamma + 1/2 gamma^L) = V*
(function () {
  "use strict";

  var root = document.getElementById("pp-teleporter");
  if (!root) return;

  var gammaIn = root.querySelector("[data-gamma]");
  var lenIn = root.querySelector("[data-len]");
  var gammaOut = root.querySelector("[data-gamma-out]");
  var lenOut = root.querySelector("[data-len-out]");
  var corridorLabel = root.querySelector("[data-corridor-label]");
  var summary = root.querySelector("[data-summary]");
  var SCALE_STEPS = 22; // fixed bar scale: the largest implied distance at L = 40 is (2 + 41) / 2 < 22

  function row(name) {
    var el = root.querySelector('[data-row="' + name + '"]');
    return { v: el.querySelector("[data-v]"), d: el.querySelector("[data-d]"), bar: el.querySelector(".pp-readrow-bar") };
  }
  var rows = { dc: row("dc"), truth: row("truth"), td: row("td") };

  function distance(v, gamma) {
    return Math.log(v) / Math.log(gamma);
  }

  function paint(r, v, d) {
    r.v.textContent = v.toFixed(3);
    r.d.textContent = d.toFixed(1);
    r.bar.style.width = Math.min(100, (d / SCALE_STEPS) * 100) + "%";
  }

  function update() {
    var gamma = parseFloat(gammaIn.value);
    var L = parseInt(lenIn.value, 10);

    var vDC = gamma * gamma;
    var vStar = 0.5 * gamma * gamma + 0.5 * Math.pow(gamma, L + 1);
    var vTD = gamma * (0.5 * gamma + 0.5 * Math.pow(gamma, L));

    var dDC = distance(vDC, gamma);
    var dStar = distance(vStar, gamma);

    paint(rows.dc, vDC, dDC);
    paint(rows.truth, vStar, dStar);
    paint(rows.td, vTD, distance(vTD, gamma));

    gammaOut.textContent = gamma.toFixed(3);
    var steps = L === 1 ? " step" : " steps";
    lenOut.textContent = L + steps;
    if (corridorLabel) corridorLabel.textContent = L + steps;

    if (dStar - dDC < 0.05) {
      summary.innerHTML =
        "With a one-step corridor both branches are equally short, so the randomness costs nothing and the transitive rule is exact. " +
        "Lengthen the corridor to see the gap open.";
    } else {
      summary.innerHTML =
        "The transitive rule reports <b>" +
        dDC.toFixed(1) +
        " steps</b>; the truth is <b>" +
        dStar.toFixed(1) +
        "</b>. It overestimates the value by " +
        (vDC - vStar).toFixed(3) +
        ", and no amount of extra data closes that gap. A one-step target that averages over both successors recovers the true value, " +
        "which is the fix GTRL builds on.";
    }
  }

  gammaIn.addEventListener("input", update);
  lenIn.addEventListener("input", update);
  update();
})();
