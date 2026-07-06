(function () {
  const canvas = document.getElementById("ch9-canvas");
  const ctx = canvas.getContext("2d");
  const section = document.getElementById("ch9");

  const RSlider = document.getElementById("ch9-R");
  const w1Slider = document.getElementById("ch9-w1");
  const w2Slider = document.getElementById("ch9-w2");
  const RVal = document.getElementById("ch9-R-val");
  const w1Val = document.getElementById("ch9-w1-val");
  const w2Val = document.getElementById("ch9-w2-val");
  const traceCheckbox = document.getElementById("ch9-trace");
  const readout = document.getElementById("ch9-readout");

  const originX = 260, originY = 250;
  const scale = 80; // px per metre
  const armLen = 1.6; // fixed horizontal arm length (m)
  const cos30 = Math.cos(Math.PI / 6);
  const sin30 = Math.sin(Math.PI / 6);

  let alpha = 0; // precession angle
  let beta = 0;  // spin angle
  let trace = [];
  let lastTs = null;

  function project(x, y, z) {
    const sx = (x - y) * cos30;
    const sy = (x + y) * sin30 - z;
    return [originX + sx * scale, originY + sy * scale];
  }

  function params() {
    return {
      R: parseFloat(RSlider.value),
      w1: parseFloat(w1Slider.value),
      w2: parseFloat(w2Slider.value),
    };
  }

  function drawLine(p1, p2, color, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.stroke();
  }

  function draw() {
    const { R, w1, w2 } = params();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // base pedestal ellipse
    const base = project(0, 0, -0.05);
    ctx.strokeStyle = "#3a4d78";
    ctx.beginPath();
    ctx.ellipse(base[0], base[1], 22, 9, 0, 0, Math.PI * 2);
    ctx.stroke();

    // vertical fixed axis
    const zTop = project(0, 0, 1.9);
    const zBot = project(0, 0, -0.6);
    drawLine(zBot, zTop, "#5b7096", 3);

    // precession direction basis
    const er = [Math.cos(alpha), Math.sin(alpha), 0];
    const et = [-Math.sin(alpha), Math.cos(alpha), 0];

    // arm from axis to disk centre
    const O0 = project(0, 0, 0);
    const diskCenter3D = [er[0] * armLen, er[1] * armLen, 0];
    const Oc = project(diskCenter3D[0], diskCenter3D[1], diskCenter3D[2]);
    drawLine(O0, Oc, "#cfe3ff", 3);

    // disk rim (sampled polygon) — local plane spanned by et (horizontal) and ez (vertical)
    const N = 48;
    const rim = [];
    for (let i = 0; i <= N; i++) {
      const g = (i / N) * Math.PI * 2 + beta;
      const px = diskCenter3D[0] + R * Math.cos(g) * et[0];
      const py = diskCenter3D[1] + R * Math.cos(g) * et[1];
      const pz = diskCenter3D[2] + R * Math.sin(g);
      rim.push(project(px, py, pz));
    }
    ctx.strokeStyle = "#cfe3ff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(rim[0][0], rim[0][1]);
    for (let i = 1; i < rim.length; i++) ctx.lineTo(rim[i][0], rim[i][1]);
    ctx.stroke();

    // spokes
    for (let k = 0; k < 6; k++) {
      const g = beta + (k * Math.PI) / 3;
      const px = diskCenter3D[0] + R * Math.cos(g) * et[0];
      const py = diskCenter3D[1] + R * Math.cos(g) * et[1];
      const pz = diskCenter3D[2] + R * Math.sin(g);
      drawLine(Oc, project(px, py, pz), "#324067", 1.2);
    }

    // marked point M (gamma = 0)
    const mx = diskCenter3D[0] + R * Math.cos(beta) * et[0];
    const my = diskCenter3D[1] + R * Math.cos(beta) * et[1];
    const mz = diskCenter3D[2] + R * Math.sin(beta);
    const Mp = project(mx, my, mz);

    if (traceCheckbox.checked) {
      trace.push(Mp);
      if (trace.length > 500) trace.shift();
    }

    if (trace.length > 1) {
      ctx.strokeStyle = "rgba(246,173,85,0.55)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(trace[0][0], trace[0][1]);
      for (let i = 1; i < trace.length; i++) ctx.lineTo(trace[i][0], trace[i][1]);
      ctx.stroke();
    }

    ctx.fillStyle = "#f6ad55";
    ctx.beginPath(); ctx.arc(Mp[0], Mp[1], 6, 0, 7); ctx.fill();

    ctx.fillStyle = "#e6ecf5";
    ctx.font = "12px sans-serif";
    ctx.fillText("M", Mp[0] + 8, Mp[1] - 6);
    ctx.fillText("trục tiến động", zTop[0] + 6, zTop[1]);

    const wTotal = Math.hypot(w1, w2);
    readout.textContent =
      `R = ${R.toFixed(2)} m   ω1 (tiến động) = ${w1.toFixed(2)} rad/s   ω2 (tự quay) = ${w2.toFixed(2)} rad/s\n` +
      `|ω| = √(ω1²+ω2²) = ${wTotal.toFixed(2)} rad/s`;
  }

  function loop(ts) {
    if (lastTs === null) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;

    if (section.classList.contains("active")) {
      const { w1, w2 } = params();
      alpha += w1 * dt;
      beta += w2 * dt;
      draw();
    }
    requestAnimationFrame(loop);
  }

  function syncLabels() {
    RVal.textContent = parseFloat(RSlider.value).toFixed(2);
    w1Val.textContent = parseFloat(w1Slider.value).toFixed(2);
    w2Val.textContent = parseFloat(w2Slider.value).toFixed(2);
  }

  [RSlider, w1Slider, w2Slider].forEach((el) => el.addEventListener("input", syncLabels));
  traceCheckbox.addEventListener("change", () => { if (!traceCheckbox.checked) trace = []; });

  syncLabels();
  requestAnimationFrame(loop);
})();
