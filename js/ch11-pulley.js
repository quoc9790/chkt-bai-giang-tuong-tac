(function () {
  const canvas = document.getElementById("ch11b-canvas");
  const ctx = canvas.getContext("2d");
  const section = document.getElementById("ch11");

  const m1Slider = document.getElementById("ch11b-m1");
  const m2Slider = document.getElementById("ch11b-m2");
  const m3Slider = document.getElementById("ch11b-m3");
  const alphaSlider = document.getElementById("ch11b-alpha");
  const vSlider = document.getElementById("ch11b-v");
  const m1Val = document.getElementById("ch11b-m1-val");
  const m2Val = document.getElementById("ch11b-m2-val");
  const m3Val = document.getElementById("ch11b-m3-val");
  const alphaVal = document.getElementById("ch11b-alpha-val");
  const vVal = document.getElementById("ch11b-v-val");
  const readout = document.getElementById("ch11b-readout");

  const scale = 110; // px per metre
  const groundY = 330;
  const X0 = 90; // fixed baseline x for the prism's D corner
  const LKL = 1.5; // incline length KL (m), also used as top length EK

  let s = 0;

  function params() {
    return {
      m1: parseFloat(m1Slider.value),
      m2: parseFloat(m2Slider.value),
      m3: parseFloat(m3Slider.value),
      alpha: (parseFloat(alphaSlider.value) * Math.PI) / 180,
      v: parseFloat(vSlider.value),
    };
  }

  function draw() {
    const p = params();
    const delta = (-s * (p.m1 * Math.cos(p.alpha) + p.m2)) / (p.m1 + p.m2 + p.m3);

    const h = LKL * Math.sin(p.alpha);
    const w2 = LKL * Math.cos(p.alpha);
    const w1 = LKL;
    const originX = X0 + delta * scale;

    // prism corners (canvas px)
    const D = [originX, groundY];
    const E = [originX, groundY - h * scale];
    const K = [originX + w1 * scale, groundY - h * scale];
    const L = [originX + (w1 + w2) * scale, groundY];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ground
    ctx.strokeStyle = "#5b7096";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();
    ctx.strokeStyle = "#3a4d78";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x - 6, groundY + 8);
      ctx.stroke();
    }

    // prism DEKL
    ctx.fillStyle = "rgba(207,227,255,0.15)";
    ctx.strokeStyle = "#cfe3ff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(D[0], D[1]);
    ctx.lineTo(E[0], E[1]);
    ctx.lineTo(K[0], K[1]);
    ctx.lineTo(L[0], L[1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#9fb0cc";
    ctx.font = "12px sans-serif";
    ctx.fillText("D", D[0] - 14, D[1] + 4);
    ctx.fillText("E", E[0] - 14, E[1] + 4);
    ctx.fillText("K", K[0] + 4, K[1] - 8);
    ctx.fillText("L", L[0] + 6, L[1] + 4);

    // angle marker at L
    ctx.strokeStyle = "#9fb0cc";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(L[0], L[1], 26, Math.PI, Math.PI + p.alpha, false);
    ctx.stroke();
    ctx.fillText("α", L[0] - 34, L[1] - 6);

    // block A on incline KL, at distance s from K
    const Ax = K[0] + s * Math.cos(p.alpha) * scale;
    const Ay = K[1] + s * Math.sin(p.alpha) * scale;
    const box = 30;
    const nAx = Math.sin(p.alpha), nAy = -Math.cos(p.alpha);
    const Acx = Ax + nAx * box * 0.5, Acy = Ay + nAy * box * 0.5; // centre of A
    ctx.save();
    ctx.translate(Acx, Acy);
    ctx.rotate(p.alpha);
    ctx.fillStyle = "#f6ad55";
    ctx.fillRect(-box / 2, -box / 2, box, box);
    ctx.strokeStyle = "#5b7096";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-box / 2, -box / 2, box, box);
    ctx.restore();
    ctx.fillStyle = "#e6ecf5";
    ctx.fillText("A", Ax + 8, Ay - 4);

    // block B on top EK, at distance s from E toward K
    const Bx = E[0] + s * scale;
    const By = E[1];
    const Bcx = Bx, Bcy = By - box / 2; // centre of B
    ctx.fillStyle = "#fc8181";
    ctx.fillRect(Bx - box / 2, By - box, box, box);
    ctx.strokeStyle = "#5b7096";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(Bx - box / 2, By - box, box, box);
    ctx.fillStyle = "#e6ecf5";
    ctx.fillText("B", Bx + box / 2 + 2, By - box / 2);

    // cord: each straight run stays parallel to its own surface (constant
    // perpendicular offset = box/2, same as each block's own centre height),
    // meeting at the pulley over a short link near K
    const nBx = 0, nBy = -1; // outward normal of the horizontal top EK
    const PA = [K[0] + nAx * box * 0.5, K[1] + nAy * box * 0.5];
    const PB = [K[0] + nBx * box * 0.5, K[1] + nBy * box * 0.5];

    ctx.strokeStyle = "#9fb0cc";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(Acx, Acy);
    ctx.lineTo(PA[0], PA[1]);
    ctx.lineTo(PB[0], PB[1]);
    ctx.lineTo(Bcx, Bcy);
    ctx.stroke();

    // pulley wheel at K
    ctx.strokeStyle = "#e6ecf5";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(K[0], K[1], box * 0.5, 0, Math.PI * 2);
    ctx.stroke();

    readout.textContent =
      `s = ${s.toFixed(2)} m      Δ (di chuyển lăng trụ) = ${delta.toFixed(3)} m`;
  }

  function loop(ts) {
    if (draw._lastTs === undefined) draw._lastTs = ts;
    const dt = Math.min((ts - draw._lastTs) / 1000, 0.05);
    draw._lastTs = ts;

    if (section.classList.contains("active")) {
      const p = params();
      s += p.v * dt;
      if (s > LKL) s = 0;
      draw();
    }
    requestAnimationFrame(loop);
  }

  function syncLabels() {
    m1Val.textContent = parseFloat(m1Slider.value).toFixed(1);
    m2Val.textContent = parseFloat(m2Slider.value).toFixed(1);
    m3Val.textContent = parseFloat(m3Slider.value).toFixed(1);
    alphaVal.textContent = alphaSlider.value;
    vVal.textContent = parseFloat(vSlider.value).toFixed(2);
  }

  [m1Slider, m2Slider, m3Slider, alphaSlider, vSlider].forEach((el) =>
    el.addEventListener("input", syncLabels)
  );

  syncLabels();
  requestAnimationFrame(loop);
})();
