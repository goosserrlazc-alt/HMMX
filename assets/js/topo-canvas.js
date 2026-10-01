
  // ── Topographic Background ──
  const canvas = document.getElementById('topo-canvas');
  const ctx = canvas.getContext('2d');
  let width, height, cols, rows;
  const res = 18;
  let field = new Float32Array(0);
  let animId;
  let pointer = { x: -1000, y: -1000, active: false };
  let pointerForce = 0;
  let thresholds = [];
  for(let i = -3.0; i <= 3.0; i += 0.12) thresholds.push(i);

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    cols = Math.ceil(width / res) + 1;
    rows = Math.ceil(height / res) + 1;
    field = new Float32Array(cols * rows);
  }

  window.addEventListener('resize', resize);
  canvas.addEventListener('mousemove', e => { pointer.x = e.clientX; pointer.y = e.clientY; });

  function calcZ(x, y, t) {
    let qx = x * 0.003, qy = y * 0.003;
    let wX = Math.sin(qy * 0.8 + t * 0.3) * 1.5 + Math.cos(qx * 1.2 - t * 0.1) * 0.5;
    let wY = Math.cos(qx * 0.9 - t * 0.2) * 1.5 + Math.sin(qy * 1.1 + t * 0.15) * 0.5;
    qx += wX * 0.5; qy += wY * 0.5;
    let z = 0, scale = 1.0, amp = 1.0, maxV = 0;
    const rC = 0.766, rS = 0.642;
    for(let i = 0; i < 4; i++) {
      z += (Math.sin(qx * scale + t * 0.4) + Math.cos(qy * scale - t * 0.4)) * amp;
      maxV += amp * 2;
      let tx = qx * rC - qy * rS, ty = qx * rS + qy * rC;
      qx = tx; qy = ty;
      scale *= 1.87; amp *= 0.48;
    }
    return (z / maxV) * 6.0;
  }

  function interp(v1, v2, t, p1, p2) {
    if(v1 === v2) return p1 + (p2-p1)*0.5;
    return p1 + (p2-p1)*((t-v1)/(v2-v1));
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    const t = Date.now() * 0.0004;
    for(let i = 0; i < cols; i++) for(let j = 0; j < rows; j++) {
      field[i + j*cols] = calcZ(i*res, j*res, t);
    }
    for(let k = 0; k < thresholds.length; k++) {
      const th = thresholds[k];
      ctx.beginPath();
      ctx.lineWidth = k % 5 === 0 ? 1.6 : 0.6;
      ctx.strokeStyle = k % 5 === 0 ? 'rgba(26,92,42,0.9)' : 'rgba(26,92,42,0.4)';
      for(let i = 0; i < cols-1; i++) for(let j = 0; j < rows-1; j++) {
        const a = field[i+j*cols], b = field[i+1+j*cols], c = field[i+1+(j+1)*cols], d = field[i+(j+1)*cols];
        if(th < Math.min(a,b,c,d) || th > Math.max(a,b,c,d)) continue;
        const x = i*res, y = j*res;
        let s = 0;
        if(a>=th) s|=8; if(b>=th) s|=4; if(c>=th) s|=2; if(d>=th) s|=1;
        const tX=interp(a,b,th,x,x+res), tY=y;
        const rX=x+res, rY=interp(b,c,th,y,y+res);
        const bX=interp(d,c,th,x,x+res), bY=y+res;
        const lX=x, lY=interp(a,d,th,y,y+res);
        const L=(x1,y1,x2,y2)=>{ctx.moveTo(x1,y1);ctx.lineTo(x2,y2)};
        switch(s){
          case 1:L(lX,lY,bX,bY);break;case 2:L(bX,bY,rX,rY);break;case 3:L(lX,lY,rX,rY);break;
          case 4:L(tX,tY,rX,rY);break;case 5:L(lX,lY,tX,tY);L(bX,bY,rX,rY);break;
          case 6:L(tX,tY,bX,bY);break;case 7:L(lX,lY,tX,tY);break;case 8:L(lX,lY,tX,tY);break;
          case 9:L(tX,tY,bX,bY);break;case 10:L(lX,lY,bX,bY);L(tX,tY,rX,rY);break;
          case 11:L(tX,tY,rX,rY);break;case 12:L(lX,lY,rX,rY);break;
          case 13:L(bX,bY,rX,rY);break;case 14:L(lX,lY,bX,bY);break;
        }
      }
      ctx.stroke();
    }
    animId = requestAnimationFrame(animate);
  }

  resize();
  setTimeout(()=>animate(), 100);
