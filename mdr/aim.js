// Initialize variables
let score = 0;
let timeLimit = 5000; // 3 seconds
let buttonCount = 3;
let minSize = 10; // Minimum size of the button
let maxSize = 50; // Maximum size of the button
const buttons = [];
const scoreElement = document.getElementById('score');
const averageElement = document.getElementById('average');
const menuElement = document.getElementById('menu');
const finalScoreElement = document.getElementById('finalScore');
let startTime = 0;
let averageInterval;

// Function to create buttons
function createButtons() {
    for (let i = 0; i < buttonCount; i++) {
        const button = document.createElement('div');
        button.classList.add('cible');
        const size = getRandomSize(minSize, maxSize);
        button.style.width = `${size}px`;
        button.style.height = `${size}px`;
        document.body.appendChild(button);
        buttons.push(button);
    }
}

// Function to generate a random size within a given range
function getRandomSize(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to randomly position a button
function positionButton(button) {
    const x = Math.random() * (window.innerWidth - button.offsetWidth);
    const y = Math.random() * (window.innerHeight - button.offsetHeight);
    button.style.left = `${x}px`;
    button.style.top = `${y}px`;
}

// Function to handle button clicks
function handleClick(event) {
    score++;
    scoreElement.textContent = score;
    positionButton(event.target);
    resetTimer(event.target);
}

// Function to calculate color based on remaining time
function calculateColor(remainingTime) {
    const green = Math.floor((remainingTime / timeLimit) * 255);
    const red = 255 - green;
    return `rgb(${red}, ${green}, 0)`;
}

// Function to handle the countdown timer
function startTimer(button) {
    const startTime = Date.now();
    button.timer = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = timeLimit - elapsedTime;
        button.style.backgroundColor = calculateColor(remainingTime);
        if (remainingTime <= 0) {
            clearInterval(button.timer);
            resetGame();
        }
    }, 100);
}

// Function to reset the timer
function resetTimer(button) {
    clearInterval(button.timer);
    startTimer(button);
}

// Function to reset the game
function resetGame() {
    clearInterval(averageInterval);
    scoreElement.style.display = 'none';
    averageElement.style.display = 'none';
    finalScoreElement.style.display = 'block';
    finalScoreElement.textContent = `Score final: ${score}`;
    buttons.forEach(button => {
        button.remove();
    });
    buttons.length = 0;
    menuElement.style.display = 'block';
}

// Function to start the game
function startGame() {
    minSize = parseInt(document.getElementById('minSize').value);
    maxSize = parseInt(document.getElementById('maxSize').value);
    timeLimit = parseInt(document.getElementById('timeLimit').value);
    buttonCount = parseInt(document.getElementById('buttonCount').value);
    menuElement.style.display = 'none';
    scoreElement.style.display = 'block';
    averageElement.style.display = 'block';
    finalScoreElement.style.display = 'none';
    score = 0;
    scoreElement.textContent = score;
    startTime = Date.now();
    createButtons();
    buttons.forEach(button => {
        button.addEventListener('click', handleClick);
        positionButton(button);
        startTimer(button);
    });
    averageInterval = setInterval(updateAverage, 100);
}

// Function to update the average clicks per second
function updateAverage() {
    const elapsedTime = (Date.now() - startTime) / 1000; // Convert to seconds
    const cps = (score / elapsedTime).toFixed(2);
    averageElement.textContent = `${cps} CPS`;
}

// Functions to start the game with predefined difficulty levels
function startEasy() {
    minSize = 50;
    maxSize = 100;
    timeLimit = 5000;
    buttonCount = 4;
    startGame();
}

function startMedium() {
    minSize = 20;
    maxSize = 70;
    timeLimit = 5000;
    buttonCount = 5;
    startGame();
}

function startHard() {
    minSize = 10;
    maxSize = 30;
    timeLimit = 5000;
    buttonCount = 5;
    startGame();
}
