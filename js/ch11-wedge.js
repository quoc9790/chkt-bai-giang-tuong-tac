(function () {
  const canvas = document.getElementById("ch11a-canvas");
  const ctx = canvas.getContext("2d");
  const section = document.getElementById("ch11");

  const m1Slider = document.getElementById("ch11a-m1");
  const m2Slider = document.getElementById("ch11a-m2");
  const alphaSlider = document.getElementById("ch11a-alpha");
  const v0Slider = document.getElementById("ch11a-v0");
  const aSlider = document.getElementById("ch11a-a");
  const m1Val = document.getElementById("ch11a-m1-val");
  const m2Val = document.getElementById("ch11a-m2-val");
  const alphaVal = document.getElementById("ch11a-alpha-val");
  const v0Val = document.getElementById("ch11a-v0-val");
  const aVal = document.getElementById("ch11a-a-val");
  const readout = document.getElementById("ch11a-readout");

  const scale = 100; // px per metre
  const groundY = 300;
  const X0 = 90; // fixed baseline x for the prism's bottom-left corner
  const L = 1.6; // incline length (m)

  let t = 0;

  function params() {
    return {
      m1: parseFloat(m1Slider.value),
      m2: parseFloat(m2Slider.value),
      alpha: (parseFloat(alphaSlider.value) * Math.PI) / 180,
      v0: parseFloat(v0Slider.value),
      a: parseFloat(aSlider.value),
    };
  }

  function draw() {
    const p = params();
    const u = p.a * t;
    const s = 0.5 * p.a * t * t;
    const v2 = p.v0 - (p.m1 * u * Math.cos(p.alpha)) / (p.m1 + p.m2);
    const x2 = p.v0 * t - (p.m1 * p.a * Math.cos(p.alpha) * t * t) / (2 * (p.m1 + p.m2));

    const h = L * Math.sin(p.alpha);
    const w = L * Math.cos(p.alpha);
    const prismX = X0 + x2 * scale;

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

    // prism (right triangle: vertical left edge, hypotenuse down to the right)
    const topLeft = [prismX, groundY - h * scale];
    const bottomLeft = [prismX, groundY];
    const bottomRight = [prismX + w * scale, groundY];
    ctx.fillStyle = "rgba(207,227,255,0.15)";
    ctx.strokeStyle = "#cfe3ff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(topLeft[0], topLeft[1]);
    ctx.lineTo(bottomLeft[0], bottomLeft[1]);
    ctx.lineTo(bottomRight[0], bottomRight[1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // angle marker
    ctx.strokeStyle = "#9fb0cc";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(bottomRight[0], bottomRight[1], 26, Math.PI, Math.PI + p.alpha, false);
    ctx.stroke();
    ctx.fillStyle = "#9fb0cc";
    ctx.font = "12px sans-serif";
    ctx.fillText("α", bottomRight[0] - 34, bottomRight[1] - 6);

    // block A sliding down the incline
    const Ax = topLeft[0] + s * Math.cos(p.alpha) * scale;
    const Ay = topLeft[1] + s * Math.sin(p.alpha) * scale;
    const boxSize = 30;
    // outward normal to the incline (away from the solid triangle), so the block sits on top
    const nx = Math.sin(p.alpha), ny = -Math.cos(p.alpha);
    const cx = Ax + nx * boxSize * 0.5;
    const cy = Ay + ny * boxSize * 0.5;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(p.alpha);
    ctx.fillStyle = "#f6ad55";
    ctx.fillRect(-boxSize / 2, -boxSize / 2, boxSize, boxSize);
    ctx.strokeStyle = "#5b7096";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-boxSize / 2, -boxSize / 2, boxSize, boxSize);
    ctx.restore();
    ctx.fillStyle = "#e6ecf5";
    ctx.font = "12px sans-serif";
    ctx.fillText("A", Ax + 8, Ay - 4);

    readout.textContent =
      `v₂ (lăng trụ) = ${v2.toFixed(2)} m/s      u (A trượt tương đối) = ${u.toFixed(2)} m/s`;
  }

  function loop(ts) {
    if (draw._lastTs === undefined) draw._lastTs = ts;
    const dt = Math.min((ts - draw._lastTs) / 1000, 0.05);
    draw._lastTs = ts;

    if (section.classList.contains("active")) {
      const p = params();
      t += dt;
      const s = 0.5 * p.a * t * t;
      if (s > L) t = 0;
      draw();
    }
    requestAnimationFrame(loop);
  }

  function syncLabels() {
    m1Val.textContent = parseFloat(m1Slider.value).toFixed(1);
    m2Val.textContent = parseFloat(m2Slider.value).toFixed(1);
    alphaVal.textContent = alphaSlider.value;
    v0Val.textContent = parseFloat(v0Slider.value).toFixed(2);
    aVal.textContent = parseFloat(aSlider.value).toFixed(2);
  }

  [m1Slider, m2Slider, alphaSlider, v0Slider, aSlider].forEach((el) =>
    el.addEventListener("input", syncLabels)
  );

  syncLabels();
  requestAnimationFrame(loop);
})();
