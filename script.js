// Premios de la ruleta
const prizes = [
    "10% OFF",
    "Envío gratis",
    "2% OFF",
    "Gira otra vez",
    "1 prenda gratis",
    "😞",
    "¡Mala suerte!",
    "2% OFF" // Duplicado para mantener 8 secciones
];

// Elementos del DOM
const welcomeScreen = document.getElementById('welcome-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const startButton = document.getElementById('start-game');
const spinButton = document.getElementById('spin-btn');
const playAgainButton = document.getElementById('play-again');
const spinsLeftElement = document.getElementById('spins-left');
const prizePopup = document.getElementById('prize-popup');
const prizeMessage = document.getElementById('prize-message');
const prizesList = document.getElementById('prizes-list');
const resultTitle = document.getElementById('result-title');
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');

// Variables del juego
let currentRotation = 0;
let isSpinning = false;
let spinsLeft = 2; // Siempre comenzamos con 2 tiradas
let wonPrizes = [];
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = canvas.width / 2 - 10;
let wheelRotation = 0;

// Colores pastel para la ruleta
const wheelColors = [
    'rgba(255, 182, 193, 0.6)',  // Rosa
    'rgba(173, 216, 230, 0.6)',  // Azul
    'rgba(144, 238, 144, 0.6)',  // Verde
    'rgba(255, 255, 153, 0.6)',  // Amarillo
    'rgba(255, 182, 193, 0.6)',  // Rosa
    'rgba(173, 216, 230, 0.6)',  // Azul
    'rgba(144, 238, 144, 0.6)',  // Verde
    'rgba(255, 255, 153, 0.6)'   // Amarillo
];

// Navegación entre pantallas
startButton.addEventListener('click', () => {
    welcomeScreen.classList.remove('active');
    gameScreen.classList.add('active');
    resetGame();
    drawWheel();
});

playAgainButton.addEventListener('click', () => {
    resultScreen.classList.remove('active');
    welcomeScreen.classList.add('active');
    resetGame();
});

function resetGame() {
    spinsLeft = 2; // Siempre reseteamos a 2 tiradas
    wonPrizes = [];
    currentRotation = 0;
    spinsLeftElement.textContent = spinsLeft;
    spinButton.disabled = false;
    prizePopup.classList.remove('active');
}

// Dibujar la ruleta
function drawWheel() {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(centerX, centerY);
    ctx.rotate(wheelRotation);
    ctx.translate(-centerX, -centerY);
    const sliceAngle = (2 * Math.PI) / prizes.length;
    prizes.forEach((prize, index) => {
        const startAngle = index * sliceAngle;
        const endAngle = startAngle + sliceAngle;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = wheelColors[index % wheelColors.length];
        ctx.fill();
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        // Texto del premio
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 16px Montserrat';
        ctx.fillText(prize, radius - 30, 5);
        ctx.restore();
    });
    ctx.restore();
}

// Mostrar popup de premio
function showPrizePopup(prize) {
    let message = '';
    let emoji = '🎉';

    if (prize === "Gira otra vez") {
        message = "¡Obtienes una tirada extra!";
        emoji = "🎲";
        spinsLeft++; // Solo añadimos una tirada extra
        spinsLeftElement.textContent = spinsLeft;
    } else if (prize === "😞") {
        message = "¡Mala suerte! Te quedas sin tiradas y sin premios";
        emoji = "😢";
        // Perder todas las tiradas y premios
        spinsLeft = 0;
        wonPrizes = [];
        spinsLeftElement.textContent = spinsLeft;
    } else if (prize === "¡Mala suerte!") {
        message = "¡Mala suerte! Inténtalo de nuevo";
        emoji = "😢";
    } else {
        message = `¡Felicidades! Has ganado: ${prize}`;
        emoji = "🎉"; // Aseguramos que solo los premios positivos tengan el emoji de fiesta
    }

    prizeMessage.innerHTML = `${message} <span class="emoji">${emoji}</span>`;
    prizePopup.classList.add('active');
    
    setTimeout(() => {
        prizePopup.classList.remove('active');
        // Si perdió todas las tiradas, mostrar resultados inmediatamente
        if (prize === "😞") {
            setTimeout(showResults, 500);
        }
    }, 2000);
}

// Girar la ruleta
function spinWheel() {
    if (isSpinning || spinsLeft <= 0) return;
    isSpinning = true;
    spinButton.disabled = true;
    const totalSlices = prizes.length;
    const sliceAngle = (2 * Math.PI) / totalSlices;
    const targetIndex = Math.floor(Math.random() * totalSlices);
    const targetRotation = 0 - (targetIndex * sliceAngle) - (sliceAngle / 2);
    const extraSpins = 6 * 2 * Math.PI;
    const finalRotation = extraSpins + targetRotation;
    const initialRotation = 0;
    wheelRotation = 0;
    const duration = 3000;
    const startTime = performance.now();

    function animate(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = (t) => 1 - Math.pow(1 - t, 3);
        wheelRotation = initialRotation + (finalRotation - initialRotation) * easeOut(progress);
        drawWheel();
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            const wonPrize = prizes[targetIndex];
            if (wonPrize === "Gira otra vez") {
                showPrizePopup(wonPrize);
                // La tirada extra ya se añadió en showPrizePopup
            } else if (wonPrize === "😞") {
                showPrizePopup(wonPrize);
            } else if (wonPrize === "¡Mala suerte!") {
                showPrizePopup(wonPrize);
                spinsLeft--;
                spinsLeftElement.textContent = spinsLeft;
            } else {
                wonPrizes.push(wonPrize);
                showPrizePopup(wonPrize);
                spinsLeft--;
                spinsLeftElement.textContent = spinsLeft;
            }

            if (spinsLeft <= 0) {
                setTimeout(showResults, 2000);
            } else {
                spinButton.disabled = false;
            }
        }
    }
    requestAnimationFrame(animate);
}

