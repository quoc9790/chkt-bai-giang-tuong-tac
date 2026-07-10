(function () {
  const canvas = document.getElementById("ch8b-canvas");
  const ctx = canvas.getContext("2d");
  const section = document.getElementById("ch8");

  const vBSlider = document.getElementById("ch8b-vB");
  const rSlider = document.getElementById("ch8b-r");
  const RSlider = document.getElementById("ch8b-R");
  const vBVal = document.getElementById("ch8b-vB-val");
  const rVal = document.getElementById("ch8b-r-val");
  const RVal = document.getElementById("ch8b-R-val");
  const readout = document.getElementById("ch8b-readout");

  const scale = 300; // px per metre (small radii, need a large scale)
  const lineX = 220; // fixed x of the vertical string
  const Ay = 40;      // fixed point A (top)
  const yTop = 90;    // where B starts each loop
  const yBottom = 340; // where B resets

  let yB = yTop;
  let phi = 0;
  let lastTs = null;

  function params() {
    return {
      vB: parseFloat(vBSlider.value),
      r: parseFloat(rSlider.value),
      R: parseFloat(RSlider.value),
    };
  }

  function drawArrow(x1, y1, x2, y2, color, width) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len < 1) return;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    const ah = 8;
    const ang = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - ah * Math.cos(ang - 0.4), y2 - ah * Math.sin(ang - 0.4));
    ctx.lineTo(x2 - ah * Math.cos(ang + 0.4), y2 - ah * Math.sin(ang + 0.4));
    ctx.closePath();
    ctx.fill();
  }

  function draw() {
    const p = params();
    const rpx = p.r * scale;
    const Rpx = p.R * scale;
    const Bx = lineX + rpx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // fixed support at A
    ctx.strokeStyle = "#5b7096";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lineX - 12, Ay - 8);
    ctx.lineTo(lineX + 12, Ay - 8);
    ctx.moveTo(lineX, Ay - 8);
    ctx.lineTo(lineX, Ay);
    ctx.stroke();
    ctx.fillStyle = "#e6ecf5";
    ctx.font = "12px sans-serif";
    ctx.fillText("A", lineX - 18, Ay - 4);

    // taut string from A down to P
    ctx.strokeStyle = "#9fb0cc";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lineX, Ay);
    ctx.lineTo(lineX, yB);
    ctx.stroke();

    // outer + inner circles
    ctx.strokeStyle = "#cfe3ff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(Bx, yB, Rpx, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(Bx, yB, rpx, 0, Math.PI * 2);
    ctx.stroke();

    // spokes (rotation indicator, drawn on the outer circle)
    for (let k = 0; k < 4; k++) {
      const a = phi + (k * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(Bx, yB);
      ctx.lineTo(Bx + Rpx * Math.cos(a), yB + Rpx * Math.sin(a));
      ctx.strokeStyle = "#3a4d78";
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }

    // key points
    const Px = lineX, Py = yB;
    const Dx = Bx + Rpx, Dy = yB;

    ctx.fillStyle = "#e6ecf5";
    ctx.beginPath(); ctx.arc(Bx, yB, 3, 0, 7); ctx.fill();
    ctx.fillText("B", Bx + 6, yB - 8);
    ctx.beginPath(); ctx.arc(Px, Py, 3, 0, 7); ctx.fill();
    ctx.fillText("P", Px - 16, Py + 4);
    ctx.beginPath(); ctx.arc(Dx, Dy, 3, 0, 7); ctx.fill();
    ctx.fillText("D", Dx + 6, Dy + 4);

    // velocities (all vertical, since B moves straight down and P is the ICR)
    const omega = p.vB / p.r;
    const vD = p.vB + omega * p.R; // = vB * (R + r) / r, derived via v_D = v_B + ω×BD

    const vscale = 40; // px per (m/s)
    // P ~ 0 (small red dot only, already drawn)
    drawArrow(Bx, yB, Bx, yB + p.vB * vscale, "#f6ad55", 3);
    drawArrow(Dx, Dy, Dx, Dy + vD * vscale, "#4fd1c5", 3);

    readout.textContent =
      `v_P ≈ 0 m/s    v_B = ${p.vB.toFixed(2)} m/s    v_D = ${vD.toFixed(2)} m/s`;
  }

  function loop(ts) {
    if (lastTs === null) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;

    if (section.classList.contains("active")) {
      const p = params();
      yB += p.vB * scale * dt;
      phi += (p.vB / p.r) * dt;

      if (yB > yBottom) {
        yB = yTop;
      }

      draw();
    }
    requestAnimationFrame(loop);
  }

  function syncLabels() {
    vBVal.textContent = parseFloat(vBSlider.value).toFixed(2);
    rVal.textContent = parseFloat(rSlider.value).toFixed(2);
    RVal.textContent = parseFloat(RSlider.value).toFixed(2);
  }

  [vBSlider, rSlider, RSlider].forEach((el) => el.addEventListener("input", syncLabels));

  syncLabels();
  requestAnimationFrame(loop);
})();
