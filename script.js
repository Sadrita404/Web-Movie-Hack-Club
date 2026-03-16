import * as THREE from 'three';

// --- Initialization ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// --- Responsive Smooth Cursor Logic ---
const cursor = document.getElementById('custom-cursor');
let mouseX = 0, mouseY = 0; 
let cursorX = 0, cursorY = 0; 

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
document.addEventListener('mouseup', () => cursor.classList.remove('clicking'));

function updateCursor() {
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    requestAnimationFrame(updateCursor);
}
updateCursor();

// --- Click Pop-out ---
document.addEventListener('click', (e) => {
    const pop = document.createElement('img');
    pop.src = "https://assets.hackclub.com/flag-orpheus-top.svg";
    pop.className = 'click-pop';
    pop.style.left = e.clientX + 'px';
    pop.style.top = e.clientY + 'px';
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 350);
});

// --- World Building: Stars ---
const starGeo = new THREE.BufferGeometry();
const starCount = 4000;
const starPos = new Float32Array(starCount * 3);
for(let i = 0; i < starCount * 3; i++) { starPos[i] = (Math.random() - 0.5) * 200; }
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.12, color: 0xffffff }));
scene.add(stars);

// --- 3D Gallery Objects ---
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(2, 32, 32), 
    new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true })
);
scene.add(sphere);

const torus = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.4, 100, 16), 
    new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.3, metalness: 0.7 })
);
torus.position.x = 60; 
scene.add(torus);

const latticeMat = new THREE.PointsMaterial({ color: 0xfacc15, size: 0.08 });
const lattice = new THREE.Points(new THREE.IcosahedronGeometry(2.2, 2), latticeMat);
lattice.position.x = 60;
scene.add(lattice);

const quantum = new THREE.Mesh(
    new THREE.OctahedronGeometry(2, 0), 
    new THREE.MeshNormalMaterial({ wireframe: true, transparent: true, opacity: 0.6 })
);
quantum.position.x = 60;
scene.add(quantum);

// --- Texture Cube (Sadrita Profile) ---
const textureLoader = new THREE.TextureLoader();
const proxyUrl = 'https://images.weserv.nl/?url=drive.google.com/uc?id=1BY_aOeVS9yY0EMhG40TKfOUVnbwBpObB';
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 3.8, 3.8), 
    new THREE.MeshStandardMaterial({ color: 0xffffff })
);
cube.position.y = -60;
scene.add(cube);
textureLoader.load(proxyUrl, (tex) => { 
    cube.material.map = tex; 
    cube.material.needsUpdate = true; 
});

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 2.5);
light.position.set(5, 5, 5);
scene.add(light, new THREE.AmbientLight(0xffffff, 0.4));
camera.position.z = 12;

// --- Scroll & Parallax Engine ---
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY, vh = window.innerHeight;
    sphere.position.y = 2.5; 
    sphere.position.x = scrollY < vh ? -(scrollY / vh) * 18 : -60;

    if (scrollY > vh * 0.6 && scrollY < vh * 1.8) {
        torus.position.x = 10 - ((scrollY - vh) / vh) * 18;
    } else torus.position.x = 60;

    if (scrollY > vh * 1.8 && scrollY < vh * 3.0) {
        lattice.position.x = 10 - ((scrollY - vh * 2.2) / vh) * 18;
    } else lattice.position.x = 60;

    if (scrollY > vh * 3.1 && scrollY < vh * 4.3) {
        quantum.position.x = 10 - ((scrollY - vh * 3.5) / vh) * 18;
    } else quantum.position.x = 60;

    if (scrollY > vh * 4.5) cube.position.y = 0; else cube.position.y = -60;
});

// --- Manual Rotation Slider ---
const slider = document.getElementById('box-slider');
let isManualRotation = false;
slider.addEventListener('input', (e) => {
    isManualRotation = true;
    cube.rotation.y = parseFloat(e.target.value);
    clearTimeout(window.sliderTimeout);
    window.sliderTimeout = setTimeout(() => { isManualRotation = false; }, 2000);
});

// --- Theme Management ---
const themeBtn = document.getElementById('theme-switch');
themeBtn.addEventListener('click', () => {
    const body = document.body;
    const isDark = body.classList.contains('dark-mode');
    if (isDark) {
        body.classList.replace('dark-mode', 'light-mode');
        stars.material.color.setHex(0x000000);
        lattice.material.color.setHex(0x1e40af); 
    } else {
        body.classList.replace('light-mode', 'dark-mode');
        stars.material.color.setHex(0xffffff);
        lattice.material.color.setHex(0xfacc15);
    }
    lucide.createIcons();
});

