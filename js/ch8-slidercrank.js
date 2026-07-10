(function () {
  const canvas = document.getElementById("ch8c-canvas");
  const ctx = canvas.getContext("2d");
  const section = document.getElementById("ch8");

  const rSlider = document.getElementById("ch8c-r");
  const LSlider = document.getElementById("ch8c-L");
  const omegaSlider = document.getElementById("ch8c-omega");
  const rVal = document.getElementById("ch8c-r-val");
  const LVal = document.getElementById("ch8c-L-val");
  const omegaVal = document.getElementById("ch8c-omega-val");
  const readout = document.getElementById("ch8c-readout");

  const scale = 100; // px per metre
  const Apx = 90, Apy = 260; // fixed pivot A, canvas px (also the slider track height)

  let phi = 0;
  let lastTs = null;

  function params() {
    return {
      r: parseFloat(rSlider.value),
      L: parseFloat(LSlider.value),
      omega0: parseFloat(omegaSlider.value),
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

  function toCanvas(mx, my) {
    return [Apx + mx * scale, Apy - my * scale];
  }

  function draw() {
    const p = params();

    // mechanism position (metres, math y-up, relative to A)
    const Bm = [p.r * Math.cos(phi), p.r * Math.sin(phi)];
    const Lx = Math.sqrt(Math.max(p.L * p.L - Bm[1] * Bm[1], 0));
    const Cm = [Bm[0] + Lx, 0];

    // velocities (m/s)
    const vBm = [-p.r * p.omega0 * Math.sin(phi), p.r * p.omega0 * Math.cos(phi)];
    const vCx = Lx > 1e-6 ? vBm[0] - (Bm[1] * vBm[1]) / Lx : vBm[0];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // slider track
    ctx.strokeStyle = "#5b7096";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(60, Apy);
    ctx.lineTo(540, Apy);
    ctx.stroke();
    ctx.strokeStyle = "#3a4d78";
    ctx.lineWidth = 1;
    for (let x = 60; x < 540; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, Apy);
      ctx.lineTo(x - 6, Apy + 8);
      ctx.stroke();
    }

    // fixed pivot A
    ctx.strokeStyle = "#5b7096";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(Apx - 10, Apy + 16);
    ctx.lineTo(Apx + 10, Apy + 16);
    ctx.moveTo(Apx, Apy);
    ctx.lineTo(Apx - 10, Apy + 16);
    ctx.moveTo(Apx, Apy);
    ctx.lineTo(Apx + 10, Apy + 16);
    ctx.stroke();

    const [Bx, By] = toCanvas(Bm[0], Bm[1]);
    const [Cx, Cy] = toCanvas(Cm[0], Cm[1]);

    // crank AB + rod BC
    ctx.strokeStyle = "#cfe3ff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(Apx, Apy);
    ctx.lineTo(Bx, By);
    ctx.stroke();
    ctx.strokeStyle = "#f6ad55";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(Bx, By);
    ctx.lineTo(Cx, Cy);
    ctx.stroke();

    // joint B
    ctx.fillStyle = "#e6ecf5";
    ctx.beginPath(); ctx.arc(Bx, By, 5, 0, 7); ctx.fill();
    ctx.font = "12px sans-serif";
    ctx.fillText("B", Bx + 8, By - 6);
    ctx.fillText("A", Apx - 8, Apy + 30);

    // slider block C
    ctx.fillStyle = "#fc8181";
    ctx.fillRect(Cx - 16, Cy - 12, 32, 24);
    ctx.strokeStyle = "#5b7096";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(Cx - 16, Cy - 12, 32, 24);
    ctx.fillStyle = "#0b1220";
    ctx.fillText("C", Cx - 4, Cy + 4);

    // omega0 curved arrow near A — arrowhead points in the direction OA
    // actually rotates (CCW, i.e. decreasing canvas angle)
    ctx.strokeStyle = "#4fd1c5";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(Apx, Apy, 26, -1.9, -0.5, false);
    ctx.stroke();
    const aAng = -1.9;
    drawArrow(
      Apx + 26 * Math.cos(aAng + 0.25), Apy + 26 * Math.sin(aAng + 0.25),
      Apx + 26 * Math.cos(aAng), Apy + 26 * Math.sin(aAng),
      "#4fd1c5", 2
    );
    ctx.fillStyle = "#4fd1c5";
    ctx.fillText("ω₀", Apx + 34, Apy - 20);

    // velocity vectors at B and C
    const vscale = 45; // px per (m/s)
    drawArrow(Bx, By, Bx + vBm[0] * vscale, By - vBm[1] * vscale, "#f6ad55", 3);
    drawArrow(Cx, Cy, Cx + vCx * vscale, Cy, "#4fd1c5", 3);

    readout.textContent =
      `v_B = ${Math.hypot(vBm[0], vBm[1]).toFixed(2)} m/s    v_C = ${Math.abs(vCx).toFixed(2)} m/s`;
  }

  function loop(ts) {
    if (lastTs === null) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;

    if (section.classList.contains("active")) {
      const p = params();
      phi += p.omega0 * dt;
      draw();
    }
    requestAnimationFrame(loop);
  }

  function syncLabels() {
    rVal.textContent = parseFloat(rSlider.value).toFixed(2);
    LVal.textContent = parseFloat(LSlider.value).toFixed(2);
    omegaVal.textContent = parseFloat(omegaSlider.value).toFixed(2);
  }

  [rSlider, LSlider, omegaSlider].forEach((el) => el.addEventListener("input", syncLabels));

  syncLabels();
  requestAnimationFrame(loop);
})();
