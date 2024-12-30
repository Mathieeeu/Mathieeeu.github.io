const canvas = document.getElementById('springCanvas');
const ctx = canvas.getContext('2d');

const points = [];
const springs = [];

let draggingPoint = null;
const friction_factor = 0.90;

function createPoint(n, x, y) {
    const id = `p${n}`;
    if (x === undefined) {
        x = Math.random() * canvas.width;
    }
    if (y === undefined) {
        y = Math.random() * canvas.height;
    }
    points.push({ id, x, y, vx: 0, vy: 0 });
}

function createSpring(sourceId, destinationId, length, k, isRope = false) {
    springs.push({ source: sourceId, destination: destinationId, length, k, isRope });
}

function makeSquare(N) {
    const spacingX = canvas.width / (N + 1);
    const spacingY = canvas.height / (N + 1);

    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            createPoint(i * N + j, spacingX * (i + 1), spacingY * (j + 1));
        }
    }
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N - 1; j++) {
            createSpring(`p${i * N + j}`, `p${i * N + j + 1}`, spacingX, 0.1);
        }
    }
    for (let i = 0; i < N - 1; i++) {
        for (let j = 0; j < N; j++) {
            createSpring(`p${i * N + j}`, `p${(i + 1) * N + j}`, spacingY, 0.1);
        }
    }
}

function initCanva() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    makeSquare(20);
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    points.forEach((point, index) => {
        if (Math.hypot(point.x - mouseX, point.y - mouseY) < 10) {
            draggingPoint = index;
        }
    });
});

canvas.addEventListener('mousemove', (e) => {
    if (draggingPoint !== null) {
        const rect = canvas.getBoundingClientRect();
        points[draggingPoint].x = e.clientX - rect.left;
        points[draggingPoint].y = e.clientY - rect.top;
    }
});

canvas.addEventListener('mouseup', () => {
    draggingPoint = null;
});

function update() {
    springs.forEach(spring => {
        const p1 = points.find(point => point.id === spring.source);
        const p2 = points.find(point => point.id === spring.destination);
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.hypot(dx, dy);
        let force = 0;

        if (!spring.isRope || distance > spring.length) {
            force = (distance - spring.length) * spring.k;
        }

        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        p1.vx += fx;
        p1.vy += fy;
        p2.vx -= fx;
        p2.vy -= fy;
    });

    points.forEach(point => {
        point.vx *= friction_factor;
        point.vy *= friction_factor;
        point.x += point.vx;
        point.y += point.vy;
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    springs.forEach(spring => {
        const p1 = points.find(point => point.id === spring.source);
        const p2 = points.find(point => point.id === spring.destination);
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.hypot(dx, dy);
        const tension = Math.abs(distance - spring.length);

        // Change color based on tension
        const color = `rgb(${Math.min(255, tension * 10)}, 0, ${255 - Math.min(255, tension * 10)})`;

        ctx.lineWidth = 10;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    });

    points.forEach(point => {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

// Example usage
initCanva();

animate();