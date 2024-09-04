class Circle {
    constructor(rayon,x,y,angle) {
        this.rayon = rayon;
        this.x = x;
        this.y = y;
        this.angle = 0;
    }
    draw(ctx,color) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.rayon, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.stroke();
    }
}

class Point {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    draw(ctx,color) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function drawCircles() {
    let radius = minRadius;
    for (let i = 0; i < nbCircles; i++) {
        tabCircles[i] = new Circle(radius, x_center, y_center,0);
        tabCircles[i].draw(ctx,color);
        await sleep(100-2*i);
        tabPoints[i] = new Point(x_center + radius, y_center);
        tabPoints[i].draw(ctx,color);
        radius += (canvas.height - minRadius) / (2.5*nbCircles);
    }
    circlesReady = true;
}

function start() {
    if (circlesReady) {
        document.getElementById('start').style.display = 'none';
        animate(tabCircles);
    }
}

function playSound(url) { 
    var a = new Audio(url); 
    a.play(); 
}

function animate(tabCircles) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas once per frame
    for (let i = 0; i < nbCircles; i++) {
        tabCircles[i].angle += vitesse / tabCircles[i].rayon;
        if (tabCircles[i].angle > 2 * Math.PI) {
            console.log('sounds/'+ instrument + '/' + i%nbSounds + '.mp3');
            playSound('sounds/'+ instrument + '/' + i%nbSounds + '.mp3');
        }
        let x = tabCircles[i].rayon * Math.cos(tabCircles[i].angle) + x_center;
        let y = tabCircles[i].rayon * Math.sin(tabCircles[i].angle) + y_center;
        let point = new Point(x, y);
        if (tabCircles[i].angle >  2 * Math.PI) {
            tabCircles[i].angle = 0;
        }
        point.draw(ctx,color);
        tabCircles[i].draw(ctx,color);
    }
    requestAnimationFrame(() => animate(tabCircles));
}

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let circlesReady = false;

let x_center = canvas.width / 2;
let y_center = canvas.height / 2;
const nbCircles = 27;
let minRadius = 25;
let tabCircles = [];
let tabPoints = [];
let color = '#f2f4d1';
let color2 = '#179204';

const instrument = 'vibraphone';
const nbSounds = 10;

const vitesse = 2;
let framerate = 60;
let interval = 1000 / framerate;

drawCircles();

