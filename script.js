    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");
    const initialBallPosition = { x: 300, y: 250 };  
    const ball = {
      x: initialBallPosition.x,
      y: initialBallPosition.y,
      radius: 10,
      dx: 0,
      dy: 0,
    };

    const hole = {
      x: 1050,
      y: 250,
      radius: 15
    };

    const obstacles = [
      { x: 800, y: 100, w: 20, h: 100, dir: 1 },
      { x: 500, y: 300, w: 20, h: 100, dir: -1 },
    ];
    let displayDx = 0;   
    let displayDy = 0;   
    let displaySpeed = 0;
    let displayAngle = 0;
    const friction = 0.98;
    let isShooting = false;
    let mouseStart = null;
    let mouseCurrent = null;
    let isDragging = false;
    
    var shotBtn= document.getElementById('istrig');
    var iptForce=document.getElementById('force');
    var iptAngle=document.getElementById('angle');
    var theta=0;
    shotBtn.addEventListener('click',()=>{
      //shotBtn.innerHTML=iptForce.value;
      if(!isShooting){
        theta=(iptAngel.value/180)*Math.PI;
        ball.dx=iptForce.value*Math.cos(theta);
        ball.dy=iptForce.value*Math.sin(theta);
        isShooting=true;
      }
      

    });
    canvas.addEventListener("mousedown", e => {
      if (!isShooting) {
        isDragging = true;
        mouseStart = { x: e.offsetX, y: e.offsetY };
        mouseCurrent = { x: e.offsetX, y: e.offsetY };
      }
    });

    canvas.addEventListener("mousemove", e => {
      if (isDragging) {
        mouseCurrent = { x: e.offsetX, y: e.offsetY };
        const dx= (mouseStart.x - mouseCurrent.x).toFixed(2);
        const dy= (mouseStart.y - mouseCurrent.y).toFixed(2);

        displaySpeed = Math.sqrt(dx*dx + dy*dy).toFixed(2);
        displayAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        displayAngle = displayAngle.toFixed(1); 
      }
    });

    canvas.addEventListener("mouseup", e => {
      if (isDragging) {
        const dx = mouseStart.x - e.offsetX;
        const dy = mouseStart.y - e.offsetY;
        ball.dx = dx * 0.1;
        ball.dy = dy * 0.1;
        displaySpeed = Math.sqrt(dx*dx + dy*dy).toFixed(2);
        isShooting = true;
        isDragging = false;
      }
    });

    function drawBall() {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
    }

    function drawHole() {
      ctx.beginPath();
      ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
      ctx.fillStyle = "yellow"; 
      ctx.fill();
    }

    function drawObstacles() {
      obstacles.forEach(ob => {
        ctx.fillStyle = "red";
        ctx.fillRect(ob.x, ob.y, ob.w, ob.h);

        ob.y += 2 * ob.dir;
        if (ob.y <= 0 || ob.y + ob.h >= canvas.height) {
          ob.dir *= -1;
        }
      });
    }

    function checkCollision(ob) {
      return (
        ball.x + ball.radius > ob.x &&
        ball.x - ball.radius < ob.x + ob.w &&
        ball.y + ball.radius > ob.y &&
        ball.y - ball.radius < ob.y + ob.h
      );
    }

    function drawAimLine() {
      if (isDragging && mouseStart && mouseCurrent) {
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(mouseCurrent.x, mouseCurrent.y);
        ctx.strokeStyle = "lime";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    function update() {
      if (isShooting) {
        
        ball.x += ball.dx;
        ball.y += ball.dy;

        ball.dx *= friction;
        ball.dy *= friction;

        if (ball.x <= ball.radius || ball.x >= canvas.width - ball.radius) ball.dx *= -1;
        if (ball.y <= ball.radius || ball.y >= canvas.height - ball.radius) ball.dy *= -1;

        obstacles.forEach(ob => {
          if (checkCollision(ob)) {
            ball.dx *= -1;
            ball.dy *= -1;
          }
        });

        const dist = Math.hypot(ball.x - hole.x, ball.y - hole.y);
        if (dist <= ball.radius + hole.radius) {
          alert("SCORE");
          resetBall();
        }

        if (Math.abs(ball.dx) < 0.1 && Math.abs(ball.dy) < 0.1) {
          isShooting = false;
        }
      }
    }

    function resetBall() {
      ball.x = initialBallPosition.x;
      ball.y = initialBallPosition.y;
      ball.dx = 0;
      ball.dy = 0;
      isShooting = false;
    }
    function drawforceangle(){

    }
    async function fetchData() {
        try{
            const response= await fetch('GET_status');
            data=await response.json();
            var content=`Force : ${data.force}\n Angle : ${data.angle} \n Trig : ${data.trig}`;
            iptForce.value=data.force;
            iptAngle.value=data.angle;
            if(data.trig=='1'&&!isShooting ){
                theta=(iptAngle.value/180)*Math.PI;
                ball.dx=iptForce.value*Math.cos(theta);
                ball.dy=iptForce.value*Math.sin(theta);
                shotBtn.style.backgroundColor='green';
                isShooting=true;
            }else{
                shotBtn.style.backgroundColor='gray';
            }
            document.getElementById('content').innerText=content;
        }catch(error){
            console.error("Oops",error);
        }
    }
    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawHole();
      drawObstacles();
      drawBall();
      drawAimLine();  

    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("FORCE: " + ((displaySpeed)/10).toFixed(2), 50, 50);
    ctx.fillText("ANGLE: " + displayAngle + "°", 50, 80);
    update();
      requestAnimationFrame(loop);
    }
    setInterval(fetchData,100);
    loop();
