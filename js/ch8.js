(function () {
  const canvas = document.getElementById("ch8-canvas");
  const ctx = canvas.getContext("2d");
  const section = document.getElementById("ch8");

  const RSlider = document.getElementById("ch8-R");
  const omegaSlider = document.getElementById("ch8-omega");
  const RVal = document.getElementById("ch8-R-val");
  const omegaVal = document.getElementById("ch8-omega-val");
  const traceCheckbox = document.getElementById("ch8-trace");
  const resetBtn = document.getElementById("ch8-reset");
  const readout = document.getElementById("ch8-readout");

  const posScale = 110; // px per metre
  const groundY = 320;
  let xC = 0;   // centre x in px (world coords, unwrapped internally reset on lap)
  let phi = 0;  // rim rotation angle (canvas convention)
  let trace = [];
  let lastTs = null;

  function params() {
    return {
      R: parseFloat(RSlider.value),
      omega: parseFloat(omegaSlider.value),
    };
  }

  function resetSim() {
    xC = 100;
    phi = 0;
    trace = [];
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
    const { R, omega } = params();
    const Rpx = R * posScale;
    const cy = groundY - Rpx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ground
    ctx.strokeStyle = "#5b7096";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();

    // trajectory trace
    if (trace.length > 1) {
      ctx.strokeStyle = "#4fd1c5";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(trace[0].x, trace[0].y);
      for (let i = 1; i < trace.length; i++) ctx.lineTo(trace[i].x, trace[i].y);
      ctx.stroke();
    }

    // disk body
    ctx.strokeStyle = "#cfe3ff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(xC, cy, Rpx, 0, Math.PI * 2);
    ctx.stroke();

    // spokes to show rotation
    for (let k = 0; k < 4; k++) {
      const a = phi + (k * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(xC, cy);
      ctx.lineTo(xC + Rpx * Math.cos(a), cy + Rpx * Math.sin(a));
      ctx.strokeStyle = "#3a4d78";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // marked rim point (angle phi, starts at bottom = contact)
    const mx = xC + Rpx * Math.cos(phi + Math.PI / 2);
    const my = cy + Rpx * Math.sin(phi + Math.PI / 2);
    ctx.fillStyle = "#f6ad55";
    ctx.beginPath(); ctx.arc(mx, my, 5, 0, 7); ctx.fill();

    // ICR at contact point
    const px_ = xC, py_ = groundY;
    ctx.fillStyle = "#fc8181";
    ctx.beginPath(); ctx.arc(px_, py_, 5, 0, 7); ctx.fill();
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#e6ecf5";
    ctx.fillText("P (v=0)", px_ - 20, py_ + 18);

    // velocity vectors
    const vC = omega * R;      // m/s
    const vTop = 2 * vC;
    const vscale = 18; // px per (m/s)

    ctx.fillText("C", xC + 6, cy - Rpx - 6);
    drawArrow(xC, cy, xC + vC * vscale, cy, "#4fd1c5", 3);

    const topY = cy - Rpx;
    ctx.fillText("đỉnh", xC + 6, topY - 4);
    drawArrow(xC, topY, xC + vTop * vscale, topY, "#4fd1c5", 3);

    readout.textContent =
      `R = ${R.toFixed(2)} m   ω = ${omega.toFixed(2)} rad/s\n` +
      `v_tâm = ω·R = ${vC.toFixed(2)} m/s\n` +
      `v_đỉnh = 2ω·R = ${vTop.toFixed(2)} m/s   v_tiếp_xúc = 0`;
  }

  function loop(ts) {
    if (lastTs === null) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;

    if (section.classList.contains("active")) {
      const { R, omega } = params();
      const Rpx = R * posScale;
      const vC = omega * R * posScale; // px/s

      xC += vC * dt;
      phi += omega * dt;

      if (traceCheckbox.checked) {
        const cy = groundY - Rpx;
        const mx = xC + Rpx * Math.cos(phi + Math.PI / 2);
        const my = cy + Rpx * Math.sin(phi + Math.PI / 2);
        trace.push({ x: mx, y: my });
        if (trace.length > 600) trace.shift();
      }

      // wrap around when off-screen
      if (xC - Rpx > canvas.width + 20) { xC = -Rpx - 20; trace = []; }
      if (xC + Rpx < -20) { xC = canvas.width + Rpx + 20; trace = []; }

      draw();
    }
    requestAnimationFrame(loop);
  }

  function syncLabels() {
    RVal.textContent = parseFloat(RSlider.value).toFixed(2);
    omegaVal.textContent = parseFloat(omegaSlider.value).toFixed(2);
  }

  [RSlider, omegaSlider].forEach((el) => el.addEventListener("input", syncLabels));
  resetBtn.addEventListener("click", resetSim);
  traceCheckbox.addEventListener("change", () => { if (!traceCheckbox.checked) trace = []; });

  syncLabels();
  resetSim();
  requestAnimationFrame(loop);
})();
