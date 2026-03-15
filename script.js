import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

const starGeo = new THREE.BufferGeometry();
const starCount = 3000;
const starPos = new Float32Array(starCount * 3);
for(let i = 0; i < starCount * 3; i++) { starPos[i] = (Math.random() - 0.5) * 150; }
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.1, color: 0xffffff }));
scene.add(stars);

// Objects
const sphere = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32), new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true }));
scene.add(sphere);

const torus = new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.4, 100, 16), new THREE.MeshStandardMaterial({ color: 0xec4899 }));
torus.position.x = 50; 
scene.add(torus);

const lattice = new THREE.Points(new THREE.IcosahedronGeometry(2, 1), new THREE.PointsMaterial({ color: 0xfacc15, size: 0.1 }));
lattice.position.x = 50;
scene.add(lattice);

const quantum = new THREE.Mesh(new THREE.OctahedronGeometry(2, 0), new THREE.MeshNormalMaterial({ wireframe: true }));
quantum.position.x = 50;
scene.add(quantum);

const textureLoader = new THREE.TextureLoader();
const proxyUrl = 'https://images.weserv.nl/?url=drive.google.com/uc?id=1BY_aOeVS9yY0EMhG40TKfOUVnbwBpObB';
const cube = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.5, 3.5), new THREE.MeshStandardMaterial({ color: 0xffffff }));
cube.position.y = -50;
scene.add(cube);
textureLoader.load(proxyUrl, (tex) => { cube.material.map = tex; cube.material.needsUpdate = true; });

scene.add(new THREE.DirectionalLight(0xffffff, 2), new THREE.AmbientLight(0xffffff, 0.5));
camera.position.z = 10;

let isUserRotating = false;
let targetRot = 0;

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY, vh = window.innerHeight;
    
    // Scroll Triggers
    sphere.position.y = 3; 
    sphere.position.x = scrollY < vh ? -(scrollY / vh) * 15 : -50;

    if (scrollY > vh * 0.7 && scrollY < vh * 1.8) torus.position.x = 8 - ((scrollY - vh) / vh) * 15;
    else torus.position.x = 50;

    if (scrollY > vh * 1.9 && scrollY < vh * 3.0) lattice.position.x = 8 - ((scrollY - vh * 2.2) / vh) * 15;
    else lattice.position.x = 50;

    if (scrollY > vh * 3.1 && scrollY < vh * 4.2) quantum.position.x = 8 - ((scrollY - vh * 3.4) / vh) * 15;
    else quantum.position.x = 50;

    if (scrollY > vh * 4.5 && scrollY < vh * 6.0) cube.position.y = 0;
    else cube.position.y = -50;
});

const slider = document.getElementById('box-slider');
slider.addEventListener('input', (e) => { 
    isUserRotating = true;
    targetRot = parseFloat(e.target.value); 
});

const themeBtn = document.getElementById('theme-switch');
const themeIcon = document.getElementById('theme-icon');
themeBtn.addEventListener('click', () => {
    const body = document.body;
    if (body.classList.contains('dark-mode')) {
        body.classList.replace('dark-mode', 'light-mode');
        themeIcon.setAttribute('data-lucide', 'sun');
        stars.material.color.setHex(0x000000);
    } else {
        body.classList.replace('light-mode', 'dark-mode');
        themeIcon.setAttribute('data-lucide', 'moon');
        stars.material.color.setHex(0xffffff);
    }
    lucide.createIcons();
});

// Particles
const pCanvas = document.getElementById('particle-canvas');
const pCtx = pCanvas.getContext('2d');
let particles = [];
let particleState = "assembling"; 
let stateTimer = 0;

function initParticles() {
    pCanvas.width = window.innerWidth; 
    pCanvas.height = 400;
    pCtx.font = "bold " + (Math.min(pCanvas.width / 10, 80)) + "px Arial";
    pCtx.textAlign = "center";
    pCtx.fillText("BY SADRITA", pCanvas.width / 2, pCanvas.height / 2);
    
    const data = pCtx.getImageData(0, 0, pCanvas.width, pCanvas.height).data;
    particles = [];
    for (let i = 0; i < pCanvas.width; i += 6) {
        for (let j = 0; j < pCanvas.height; j += 6) {
            if (data[(i + j * pCanvas.width) * 4 + 3] > 128) {
                particles.push({
                    x: Math.random() * pCanvas.width,
                    y: Math.random() * pCanvas.height,
                    originX: Math.random() * pCanvas.width,
                    originY: Math.random() * pCanvas.height,
                    targetX: i,
                    targetY: j
                });
            }
        }
    }
}

