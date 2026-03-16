<a href="https://hackclub.com/"><img style="position: absolute; top: 0; left: 10px; border: 0; width: 256px; z-index: 999;" src="https://assets.hackclub.com/flag-orpheus-left.svg" alt="Hack Club"/></a>

## Project Overview
This 3D website was developed for the Hack Club challenge: Build A 3D Website - Get Tickets To Watch A Movie In 3D. The project explores WebGL rendering, parallax physics, and interactive 2D/3D hybrid elements.

# Live Site: [Link](https://shapessadrita.vercel.app/)

## Technical Specifications

### 01 The Digital Void
Blueprint of 3D architecture. Scroll to see the warp-speed effect.
- Geometry: Sphere (32 segments)
- Material: Wireframe Mesh

### 02 Geometric Flow
Complexity of logic. Notice the background transitions as you scroll.
- Geometry: Torus Knot
- Material: Standard Physical Shading

### 03 The Fractal Lattice
The harmony of Platonic solids.
- Geometry: Icosahedron (Subdivided)
- Material: Points Material

### 04 The Quantum Coil
Non-Euclidean curvature.
- Geometry: Octahedron
- Material: Mesh Normal Mapping

### Interactive Snake Game
A retro logic-based mini-game integrated into the 3D environment using HTML5 Canvas. This feature highlights the combination of 2D game logic within a 3D spatial interface.

## References and Credits
- ## [Challenge: Polygon Hack Club :-](https://polygon.hackclub.com/)
- ## [Organization: Hack Club :-](https://hackclub.com/)
- ## [Educational Reference: Animation techniques learned via Fireship :-](https://www.youtube.com/watch?v=Q7AOvWpIVHU)

## Local Setup Instructions

### Prerequisites
You need a modern web browser and a local development server to handle JavaScript modules. Opening the index.html file directly in a browser will not work due to CORS restrictions with ES Modules.

### Steps to Run Locally

1. Download the Project
Download or clone the repository files to your local machine.

2. Start a Local Server
Use one of the following methods to serve the files:

- VS Code: Install the "Live Server" extension. Right-click index.html and select "Open with Live Server".
- Python: Open your terminal in the project folder and run:
  python -m http.server 8000
- Node.js: If you have Node installed, run:
  npx serve

3. Open in Browser
Once the server is active, open your browser and go to the address provided (typically http://localhost:8000 or http://localhost:5500).

4. Interaction
- Scroll to navigate the 3D stages and trigger parallax effects.
- Use the mouse to test the reactive custom cursor.
- Use arrow keys to play the Snake Game in the designated section.
