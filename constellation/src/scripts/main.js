const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

let points = [];
let blackHoles = [];
const maxBlackHoles = 2;
const n = 4000; // Number of points
const attractionForce = 0.01; // Attraction force between points
const blackHoleForce = 0.05; // Attraction force of black holes
const pointsAttractEachOther = true; // Boolean to control if points attract each other
const enableBlackHoleCreation = false; // Boolean to control if clicking places black holes
const pointsAttractedToMouse = true; // Boolean to control if points are attracted to the mouse cursor
const mouseAttractionForce = 0.40; // Attraction force of the mouse cursor

let mouseX = 0;
let mouseY = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

canvas.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

class Point {
    constructor(x, y, charge) {
        this.x = x;
        this.y = y;
        this.vx = 0; // Initial velocity in x
        this.vy = 0; // Initial velocity in y
        this.power = Math.random(); // Power of the point
        this.charge = charge; // Positive or negative charge
    }

    update(points, blackHoles) {
        if (pointsAttractEachOther) {
            for (let other of points) {
                if (other !== this) {
                    const dx = other.x - this.x;
                    const dy = other.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 100) { // Only attract if within a certain distance
                        const force = (this.charge * other.charge * attractionForce * this.power * other.power) / distance;
                        this.vx += (dx / distance) * force;
                        this.vy += (dy / distance) * force;
                    }
                }
            }
        }

        for (let blackHole of blackHoles) {
            const dx = blackHole.x - this.x;
            const dy = blackHole.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const force = (blackHoleForce * this.power * blackHole.strengh) / distance;
            this.vx += (dx / distance) * force;
            this.vy += (dy / distance) * force;
        }

        if (pointsAttractedToMouse) {
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const force = (mouseAttractionForce * this.power) / distance;
            this.vx += (dx / distance) * force;
            this.vy += (dy / distance) * force;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Boundary conditions
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        ctx.fillStyle = this.charge > 0 ? 'cyan' : 'yellow'; // Cyan for positive, yellow for negative
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.power, 0, Math.PI * 2);
        ctx.fill();
    }
}

class BlackHole {
    constructor(x, y, strength) {
        this.x = x;
        this.y = y;
        this.strengh = strength || 1;
    }

    draw() {
        ctx.fillStyle = 'purple';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.strengh / 10, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Initialize points with random positions and charges
for (let i = 0; i < n; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const charge = Math.random() > 0.5 ? 1 : -1; // Randomly assign positive or negative charge
    points.push(new Point(x, y, charge));
}

canvas.addEventListener('click', (event) => {
    if (!enableBlackHoleCreation) return;

    const x = event.clientX;
    const y = event.clientY;

    // Check if click is on a black hole
    for (let i = 0; i < blackHoles.length; i++) {
        const blackHole = blackHoles[i];
        const dx = blackHole.x - x;
        const dy = blackHole.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < blackHole.strengh / 10) {
            blackHoles.splice(i, 1); // Remove the black hole if clicked
            return;
        }
    }

    // Add a new black hole if not clicked on an existing one
    if (blackHoles.length >= maxBlackHoles) {
        blackHoles.shift(); // Remove the oldest black hole if max is reached
    }
    blackHoles.push(new BlackHole(x, y, Math.random() * 50));
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let point of points) {
        point.update(points, blackHoles);
        point.draw();
    }
    for (let blackHole of blackHoles) {
        blackHole.draw();
    }
    requestAnimationFrame(animate);
}

animate();