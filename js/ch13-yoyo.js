(function () {
  const canvas = document.getElementById("ch13c-canvas");
  const ctx = canvas.getContext("2d");
  const section = document.getElementById("ch13");

  const v1Slider = document.getElementById("ch13c-v1");
  const r2Slider = document.getElementById("ch13c-r2");
  const R3Slider = document.getElementById("ch13c-R3");
  const r3Slider = document.getElementById("ch13c-r3");
  const alphaSlider = document.getElementById("ch13c-alpha");

  const v1Val = document.getElementById("ch13c-v1-val");
  const r2Val = document.getElementById("ch13c-r2-val");
  const R3Val = document.getElementById("ch13c-R3-val");
  const r3Val = document.getElementById("ch13c-r3-val");
  const alphaVal = document.getElementById("ch13c-alpha-val");

  const scale = 80;      // px per metre
  const trackLen = 1.4;  // metres of travel for roller 3
  const s0 = 0.3;
  const originX = 90, originY = 360;
  const pulleyU = s0 + trackLen + 0.8; // pulley sits well beyond the roller's max travel (s0+trackLen)

  let s = 0;     // displacement of roller 3 along the incline
  let h = 0;     // drop of mass 1
  let phi2 = 0;  // pulley 2 rotation angle
  let phi3 = 0;  // roller 3 rotation angle
  let lastTs = null;

  function params() {
    return {
      v1: parseFloat(v1Slider.value),
      r2: parseFloat(r2Slider.value),
      R3: parseFloat(R3Slider.value),
      r3: parseFloat(r3Slider.value),
      alpha: (parseFloat(alphaSlider.value) * Math.PI) / 180,
    };
  }

  // local incline coords (u along slope, w perpendicular) -> canvas pixel
  function project(u, w, alpha) {
    const wx = u * Math.cos(alpha) - w * Math.sin(alpha);
    const wy = u * Math.sin(alpha) + w * Math.cos(alpha);
    return [originX + wx * scale, originY - wy * scale];
  }

  function drawDisk(cx, cy, Rpx, phi, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, Rpx, 0, Math.PI * 2);
    ctx.stroke();
    for (let k = 0; k < 4; k++) {
      const a = phi + (k * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Rpx * Math.cos(a), cy + Rpx * Math.sin(a));
      ctx.strokeStyle = "#3a4d78";
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }
  }

  function draw() {
    const p = params();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ground + incline surface
    ctx.strokeStyle = "#5b7096";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(originX - 40, originY);
    ctx.lineTo(originX, originY);
    ctx.stroke();
    const top = project(pulleyU + 0.3, 0, p.alpha);
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(top[0], top[1]);
    ctx.stroke();

    // angle arc
    ctx.strokeStyle = "#9fb0cc";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(originX, originY, 26, -p.alpha, 0, false);
    ctx.stroke();
    ctx.fillStyle = "#9fb0cc";
    ctx.font = "12px sans-serif";
    ctx.fillText("α", originX + 32, originY - 6);

    // fixed pulley 2 — mounted just above the incline, low enough that the
    // cord wraps over its upper rim and still runs parallel to the slope
    const r2px = p.r2 * scale;
    const pulleyW = p.R3 + p.r3 - p.r2;
    const O = project(pulleyU, pulleyW, p.alpha);
    ctx.strokeStyle = "#5b7096";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(O[0] - 12, O[1] - r2px - 12);
    ctx.lineTo(O[0] + 12, O[1] - r2px - 12);
    ctx.moveTo(O[0], O[1] - r2px);
    ctx.lineTo(O[0], O[1] - r2px - 12);
    ctx.stroke();
    drawDisk(O[0], O[1], r2px, phi2, "#cfe3ff");
    ctx.fillStyle = "#e6ecf5";
    ctx.font = "12px sans-serif";
    ctx.fillText("O", O[0] + r2px + 4, O[1]);
    ctx.fillText("2", O[0] + r2px + 4, O[1] - 14);

    // roller 3 (two-tier: outer R3, inner r3), rolling up the incline
    const R3px = p.R3 * scale;
    const r3px = p.r3 * scale;
    const C = project(s0 + s, p.R3, p.alpha);
    drawDisk(C[0], C[1], R3px, phi3, "#cfe3ff");
    ctx.strokeStyle = "#f6ad55";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(C[0], C[1], r3px, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#e6ecf5";
    ctx.fillText("C", C[0] + 4, C[1] - 4);
    ctx.fillText("3", C[0] - R3px - 4, C[1] - R3px + 10);

    // cord: runs parallel to the incline, tangent to the pulley's underside
    // and the roller's inner-hub top (both rims at local height w = R₃+r₃)
    const cordW = p.R3 + p.r3;
    const Tpulley = project(pulleyU, cordW, p.alpha);
    const Troller = project(s0 + s, cordW, p.alpha);
    ctx.strokeStyle = "#fc8181";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(Tpulley[0], Tpulley[1]);
    ctx.lineTo(Troller[0], Troller[1]);
    ctx.stroke();

    // mass 1 hanging from the right side of the pulley
    const massX = O[0] + r2px;
    const massTopY = O[1] + r2px + 20;
    const massY = massTopY + h * scale;
    ctx.strokeStyle = "#fc8181";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(massX, O[1]);
    ctx.lineTo(massX, massY);
    ctx.stroke();
    ctx.fillStyle = "#cfe3ff";
    ctx.fillRect(massX - 16, massY, 32, 32);
    ctx.strokeStyle = "#5b7096";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(massX - 16, massY, 32, 32);
    ctx.fillStyle = "#0b1220";
    ctx.font = "13px sans-serif";
    ctx.fillText("1", massX - 4, massY + 21);
  }

  function loop(ts) {
    if (lastTs === null) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;

    if (section.classList.contains("active")) {
      const p = params();
      const w3 = p.v1 / (p.R3 + p.r3);
      const vC = w3 * p.R3;
      const w2 = p.v1 / p.r2;

      h += p.v1 * dt;
      s += vC * dt;
      phi2 += w2 * dt;
      phi3 += w3 * dt;

      if (s0 + s > trackLen) {
        s = 0; h = 0; phi2 = 0; phi3 = 0;
      }

      draw();
    }
    requestAnimationFrame(loop);
  }

  function syncLabels() {
    v1Val.textContent = parseFloat(v1Slider.value).toFixed(2);
    r2Val.textContent = parseFloat(r2Slider.value).toFixed(2);
    R3Val.textContent = parseFloat(R3Slider.value).toFixed(2);
    r3Val.textContent = parseFloat(r3Slider.value).toFixed(2);
    alphaVal.textContent = alphaSlider.value;
  }

  [v1Slider, r2Slider, R3Slider, r3Slider, alphaSlider].forEach((el) =>
    el.addEventListener("input", syncLabels)
  );

  syncLabels();
  requestAnimationFrame(loop);
})();
