class Circle {
    constructor(rayon,x,y,angle,color) {
        this.rayon = rayon;
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.color = color;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.rayon, 0, 2 * Math.PI);
        ctx.strokeStyle = this.color;
        if (this.color == color1) {
            ctx.lineWidth = 3;
        }
        else {
            ctx.lineWidth = 5;
        }
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

    // joue un son pour faire charger (pour éviter le délai lors des premiers sons) 
    // envoie une exception comme personne n'a interagi avec la page mais au moins il n'y a pas le son :)
    var a = new Audio('sounds/'+ instrument + '/0.mp3');
    a.volume = 0;
    a.play();
    a.volume = 1;

    let radius = minRadius;
    for (let i = 0; i < nbCircles; i++) {
        tabCircles[i] = new Circle(radius, x_center, y_center,0,color1);
        tabCircles[i].draw(ctx);
        await sleep(100-2*i);
        tabPoints[i] = new Point(x_center + radius, y_center);
        tabPoints[i].draw(ctx,color);
        radius += (canvas.height - minRadius) / (2.5*nbCircles);
    }
    circlesReady = true;
    document.getElementById('start').style.visibility = 'visible';
}

function start() {
    if (circlesReady) {
        document.getElementById('start').style.visibility = 'hidden';
        document.getElementById('slidecontainer').style.visibility = 'visible'; 
        animate(tabCircles);
    }
}

function playSound(url) { 
    var a = new Audio(url); 
    a.play(); 
}

function animate(tabCircles) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < nbCircles; i++) {
        tabCircles[i].angle += speed.value/1000 / tabCircles[i].rayon;
        if (tabCircles[i].angle > 2 * Math.PI) {
            // console.log('circle:' + i + ' - sounds/' + instrument + '/' + i%nbSounds + '.mp3');
            playSound('sounds/'+ instrument + '/' + i%nbSounds + '.mp3');

            tabCircles[i].color = color2;
            setTimeout(() => {
                tabCircles[i].color = color;
            }, 100);
        }
        let x = tabCircles[i].rayon * Math.cos(tabCircles[i].angle) + x_center;
        let y = tabCircles[i].rayon * Math.sin(tabCircles[i].angle) + y_center;
        let point = new Point(x, y);
        if (tabCircles[i].angle >  2 * Math.PI) {
            tabCircles[i].angle = 0;
        }
        point.draw(ctx,color);
        tabCircles[i].draw(ctx);
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
let color1 = '#f2f4d1';
let color2 = '#179204';
let color = color1;

const instrument = 'vibraphone';
const nbSounds = 10;

let framerate = 60;
let interval = 1000 / framerate;

let speed = document.getElementById("speed");
let output = document.getElementById("value");
output.innerHTML = speed.value/1000;
speed.oninput = function() {
    output.innerHTML = this.value/1000;
}

drawCircles();