// --- Snake Game Logic ---
const sCanvas = document.getElementById('snake-game');
const sCtx = sCanvas.getContext('2d');
let box = 20, d = null, score = 0;
let snake = [{ x: 9 * box, y: 10 * box }];
let food = { x: Math.floor(Math.random() * 14 + 1) * box, y: Math.floor(Math.random() * 14 + 1) * box };

document.addEventListener("keydown", (e) => {
    if(e.key === "ArrowLeft" && d !== "RIGHT") d = "LEFT";
    else if(e.key === "ArrowUp" && d !== "DOWN") d = "UP";
    else if(e.key === "ArrowRight" && d !== "LEFT") d = "RIGHT";
    else if(e.key === "ArrowDown" && d !== "UP") d = "DOWN";
});

function drawSnake() {
    sCtx.fillStyle = "rgba(0,0,0,0.3)";
    sCtx.fillRect(0, 0, sCanvas.width, sCanvas.height);
    for(let i = 0; i < snake.length; i++) {
        sCtx.fillStyle = (i === 0) ? "#facc15" : "#ffffff";
        sCtx.shadowBlur = 10;
        sCtx.shadowColor = "#facc15";
        sCtx.fillRect(snake[i].x, snake[i].y, box - 2, box - 2);
    }
    sCtx.fillStyle = "#ec4899";
    sCtx.fillRect(food.x, food.y, box - 2, box - 2);
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;
    if( d === "LEFT") snakeX -= box;
    if( d === "UP") snakeY -= box;
    if( d === "RIGHT") snakeX += box;
    if( d === "DOWN") snakeY += box;
    if(snakeX === food.x && snakeY === food.y) {
        score++;
        document.getElementById('score-board').innerText = "Score: " + score;
        food = { x: Math.floor(Math.random() * 14 + 1) * box, y: Math.floor(Math.random() * 14 + 1) * box };
    } else if(d) {
        snake.pop();
    }
    let newHead = { x: snakeX, y: snakeY };
    if(snakeX < 0 || snakeX >= sCanvas.width || snakeY < 0 || snakeY >= sCanvas.height || collision(newHead, snake)) {
        d = null; score = 0;
        document.getElementById('score-board').innerText = "Score: 0";
        snake = [{ x: 9 * box, y: 10 * box }];
    }
    if(d) snake.unshift(newHead);
}
function collision(head, array) {
    for(let i = 0; i < array.length; i++) {
        if(head.x === array[i].x && head.y === array[i].y) return true;
    }
    return false;
}
setInterval(drawSnake, 120);

// --- Particle Logo Canvas ---
const pCanvas = document.getElementById('particle-canvas');
const pCtx = pCanvas.getContext('2d');
let particles = [];
let stateTimer = 0;

function initParticles() {
    pCanvas.width = window.innerWidth; 
    pCanvas.height = 400;
    pCtx.font = "bold 90px Arial";
    pCtx.textAlign = "center";
    pCtx.textBaseline = "middle";
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

// --- Main Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    
    // Auto-rotations
    stars.rotation.y += 0.0008;
    sphere.rotation.y += 0.01;
    lattice.rotation.x += 0.01;
    lattice.rotation.z += 0.005;
    quantum.rotation.y += 0.02;

    if (!isManualRotation) {
        cube.rotation.y += 0.01;
        cube.rotation.x += 0.005;
    }

    // --- UPDATED PARTICLE LOGIC (1.5s Cycle) ---
    // Total Cycle: 90 frames (1.5s at 60fps)
    // Phase 1 (Hold): 0 to 60 frames (1.0s)
    // Phase 2 (Shatter): 61 to 90 frames (0.5s)
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    stateTimer++;
    
    particles.forEach(p => {
        let tx, ty;
        
        if (stateTimer <= 60) { 
            // Phase 1: Form and Hold Text (1.0s)
            tx = p.targetX; 
            ty = p.targetY;
        } else {
            // Phase 2: Shatter and Disperse (0.5s)
            tx = p.originX; 
            ty = p.originY;
            if(stateTimer >= 90) stateTimer = 0; // Reset every 1.5 seconds
        }
        
        // Lerp factor adjusted for smooth movement
        p.x += (tx - p.x) * 0.18; 
        p.y += (ty - p.y) * 0.18;
        
        pCtx.fillStyle = document.body.classList.contains('light-mode') ? "#1e40af" : "#facc15";
        pCtx.fillRect(p.x, p.y, 2.5, 2.5);
    });

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    initParticles();
});

initParticles();
animate();
lucide.createIcons();
