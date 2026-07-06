(function () {
  const canvas = document.getElementById("ch13-canvas");
  const ctx = canvas.getContext("2d");
  const section = document.getElementById("ch13");

  const mSlider = document.getElementById("ch13-m");
  const RSlider = document.getElementById("ch13-R");
  const vSlider = document.getElementById("ch13-v");
  const mVal = document.getElementById("ch13-m-val");
  const RVal = document.getElementById("ch13-R-val");
  const vVal = document.getElementById("ch13-v-val");
  const readout = document.getElementById("ch13-readout");

  const barTrans = document.getElementById("ch13-bar-trans");
  const barRot = document.getElementById("ch13-bar-rot");
  const barTotal = document.getElementById("ch13-bar-total");
  const transNum = document.getElementById("ch13-trans-val");
  const rotNum = document.getElementById("ch13-rot-val");
  const totalNum = document.getElementById("ch13-total-val");

  // reference scale for bar widths — tuned so typical mid-range slider values
  // (not just the extreme worst case) still produce a visibly moving bar
  const mMax = parseFloat(mSlider.max);
  const vMax = parseFloat(vSlider.max);
  const maxT = 0.75 * (mMax * 0.4) * (vMax * 0.55) * (vMax * 0.55);

  const posScale = 150; // px per metre
  const groundY = 240;
  let xC = 80;
  let phi = 0;
  let lastTs = null;

  function params() {
    return {
      m: parseFloat(mSlider.value),
      R: parseFloat(RSlider.value),
      v: parseFloat(vSlider.value),
    };
  }

  function draw() {
    const { m, R, v } = params();
    const Rpx = R * posScale;
    const cy = groundY - Rpx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#5b7096";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();

    ctx.strokeStyle = "#cfe3ff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(xC, cy, Rpx, 0, Math.PI * 2);
    ctx.stroke();

    for (let k = 0; k < 4; k++) {
      const a = phi + (k * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(xC, cy);
      ctx.lineTo(xC + Rpx * Math.cos(a), cy + Rpx * Math.sin(a));
      ctx.strokeStyle = "#3a4d78";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // contact point marker
    ctx.fillStyle = "#fc8181";
    ctx.beginPath(); ctx.arc(xC, groundY, 4, 0, 7); ctx.fill();

    const omega = R > 0.001 ? v / R : 0;
    const Tt = 0.5 * m * v * v;
    const Tr = 0.25 * m * v * v;
    const Ttot = Tt + Tr;

    readout.textContent =
      `m = ${m.toFixed(1)} kg   R = ${R.toFixed(2)} m   v = ${v.toFixed(2)} m/s\n` +
      `ω = v/R = ${omega.toFixed(2)} rad/s   I_C = ½mR² = ${(0.5 * m * R * R).toFixed(3)} kg·m²`;

    barTrans.style.width = Math.min(100, (Tt / maxT) * 100) + "%";
    barRot.style.width = Math.min(100, (Tr / maxT) * 100) + "%";
    barTotal.style.width = Math.min(100, (Ttot / maxT) * 100) + "%";
    transNum.textContent = Tt.toFixed(2) + " J";
    rotNum.textContent = Tr.toFixed(2) + " J";
    totalNum.textContent = Ttot.toFixed(2) + " J";
  }

  function loop(ts) {
    if (lastTs === null) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;

    if (section.classList.contains("active")) {
      const { R, v } = params();
      const Rpx = R * posScale;
      xC += v * posScale * dt;
      phi += (R > 0.001 ? v / R : 0) * dt;

      if (xC - Rpx > canvas.width + 20) xC = -Rpx - 20;

      draw();
    }
    requestAnimationFrame(loop);
  }

  function syncLabels() {
    mVal.textContent = parseFloat(mSlider.value).toFixed(1);
    RVal.textContent = parseFloat(RSlider.value).toFixed(2);
    vVal.textContent = parseFloat(vSlider.value).toFixed(1);
  }

  [mSlider, RSlider, vSlider].forEach((el) => el.addEventListener("input", syncLabels));

  syncLabels();
  requestAnimationFrame(loop);
})();
