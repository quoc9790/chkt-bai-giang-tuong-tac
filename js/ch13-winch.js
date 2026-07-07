(function () {
  const canvas = document.getElementById("ch13b-canvas");
  const ctx = canvas.getContext("2d");
  const section = document.getElementById("ch13");

  const r1Slider = document.getElementById("ch13b-r1");
  const r2Slider = document.getElementById("ch13b-r2");
  const m1Slider = document.getElementById("ch13b-m1");
  const m2Slider = document.getElementById("ch13b-m2");
  const MSlider = document.getElementById("ch13b-M");
  const betaSlider = document.getElementById("ch13b-beta");

  const r1Val = document.getElementById("ch13b-r1-val");
  const r2Val = document.getElementById("ch13b-r2-val");
  const m1Val = document.getElementById("ch13b-m1-val");
  const m2Val = document.getElementById("ch13b-m2-val");
  const MVal = document.getElementById("ch13b-M-val");
  const betaVal = document.getElementById("ch13b-beta-val");
  const readout = document.getElementById("ch13b-readout");

  const g = 9.81;
  const scale = 90;      // px per metre
  const trackLen = 2.6;  // metres of travel available on the incline
  const s0 = 0.35;       // starting offset from the base of the incline
  const originX = 90, originY = 310;

  let s = 0;      // displacement of roller 2 along the incline
  let v = 0;      // speed of centre A
  let phi1 = 0;   // drum 1 rotation angle
  let phi2 = 0;   // roller 2 rotation angle
  let lastTs = null;

  function params() {
    return {
      r1: parseFloat(r1Slider.value),
      r2: parseFloat(r2Slider.value),
      m1: parseFloat(m1Slider.value),
      m2: parseFloat(m2Slider.value),
      M: parseFloat(MSlider.value),
      beta: (parseFloat(betaSlider.value) * Math.PI) / 180,
    };
  }

  function accel(p) {
    return (2 * p.M / p.r1 - p.m2 * g * Math.sin(p.beta)) / (2 * (p.m1 + 0.75 * p.m2));
  }

  // local incline coords (u along slope, w perpendicular) -> canvas pixel
  function project(u, w, beta) {
    const wx = u * Math.cos(beta) - w * Math.sin(beta);
    const wy = u * Math.sin(beta) + w * Math.cos(beta);
    return [originX + wx * scale, originY - wy * scale];
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
    const a = accel(p);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ground + incline surface
    const groundLeft = [originX - 40, originY];
    const groundRight = [originX + (trackLen + 1.0) * Math.cos(p.beta) * scale + 20, originY];
    ctx.strokeStyle = "#5b7096";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(groundLeft[0], groundLeft[1]);
    ctx.lineTo(originX, originY);
    ctx.stroke();

    const top = project(trackLen + 0.35, 0, p.beta);
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(top[0], top[1]);
    ctx.stroke();

    // angle arc at the base
    ctx.strokeStyle = "#9fb0cc";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(originX, originY, 28, -p.beta, 0, false);
    ctx.stroke();
    ctx.fillStyle = "#9fb0cc";
    ctx.font = "12px sans-serif";
    ctx.fillText("β", originX + 34, originY - 6);

    // drum 1 — fixed pivot at top of incline
    const O = project(trackLen, p.r1, p.beta);
    const Osupport = project(trackLen, 0, p.beta);
    ctx.strokeStyle = "#5b7096";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(Osupport[0], Osupport[1]);
    ctx.lineTo(O[0], O[1]);
    ctx.stroke();
    // small fixed-support hatch
    ctx.beginPath();
    ctx.moveTo(Osupport[0] - 10, Osupport[1] + 10);
    ctx.lineTo(Osupport[0] + 10, Osupport[1] + 10);
    ctx.moveTo(Osupport[0], Osupport[1]);
    ctx.lineTo(Osupport[0] - 10, Osupport[1] + 10);
    ctx.moveTo(Osupport[0], Osupport[1]);
    ctx.lineTo(Osupport[0] + 10, Osupport[1] + 10);
    ctx.stroke();

    const R1px = p.r1 * scale;
    drawDisk(O[0], O[1], R1px, phi1, "#cfe3ff");
    ctx.fillStyle = "#e6ecf5";
    ctx.font = "12px sans-serif";
    ctx.fillText("O", O[0] + R1px + 4, O[1]);

    // M arrow (curved) near drum
    ctx.strokeStyle = "#f6ad55";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(O[0], O[1], R1px + 14, -2.4, -0.6, false);
    ctx.stroke();
    const mArrowAng = -0.6;
    const mAx = O[0] + (R1px + 14) * Math.cos(mArrowAng);
    const mAy = O[1] + (R1px + 14) * Math.sin(mArrowAng);
    drawArrow(mAx - 10 * Math.sin(mArrowAng), mAy + 10 * Math.cos(mArrowAng), mAx, mAy, "#f6ad55", 2);
    ctx.fillStyle = "#f6ad55";
    ctx.fillText("M", O[0] + R1px + 10, O[1] - R1px - 6);

    // roller 2 on the incline
    const A = project(s0 + s, p.r2, p.beta);
    const R2px = p.r2 * scale;
    drawDisk(A[0], A[1], R2px, phi2, "#cfe3ff");
    ctx.fillStyle = "#e6ecf5";
    ctx.fillText("A", A[0] + 6, A[1] - R2px - 6);

    // cord between drum rim and roller rim
    const dx = O[0] - A[0], dy = O[1] - A[1];
    const dlen = Math.hypot(dx, dy) || 1;
    const ux = dx / dlen, uy = dy / dlen;
    const cordStart = [A[0] + ux * R2px, A[1] + uy * R2px];
    const cordEnd = [O[0] - ux * R1px, O[1] - uy * R1px];
    ctx.strokeStyle = "#fc8181";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cordStart[0], cordStart[1]);
    ctx.lineTo(cordEnd[0], cordEnd[1]);
    ctx.stroke();

    const w1 = (2 * v) / p.r1;
    const w2 = v / p.r2;

    readout.textContent =
      `r₁=${p.r1.toFixed(2)}m  r₂=${p.r2.toFixed(2)}m  m₁=${p.m1.toFixed(1)}kg  m₂=${p.m2.toFixed(1)}kg  M=${p.M.toFixed(0)}N·m  β=${betaSlider.value}°\n` +
      `Gia tốc a = ${a.toFixed(3)} m/s²${a <= 0 ? "   → M chưa đủ lớn, hệ đứng yên" : ""}\n` +
      `s = ${s.toFixed(2)} m   v_A = ${v.toFixed(2)} m/s   ω₁ = ${w1.toFixed(2)} rad/s   ω₂ = ${w2.toFixed(2)} rad/s`;
  }

  function loop(ts) {
    if (lastTs === null) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;

    if (section.classList.contains("active")) {
      const p = params();
      const a = accel(p);

      if (a > 0) {
        v += a * dt;
        s += v * dt;
        phi1 += ((2 * v) / p.r1) * dt;
        phi2 += (v / p.r2) * dt;
      } else {
        v = 0;
      }

      if (s0 + s > trackLen) {
        s = 0; v = 0; phi1 = 0; phi2 = 0;
      }

      draw();
    }
    requestAnimationFrame(loop);
  }

  function syncLabels() {
    r1Val.textContent = parseFloat(r1Slider.value).toFixed(2);
    r2Val.textContent = parseFloat(r2Slider.value).toFixed(2);
    m1Val.textContent = parseFloat(m1Slider.value).toFixed(1);
    m2Val.textContent = parseFloat(m2Slider.value).toFixed(1);
    MVal.textContent = parseFloat(MSlider.value).toFixed(0);
    betaVal.textContent = betaSlider.value;
  }

  [r1Slider, r2Slider, m1Slider, m2Slider, MSlider, betaSlider].forEach((el) =>
    el.addEventListener("input", syncLabels)
  );

  syncLabels();
  requestAnimationFrame(loop);
})();
