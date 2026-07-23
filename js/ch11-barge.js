(function () {
  const canvas = document.getElementById("ch11c-canvas");
  const ctx = canvas.getContext("2d");
  const section = document.getElementById("ch11");

  const mSlider = document.getElementById("ch11c-m");
  const MSlider = document.getElementById("ch11c-M");
  const bSlider = document.getElementById("ch11c-b");
  const alphaSlider = document.getElementById("ch11c-alpha");
  const mooredBox = document.getElementById("ch11c-moored");
  const mVal = document.getElementById("ch11c-m-val");
  const MVal = document.getElementById("ch11c-M-val");
  const bVal = document.getElementById("ch11c-b-val");
  const alphaVal = document.getElementById("ch11c-alpha-val");
  const readout = document.getElementById("ch11c-readout");

  const scale = 90; // px per metre
  const waterY = 220;
  const bargeOriginX0 = 200; // fixed baseline x for barge's left edge (canvas px)
  const bargeW = 3.9; // m, visual width
  const carW = 0.525; // m
  const S_MAX = 1.9; // m, relative travel before looping

  let t = 0;

  function params() {
    return {
      m: parseFloat(mSlider.value),
      M: parseFloat(MSlider.value),
      b: parseFloat(bSlider.value),
      alpha: parseFloat(alphaSlider.value),
      moored: mooredBox.checked,
    };
  }

  function sOf(p, tt) {
    return p.b * (p.alpha * tt + Math.exp(-p.alpha * tt) - 1);
  }
  function vRelOf(p, tt) {
    return p.b * p.alpha * (1 - Math.exp(-p.alpha * tt));
  }
  function aRelOf(p, tt) {
    return p.b * p.alpha * p.alpha * Math.exp(-p.alpha * tt);
  }

  function drawWater() {
    ctx.fillStyle = "#0e2a3d";
    ctx.fillRect(0, waterY, canvas.width, canvas.height - waterY);
    ctx.strokeStyle = "#1c4a63";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += 8) {
        const y = waterY + 10 + i * 14 + Math.sin(x * 0.06 + i) * 2;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  function draw() {
    const p = params();
    const s = sOf(p, t);
    const X = p.moored ? 0 : (-p.m / (p.m + p.M)) * s;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWater();

    const bargeX = bargeOriginX0 + X * scale;
    const bargeH = 51;

    // mooring line + dock, if moored
    if (p.moored) {
      ctx.fillStyle = "#5b7096";
      ctx.fillRect(30, waterY - 60, 14, 60);
      ctx.strokeStyle = "#fc8181";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(44, waterY - 10);
      ctx.lineTo(bargeX, waterY - bargeH * 0.5);
      ctx.stroke();
    }

    // barge hull (trapezoid sitting on the waterline)
    const bx0 = bargeX, bx1 = bargeX + bargeW * scale;
    const topY = waterY - bargeH, botY = waterY + 8;
    ctx.fillStyle = "#f6ad55";
    ctx.strokeStyle = "#5b7096";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx0 + 10, topY);
    ctx.lineTo(bx1 - 10, topY);
    ctx.lineTo(bx1, botY);
    ctx.lineTo(bx0, botY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#0b1220";
    ctx.font = "13px sans-serif";
    ctx.fillText("M", bx0 + bargeW * scale * 0.5 - 4, topY + 22);

    // car on the barge deck, at relative position s
    const carX = bargeX + 0.3 * scale + s * scale;
    const carY = topY;
    const cw = carW * scale, ch = 27;
    ctx.fillStyle = "#4fd1c5";
    ctx.fillRect(carX - cw / 2, carY - ch, cw, ch);
    ctx.strokeStyle = "#0b1220";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(carX - cw / 2, carY - ch, cw, ch);
    ctx.fillStyle = "#e6ecf5";
    ctx.font = "12px sans-serif";
    ctx.fillText("m", carX - 4, carY - ch - 4);

    if (p.moored) {
      const T = p.m * aRelOf(p, t);
      readout.textContent =
        `(Neo cố định) T(t) = ${T.toFixed(2)} N      s(t) = ${s.toFixed(2)} m`;
    } else {
      const vBarge = (-p.m / (p.m + p.M)) * vRelOf(p, t);
      readout.textContent =
        `(Tự do) v_xà lan(t) = ${vBarge.toFixed(3)} m/s      s(t) = ${s.toFixed(2)} m`;
    }
  }

  function loop(ts) {
    if (draw._lastTs === undefined) draw._lastTs = ts;
    const dt = Math.min((ts - draw._lastTs) / 1000, 0.05);
    draw._lastTs = ts;

    if (section.classList.contains("active")) {
      const p = params();
      t += dt;
      if (sOf(p, t) > S_MAX) t = 0;
      draw();
    }
    requestAnimationFrame(loop);
  }

  function syncLabels() {
    mVal.textContent = parseFloat(mSlider.value).toFixed(1);
    MVal.textContent = MSlider.value;
    bVal.textContent = parseFloat(bSlider.value).toFixed(2);
    alphaVal.textContent = parseFloat(alphaSlider.value).toFixed(2);
  }

  [mSlider, MSlider, bSlider, alphaSlider].forEach((el) => el.addEventListener("input", syncLabels));
  mooredBox.addEventListener("change", () => { t = 0; });

  syncLabels();
  requestAnimationFrame(loop);
})();
