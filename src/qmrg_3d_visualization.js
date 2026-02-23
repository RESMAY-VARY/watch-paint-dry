// QMRG 3D Visualization for Watch Paint Dry
// Laura Cruz - QMRG Theory Visualization

// QMRG Galaxy Data from your results
const qmrgGalaxies = [
    {name: "NGC2841", L: 0.05, sigma0: 3521, type: "barred_spiral", chi2: 1.12},
    {name: "NGC2403", L: 0.05, sigma0: 416, type: "late_spiral", chi2: 1.08},
    {name: "NGC3953", L: 0.05, sigma0: 250, type: "barred_spiral", chi2: 1.15},
    {name: "NGC3992", L: 0.05, sigma0: 220, type: "barred_spiral", chi2: 1.09},
    {name: "UGC128", L: 0.05, sigma0: 24, type: "dwarf_irregular", chi2: 1.21},
    {name: "DDO161", L: 10.60, sigma0: 280, type: "dwarf_irregular", chi2: 1.18},
    {name: "UGC6614", L: 10.26, sigma0: 118, type: "low_surface_brightness", chi2: 1.25},
    {name: "IC2574", L: 6.41, sigma0: 25, type: "dwarf_irregular", chi2: 1.22},
    {name: "NGC7331", L: 6.08, sigma0: 2754, type: "lenticular_spiral", chi2: 1.14},
    {name: "CamB", L: 5.10, sigma0: 8.5, type: "blue_compact_dwarf", chi2: 1.19}
];

class QMRGVisualization {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.galaxies = [];
        this.qMedium = null;
        this.currentGalaxy = 0;
        