function showResults() {
    gameScreen.classList.remove('active');
    resultScreen.classList.add('active');
    // Limpiar emojis previos
    document.querySelectorAll('.celebration-emoji, .sad-emoji').forEach(e => e.remove());
    
    if (wonPrizes.length > 0) {
        resultTitle.textContent = "¡Felicidades!";
        prizesList.innerHTML = wonPrizes.map(prize => {
            let emoji = '🎉';
            if (prize.includes('OFF')) emoji = '💫';
            if (prize.includes('gratis')) emoji = '🎁';
            return `<div class="prize-item">${prize} <span class="emoji">${emoji}</span></div>`;
        }).join('');
        launchCelebrationEmojis();
    } else {
        resultTitle.textContent = "¡Lo siento...!";
        prizesList.innerHTML = `
            <div class="prize-item">
                Hoy no fue un día de suerte 
                <span class="emoji">😢</span>
            </div>
        `;
        showSadEmojis();
        // Asegurarnos de que no haya emojis de celebración
        document.querySelectorAll('.celebration-emoji').forEach(e => e.remove());
    }
}

// Lanzar emojis de celebración animados
function launchCelebrationEmojis() {
    const emojis = ['🎉','🎊','🥳','✨'];
    const count = 24;
    for (let i = 0; i < count; i++) {
        const emoji = document.createElement('div');
        emoji.className = 'celebration-emoji';
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        emoji.style.left = Math.random() * 100 + 'vw';
        emoji.style.animationDuration = (2.5 + Math.random() * 2) + 's';
        emoji.style.fontSize = (1.5 + Math.random() * 1.5) + 'rem';
        emoji.style.transform = `rotate(${Math.random()*360}deg)`;
        document.body.appendChild(emoji);
    }
    setTimeout(() => {
        document.querySelectorAll('.celebration-emoji').forEach(e => e.remove());
    }, 5000);
}

// Mostrar emojis de tristeza animados
function showSadEmojis() {
    const emojis = ['😢', '☹️', '😞', '😔'];
    const count = 24;
    
    for (let i = 0; i < count; i++) {
        const emoji = document.createElement('div');
        emoji.className = 'sad-emoji';
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        emoji.style.left = Math.random() * 100 + 'vw';
        emoji.style.animationDuration = (2.5 + Math.random() * 2) + 's';
        emoji.style.fontSize = (1.5 + Math.random() * 1.5) + 'rem';
        emoji.style.transform = `rotate(${Math.random()*360}deg)`;
        document.body.appendChild(emoji);
    }
    
    setTimeout(() => {
        document.querySelectorAll('.sad-emoji').forEach(e => e.remove());
    }, 5000);
}

// Event listeners
spinButton.addEventListener('click', spinWheel);

// Dibujar la ruleta inicial
drawWheel(); 