// Snake Game
const sCanvas = document.getElementById('snake-game');
const sCtx = sCanvas.getContext('2d');
const scoreEl = document.getElementById('score-board');
let score = 0;
let box = 20;
let snake = [{ x: 9 * box, y: 10 * box }];
let food = { x: Math.floor(Math.random() * 15) * box, y: Math.floor(Math.random() * 15) * box };
let d;

document.addEventListener("keydown", direction);
function direction(event) {
    if(event.keyCode == 37 && d != "RIGHT") d = "LEFT";
    else if(event.keyCode == 38 && d != "DOWN") d = "UP";
    else if(event.keyCode == 39 && d != "LEFT") d = "RIGHT";
    else if(event.keyCode == 40 && d != "UP") d = "DOWN";
}

function drawSnake() {
    sCtx.clearRect(0, 0, sCanvas.width, sCanvas.height);
    const isLight = document.body.classList.contains('light-mode');
    
    for(let i = 0; i < snake.length; i++) {
        sCtx.fillStyle = (i == 0) ? (isLight ? "#00008B" : "#facc15") : (isLight ? "#4169E1" : "#ffffff");
        sCtx.fillRect(snake[i].x, snake[i].y, box, box);
        sCtx.strokeStyle = isLight ? "#fff9e6" : "#020617";
        sCtx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    sCtx.fillStyle = "#ec4899";
    sCtx.fillRect(food.x, food.y, box, box);

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if( d == "LEFT") snakeX -= box;
    if( d == "UP") snakeY -= box;
    if( d == "RIGHT") snakeX += box;
    if( d == "DOWN") snakeY += box;

    if(snakeX == food.x && snakeY == food.y) {
        score++;
        scoreEl.innerHTML = "Score: " + score;
        food = { x: Math.floor(Math.random() * 15) * box, y: Math.floor(Math.random() * 15) * box };
    } else {
        snake.pop();
    }

    let newHead = { x: snakeX, y: snakeY };

    if(snakeX < 0 || snakeX >= sCanvas.width || snakeY < 0 || snakeY >= sCanvas.height || collision(newHead, snake)) {
        clearInterval(game);
        alert("Game Over! Score: " + score);
        location.reload();
    }

    snake.unshift(newHead);
}

function collision(head, array) {
    for(let i = 0; i < array.length; i++) {
        if(head.x == array[i].x && head.y == array[i].y) return true;
    }
    return false;
}
let game = setInterval(drawSnake, 150);

function animate() {
    requestAnimationFrame(animate);
    stars.rotation.y += 0.001;
    sphere.rotation.y += 0.005;
    lattice.rotation.x += 0.01;
    lattice.rotation.y += 0.01;
    quantum.rotation.z += 0.01;

    if (!isUserRotating) {
        cube.rotation.y += 0.01;
        slider.value = cube.rotation.y % 6.28;
    } else {
        cube.rotation.y = THREE.MathUtils.lerp(cube.rotation.y, targetRot, 0.1);
    }
    
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    stateTimer++;

    particles.forEach(p => {
        let tx, ty;
        if (particleState === "assembling") {
            tx = p.targetX; ty = p.targetY;
            if (stateTimer > 30) { particleState = "holding"; stateTimer = 0; }
        } else if (particleState === "holding") {
            tx = p.targetX; ty = p.targetY;
            if (stateTimer > 30) { particleState = "dispersing"; stateTimer = 0; }
        } else if (particleState === "dispersing") {
            tx = p.originX; ty = p.originY;
            if (stateTimer > 30) { 
                particleState = "assembling"; stateTimer = 0; 
                p.originX = Math.random() * pCanvas.width; p.originY = Math.random() * pCanvas.height;
            }
        }
        p.x += (tx - p.x) * 0.15;
        p.y += (ty - p.y) * 0.15;
        pCtx.fillStyle = document.body.classList.contains('light-mode') ? "#00008B" : "#facc15";
        pCtx.fillRect(p.x, p.y, 2, 2);
    });

    renderer.render(scene, camera);
}

initParticles(); 
animate();
lucide.createIcons();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    initParticles();
});