        this.init();
    }

    init() {
        // Create Q-Medium field (background quantum medium)
        this.createQMedium();
        
        // Create galaxy visualizations
        this.createGalaxies();
        
        // Create UI controls
        this.createControls();
        
        // Start animation
        this.animate();
    }

    createQMedium() {
        // Create a large sphere representing the quantum medium
        const geometry = new THREE.SphereGeometry(50, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x1a1a2e,
            transparent: true,
            opacity: 0.3,
            wireframe: true
        });
        
        this.qMedium = new THREE.Mesh(geometry, material);
        this.scene.add(this.qMedium);
        
        // Add particle field for quantum medium
        this.createQuantumParticles();
    }

    createQuantumParticles() {
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 5000;
        const posArray = new Float32Array(particlesCount * 3);
        
        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 100;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.1,
            color: 0x4a7c7e,
            transparent: true,
            opacity: 0.6
        });
        
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(particlesMesh);
        this.quantumParticles = particlesMesh;
    }

    createGalaxies() {
        qmrgGalaxies.forEach((galaxy, index) => {
            const galaxyGroup = new THREE.Group();
            
            // Create galaxy disk
            const diskGeometry = new THREE.CylinderGeometry(
                galaxy.L * 2, // radius based on coherence length
                galaxy.L * 0.5, // height
                32, 1, false,
                0, Math.PI * 2
            );
            
            const diskMaterial = new THREE.MeshPhongMaterial({
                color: this.getGalaxyColor(galaxy.type),
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });
            
            const disk = new THREE.Mesh(diskGeometry, diskMaterial);
            galaxyGroup.add(disk);
            
            // Create central bulge/bar
            if (galaxy.type.includes('barred') || galaxy.type.includes('lenticular')) {
                const barGeometry = new THREE.BoxGeometry(galaxy.L * 3, galaxy.L * 0.8, galaxy.L * 0.3);
                const barMaterial = new THREE.MeshPhongMaterial({
                    color: 0xffd700,
                    emissive: 0x444400
                });
                const bar = new THREE.Mesh(barGeometry, barMaterial);
                galaxyGroup.add(bar);
            }
            
            // Position galaxies in a circle
            const angle = (index / qmrgGalaxies.length) * Math.PI * 2;
            galaxyGroup.position.x = Math.cos(angle) * 20;
            galaxyGroup.position.z = Math.sin(angle) * 20;
            galaxyGroup.position.y = (index - qmrgGalaxies.length/2) * 5;
            
            // Store galaxy data
            galaxyGroup.userData = galaxy;
            galaxyGroup.visible = index === 0; // Show first galaxy
            
            this.scene.add(galaxyGroup);
            this.galaxies.push(galaxyGroup);
        });
    }

    getGalaxyColor(type) {
        const colors = {
            'barred_spiral': 0xff6b6b,
            'late_spiral': 0x4ecdc4,
            'dwarf_irregular': 0x95e1d3,
            'low_surface_brightness': 0xf38181,
            'lenticular_spiral': 0xaa96da,
            'blue_compact_dwarf': 0xfc5c65
        };
        return colors[type] || 0x888888;
    }

    createControls() {
        // Add keyboard controls for switching galaxies
        document.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowRight') {
                this.nextGalaxy();
            } else if (event.key === 'ArrowLeft') {
                this.previousGalaxy();
            } else if (event.key === ' ') {
                this.toggleQMedium();
            }
        });
    }

    nextGalaxy() {
        this.galaxies[this.currentGalaxy].visible = false;
        this.currentGalaxy = (this.currentGalaxy + 1) % this.galaxies.length;
        this.galaxies[this.currentGalaxy].visible = true;
        this.updateInfo();
    }

    previousGalaxy() {
        this.galaxies[this.currentGalaxy].visible = false;
        this.currentGalaxy = (this.currentGalaxy - 1 + this.galaxies.length) % this.galaxies.length;
        this.galaxies[this.currentGalaxy].visible = true;
        this.updateInfo();
    }

    toggleQMedium() {
        this.qMedium.visible = !this.qMedium.visible;
        this.quantumParticles.visible = !this.quantumParticles.visible;
    }

    updateInfo() {
        const galaxy = this.galaxies[this.currentGalaxy].userData;
        console.log(`Galaxy: ${galaxy.name}`);
        console.log(`L = ${galaxy.L} kpc`);
        console.log(`Σ₀ = ${galaxy.sigma0} M☉/pc²`);
        console.log(`Type: ${galaxy.type}`);
        console.log(`χ² = ${galaxy.chi2}`);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Rotate quantum medium slowly
        if (this.qMedium) {
            this.qMedium.rotation.y += 0.001;
        }
        
        // Rotate quantum particles
        if (this.quantumParticles) {
            this.quantumParticles.rotation.y += 0.0005;
        }
        
        // Rotate current galaxy
        if (this.galaxies[this.currentGalaxy]) {
            this.galaxies[this.currentGalaxy].rotation.y += 0.005;
        }
        
        // Displacement effect: quantum medium avoids baryonic matter
        this.updateDisplacementEffect();
    }

    updateDisplacementEffect() {
        const currentGalaxy = this.galaxies[this.currentGalaxy];
        if (!currentGalaxy) return;
        
        const galaxyPosition = currentGalaxy.position;
        const galaxyData = currentGalaxy.userData;
        
        // Create displacement field around galaxy
        const displacementRadius = galaxyData.L * 5;
        
        // Animate quantum particles to avoid galaxy center
        const positions = this.quantumParticles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const px = positions[i];
            const py = positions[i + 1];
            const pz = positions[i + 2];
            
            const dx = px - galaxyPosition.x;
            const dy = py - galaxyPosition.y;
            const dz = pz - galaxyPosition.z;
            const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
            
            if (distance < displacementRadius) {
                // Push particles away from galaxy (displacement mechanism)
                const force = (1 - distance/displacementRadius) * 0.1;
                positions[i] += dx * force;
                positions[i + 1] += dy * force;
                positions[i + 2] += dz * force;
            }
        }
        
        this.quantumParticles.geometry.attributes.position.needsUpdate = true;
    }
}

// Integration with your Watch Paint Dry app
export function initQMRGVisualization(scene, camera, renderer) {
    const qmrgViz = new QMRGVisualization(scene, camera, renderer);
    
    // Add UI overlay
    const infoDiv = document.createElement('div');
    infoDiv.id = 'qmrg-info';
    infoDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 15px;
        border-radius: 10px;
        font-family: monospace;
        z-index: 1000;
    `;
    
    infoDiv.innerHTML = `
        <h3>QMRG Visualization</h3>
        <p>← → Arrow Keys: Switch Galaxies</p>
        <p>Space: Toggle Q-Medium</p>
        <p>Mouse: Rotate Camera</p>
        <div id="galaxy-info"></div>
    `;
    
    document.body.appendChild(infoDiv);
    
    return qmrgViz;
}
