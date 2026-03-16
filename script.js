import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// --- Custom Cursor Logic ---
const cursor = document.getElementById('custom-cursor');
document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

// --- Pop-out Image Logic ---
document.addEventListener('click', (e) => {
    const pop = document.createElement('img');
    pop.src = "https://assets.hackclub.com/flag-orpheus-top.svg";
    pop.className = 'click-pop';
    pop.style.left = e.clientX + 'px';
    pop.style.top = e.clientY + 'px';
    document.body.appendChild(pop);
    setTimeout(() => { pop.remove(); }, 300);
});

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
const latticeMat = new THREE.PointsMaterial({ color: 0xfacc15, size: 0.1 });
const lattice = new THREE.Points(new THREE.IcosahedronGeometry(2, 1), latticeMat);
lattice.position.x = 50;
scene.add(lattice);
const quantum = new THREE.Mesh(new THREE.OctahedronGeometry(2, 0), new THREE.MeshNormalMaterial({ wireframe: true }));
quantum.position.x = 50;
scene.add(quantum);

const cube = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.5, 3.5), new THREE.MeshStandardMaterial({ color: 0xffffff }));
cube.position.y = -50;
scene.add(cube);

scene.add(new THREE.DirectionalLight(0xffffff, 2), new THREE.AmbientLight(0xffffff, 0.5));
camera.position.z = 10;

let isUserRotating = false;
let targetRot = 0;

const themeBtn = document.getElementById('theme-switch');
themeBtn.addEventListener('click', () => {
    const body = document.body;
    if (body.classList.contains('dark-mode')) {
        body.classList.replace('dark-mode', 'light-mode');
        stars.material.color.setHex(0x000000);
        lattice.material.color.setHex(0x00008B);
    } else {
        body.classList.replace('light-mode', 'dark-mode');
        stars.material.color.setHex(0xffffff);
        lattice.material.color.setHex(0xfacc15);
    }
});

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY, vh = window.innerHeight;
    sphere.position.y = 3; 
    sphere.position.x = scrollY < vh ? -(scrollY / vh) * 15 : -50;
    if (scrollY > vh * 0.7 && scrollY < vh * 1.8) torus.position.x = 8 - ((scrollY - vh) / vh) * 15;
    else torus.position.x = 50;
    if (scrollY > vh * 1.9 && scrollY < vh * 3.0) lattice.position.x = 8 - ((scrollY - vh * 2.2) / vh) * 15;
    else lattice.position.x = 50;
    if (scrollY > vh * 3.1 && scrollY < vh * 4.2) quantum.position.x = 8 - ((scrollY - vh * 3.4) / vh) * 15;
    else quantum.position.x = 50;
    if (scrollY > vh * 4.5) cube.position.y = 0; else cube.position.y = -50;
});

// --- Particles & Snake Game Code remains exactly as before ---
const pCanvas = document.getElementById('particle-canvas');
const pCtx = pCanvas.getContext('2d', { willReadFrequently: true });
let particles = [];
let particleState = "assembling"; 
let stateTimer = 0;

function initParticles() {
    pCanvas.width = window.innerWidth; pCanvas.height = 400;
    pCtx.font = "bold " + (Math.min(pCanvas.width / 7, 120)) + "px Arial";
    pCtx.textAlign = "center"; pCtx.textBaseline = "middle";
    pCtx.fillText("BY SADRITA", pCanvas.width / 2, pCanvas.height / 2);
    const data = pCtx.getImageData(0, 0, pCanvas.width, pCanvas.height).data;
    particles = [];
    for (let i = 0; i < pCanvas.width; i += 6) {
        for (let j = 0; j < pCanvas.height; j += 6) {
            if (data[(i + j * pCanvas.width) * 4 + 3] > 128) {
                particles.push({x: Math.random()*pCanvas.width, y: Math.random()*pCanvas.height, originX: Math.random()*pCanvas.width, originY: Math.random()*pCanvas.height, targetX: i, targetY: j});
            }
        }
    }
}

const sCanvas = document.getElementById('snake-game');
const sCtx = sCanvas.getContext('2d');
let score = 0, box = 20, d;
let snake = [{ x: 9 * box, y: 10 * box }];
let food = { x: Math.floor(Math.random() * 15) * box, y: Math.floor(Math.random() * 15) * box };

document.addEventListener("keydown", (e) => {
    if(e.keyCode == 37 && d != "RIGHT") d = "LEFT";
    else if(e.keyCode == 38 && d != "DOWN") d = "UP";
    else if(e.keyCode == 39 && d != "LEFT") d = "RIGHT";
    else if(e.keyCode == 40 && d != "UP") d = "DOWN";
});

function drawSnake() {
    sCtx.clearRect(0, 0, sCanvas.width, sCanvas.height);
    for(let i = 0; i < snake.length; i++) {
        sCtx.fillStyle = (i == 0) ? "#facc15" : "#ffffff";
        sCtx.fillRect(snake[i].x, snake[i].y, box, box);
    }
    sCtx.fillStyle = "#ec4899";
    sCtx.fillRect(food.x, food.y, box, box);
    let snakeX = snake[0].x, snakeY = snake[0].y;
    if(d == "LEFT") snakeX -= box; if(d == "UP") snakeY -= box; if(d == "RIGHT") snakeX += box; if(d == "DOWN") snakeY += box;
    if(snakeX == food.x && snakeY == food.y) {
        score++; food = { x: Math.floor(Math.random() * 15) * box, y: Math.floor(Math.random() * 15) * box };
    } else { snake.pop(); }
    let newHead = { x: snakeX, y: snakeY };
    if(snakeX < 0 || snakeX >= sCanvas.width || snakeY < 0 || snakeY >= sCanvas.height) { location.reload(); }
    snake.unshift(newHead);
}
setInterval(drawSnake, 150);

function animate() {
    requestAnimationFrame(animate);
    stars.rotation.y += 0.001;
    sphere.rotation.y += 0.005;
    lattice.rotation.x += 0.01;
    quantum.rotation.z += 0.01;
    cube.rotation.y += 0.01;
    
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    stateTimer++;
    particles.forEach(p => {
        let tx = p.targetX, ty = p.targetY;
        if (stateTimer > 90) { tx = p.originX; ty = p.originY; if(stateTimer > 120) stateTimer = 0; }
        p.x += (tx - p.x) * 0.1; p.y += (ty - p.y) * 0.1;
        pCtx.fillStyle = "#facc15";
        pCtx.fillRect(p.x, p.y, 2, 2);
    });
    renderer.render(scene, camera);
}
initParticles(); animate();
lucide.createIcons();