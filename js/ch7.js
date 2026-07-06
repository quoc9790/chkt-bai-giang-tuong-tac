(function () {
  const canvas = document.getElementById("ch7-canvas");
  const ctx = canvas.getContext("2d");
  const section = document.getElementById("ch7");

  const omegaSlider = document.getElementById("ch7-omega");
  const uSlider = document.getElementById("ch7-u");
  const lengthSlider = document.getElementById("ch7-length");
  const omegaVal = document.getElementById("ch7-omega-val");
  const uVal = document.getElementById("ch7-u-val");
  const lengthVal = document.getElementById("ch7-length-val");
  const modeVBtn = document.getElementById("ch7-mode-v");
  const modeABtn = document.getElementById("ch7-mode-a");
  const readout = document.getElementById("ch7-readout");

  let mode = "v"; // "v" or "a"
  let theta = 0;   // rod angle (rad)
  let t = 0;       // accumulated time along relative motion
  let lastTs = null;

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const posScale = 55; // px per metre

  function params() {
    return {
      omega: parseFloat(omegaSlider.value),
      u: parseFloat(uSlider.value),
      L: parseFloat(lengthSlider.value),
    };
  }

  function toPx(x, y) {
    return [cx + x * posScale, cy - y * posScale];
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
    const ah = Math.min(10, len * 0.4);
    const ang = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - ah * Math.cos(ang - 0.4), y2 - ah * Math.sin(ang - 0.4));
    ctx.lineTo(x2 - ah * Math.cos(ang + 0.4), y2 - ah * Math.sin(ang + 0.4));
    ctx.closePath();
    ctx.fill();
  }

  function draw() {
    const { omega, u, L } = params();

    // sawtooth: slider travels 0 -> L then resets
    const period = L / Math.max(u, 0.01);
    const r = (t % period) * u;

    const dirR = [Math.cos(theta), Math.sin(theta)];       // radial (along rod)
    const dirT = [-Math.sin(theta), Math.cos(theta)];      // tangential (transport dir)

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // axes hint
    ctx.strokeStyle = "#22304f";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(canvas.width, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, canvas.height);
    ctx.stroke();

    // rod O-B
    const [ox, oy] = toPx(0, 0);
    const [bx, by] = toPx(dirR[0] * L, dirR[1] * L);
    ctx.strokeStyle = "#5b7096";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(bx, by);
    ctx.stroke();

    ctx.fillStyle = "#e6ecf5";
    ctx.beginPath(); ctx.arc(ox, oy, 5, 0, 7); ctx.fill();
    ctx.font = "13px sans-serif";
    ctx.fillText("O", ox - 16, oy + 4);
    ctx.fillText("B", bx + 8, by + 4);

    // slider A
    const ax = dirR[0] * r, ay = dirR[1] * r;
    const [apx, apy] = toPx(ax, ay);
    ctx.fillStyle = "#e6ecf5";
    ctx.beginPath(); ctx.arc(apx, apy, 7, 0, 7); ctx.fill();
    ctx.fillText("A", apx + 10, apy - 8);

    let comp1, comp2, resultant, labelSet;
    if (mode === "v") {
      // v_e (transport, tangential) then v_r (relative, radial) chained -> v_a
      const ve = omega * r;
      const vr = u;
      comp1 = [dirT[0] * ve, dirT[1] * ve];   // tangential
      comp2 = [dirR[0] * vr, dirR[1] * vr];   // radial
      resultant = [comp1[0] + comp2[0], comp1[1] + comp2[1]];
      labelSet = {
        c1: `v_theo (v_e) = ω0·r = ${ve.toFixed(2)} m/s`,
        c2: `v_tương_đối (v_r) = u = ${vr.toFixed(2)} m/s`,
        res: `v_tuyệt_đối (v_a) = ${Math.hypot(resultant[0], resultant[1]).toFixed(2)} m/s`,
      };
    } else {
      // a_e (centripetal, radial, toward O) then a_C (Coriolis, tangential) chained -> a_a
      const ae = omega * omega * r;
      const ac = 2 * omega * u;
      comp1 = [-dirR[0] * ae, -dirR[1] * ae]; // toward O
      comp2 = [dirT[0] * ac, dirT[1] * ac];   // tangential (Coriolis)
      resultant = [comp1[0] + comp2[0], comp1[1] + comp2[1]];
      labelSet = {
        c1: `a_theo (a_e) = ω0²·r = ${ae.toFixed(2)} m/s²`,
        c2: `a_Coriolis (a_C) = 2ω0·u = ${ac.toFixed(2)} m/s²`,
        res: `a_tuyệt_đối (a_a) = ${Math.hypot(resultant[0], resultant[1]).toFixed(2)} m/s²`,
      };
    }

    // auto scale arrows to fit nicely on canvas
    const magMax = Math.max(
      Math.hypot(comp1[0], comp1[1]),
      Math.hypot(comp2[0], comp2[1]),
      Math.hypot(resultant[0], resultant[1]),
      0.001
    );
    const arrowScale = 120 / magMax;

    const p0 = [apx, apy];
    const p1 = [apx + comp1[0] * arrowScale, apy - comp1[1] * arrowScale];
    const p2 = [p1[0] + comp2[0] * arrowScale, p1[1] - comp2[1] * arrowScale];

    drawArrow(p0[0], p0[1], p1[0], p1[1], "#fc8181", 3);       // comp1 (transport / a_e)
    drawArrow(p1[0], p1[1], p2[0], p2[1], "#f6ad55", 3);       // comp2 (relative / Coriolis)
    drawArrow(p0[0], p0[1], p2[0], p2[1], "#4fd1c5", 3.5);     // resultant

    readout.textContent =
      `r(t) = ${r.toFixed(2)} m   (0 ≤ r ≤ L = ${L.toFixed(2)} m)\n` +
      `${labelSet.c1}\n${labelSet.c2}\n${labelSet.res}`;
  }

  function loop(ts) {
    if (lastTs === null) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;

    if (section.classList.contains("active")) {
      const { omega } = params();
      theta += omega * dt;
      t += dt;
      draw();
    }
    requestAnimationFrame(loop);
  }

  function syncLabels() {
    omegaVal.textContent = parseFloat(omegaSlider.value).toFixed(2);
    uVal.textContent = parseFloat(uSlider.value).toFixed(2);
    lengthVal.textContent = parseFloat(lengthSlider.value).toFixed(1);
  }

  [omegaSlider, uSlider, lengthSlider].forEach((el) =>
    el.addEventListener("input", syncLabels)
  );

  modeVBtn.addEventListener("click", () => {
    mode = "v";
    modeVBtn.classList.add("active");
    modeABtn.classList.remove("active");
  });
  modeABtn.addEventListener("click", () => {
    mode = "a";
    modeABtn.classList.add("active");
    modeVBtn.classList.remove("active");
  });

  syncLabels();
  requestAnimationFrame(loop);
})();
