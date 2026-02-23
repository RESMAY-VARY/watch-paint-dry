// QMRG Mode for Watch Paint Dry
// Laura Cruz - QMRG Theory Integration

import * as THREE from 'three';
import { initQMRGVisualization } from './qmrg_3d_visualization.js';

class QMRGMode {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.isActive = false;
        this.qmrgViz = null;
        this.originalScene = null;
        this.originalCamera = null;
        
        this.createToggleButton();
    }

    createToggleButton() {
        const controlsNav = document.querySelector('.controls');
        
        const qmrgButton = document.createElement('button');
        qmrgButton.className = 'tool-btn';
        qmrgButton.id = 'qmrg-btn';
        qmrgButton.innerHTML = '🌌 QMRG';
        qmrgButton.setAttribute('aria-label', 'Toggle QMRG Galaxy Mode');
        qmrgButton.title = 'Toggle QMRG Galaxy Visualization Mode';
        
        controlsNav.appendChild(qmrgButton);
        
        qmrgButton.addEventListener('click', () => this.toggleQMRGMode());
    }

    toggleQMRGMode() {
        const button = document.getElementById('qmrg-btn');
        const titleCard = document.querySelector('.title-card');
        const subtitle = titleCard.querySelector('.subtitle');
        
        if (!this.isActive) {
            this.enterQMRGMode();
            button.classList.add('active');
            titleCard.querySelector('h1').textContent = 'QMRG Universe';
            subtitle.textContent = '← → Switch Galaxies • Space Toggle Q-Medium • Mouse Rotate • Scroll Zoom';
        } else {
            this.exitQMRGMode();
            button.classList.remove('active');
            titleCard.querySelector('h1').textContent = 'Watch Paint Dry';
            subtitle.textContent = 'Paint in 3D space • Mouse/Arrows to move • Scroll/W-S for depth • Space to paint';
        }
    }

    enterQMRGMode() {
        // Save original scene state
        this.originalScene = this.scene.clone();
        this.originalCamera = this.camera.position.clone();
        
        // Clear existing scene
        while(this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }
        
        // Reset scene background for QMRG
        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.Fog(0x0a0a0a, 10, 100);
        
        // Position camera for QMRG view
        this.camera.position.set(30, 20, 30);
        this.camera.lookAt(0, 0, 0);
        
        // Initialize QMRG visualization
        this.qmrgViz = initQMRGVisualization(this.scene, this.camera, this.renderer);
        
        // Hide paint controls
        this.hidePaintControls();
        
        // Show QMRG info panel
        this.showQMRGInfo();
        
        this.isActive = true;
    }

    exitQMRGMode() {
        // Clear QMRG scene
        while(this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }
        
        // Restore original scene (simplified - in production you'd properly restore)
        this.scene.background = new THREE.Color(0x1a1a1a);
        this.scene.fog = new THREE.Fog(0x1a1a1a, 10, 50);
        this.camera.position.set(0, 0, 20);
        
        // Reinitialize paint scene (simplified)
        this.reinitializePaintScene();
        
        // Show paint controls
        this.showPaintControls();
        
        // Hide QMRG info panel
        this.hideQMRGInfo();
        
        this.isActive = false;
    }

    hidePaintControls() {
        const colorButtons = document.querySelectorAll('.color-btn');
        const clearBtn = document.getElementById('clear-btn');
        const rotateBtn = document.getElementById('rotate-btn');
        const speedControl = document.querySelector('.speed-control');
        
        colorButtons.forEach(btn => btn.style.display = 'none');
        if (clearBtn) clearBtn.style.display = 'none';
        if (rotateBtn) rotateBtn.style.display = 'none';
        if (speedControl) speedControl.style.display = 'none';
    }

    showPaintControls() {
        const colorButtons = document.querySelectorAll('.color-btn');
        const clearBtn = document.getElementById('clear-btn');
        const rotateBtn = document.getElementById('rotate-btn');
        const speedControl = document.querySelector('.speed-control');
        
        colorButtons.forEach(btn => btn.style.display = 'block');
        if (clearBtn) clearBtn.style.display = 'block';
        if (rotateBtn) rotateBtn.style.display = 'block';
        if (speedControl) speedControl.style.display = 'block';
    }

    showQMRGInfo() {
        const infoPanel = document.createElement('div');
        infoPanel.id = 'qmrg-info-panel';
        infoPanel.innerHTML = `
            <div class="qmrg-info">
                <h3>🌌 QMRG Visualization</h3>
                <div class="galaxy-info">
                    <div>Galaxy: <span id="galaxy-name">Loading...</span></div>
                    <div>L = <span id="L-value">--</span> kpc</div>
                    <div>Σ₀ = <span id="sigma0-value">--</span> M☉/pc²</div>
                    <div>Type: <span id="galaxy-type">--</span></div>
                    <div>χ² = <span id="chi2-value">--</span></div>
                </div>
                <div class="qmrg-controls">
                    <div>← → Switch Galaxies</div>
                    <div>Space Toggle Q-Medium</div>
                    <div>Mouse Rotate Camera</div>
                    <div>Scroll Zoom</div>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #qmrg-info-panel {
                position: fixed;
                top: 80px;
                left: 20px;
                background: rgba(0, 0, 0, 0.9);
                color: #00ff00;
                padding: 20px;
                border-radius: 10px;
                border: 1px solid #00ff00;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                z-index: 1000;
                backdrop-filter: blur(10px);
                max-width: 300px;
            }
            
            #qmrg-info-panel h3 {
                margin: 0 0 15px 0;
                color: #00ffff;
                text-shadow: 0 0 10px #00ffff;
            }
            
            .galaxy-info {
                margin: 15px 0;
                padding: 15px 0;
                border-top: 1px solid #00ff00;
            }
            
            .qmrg-controls {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #00ff00;
                font-size: 12px;
                line-height: 1.5;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(infoPanel);
    }

    hideQMRGInfo() {
        const infoPanel = document.getElementById('qmrg-info-panel');
        if (infoPanel) {
            infoPanel.remove();
        }
    }

    reinitializePaintScene() {
        // Simplified reinitialization - in production you'd properly restore the paint scene
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);
        
        // Add a simple paint surface
        const geometry = new THREE.PlaneGeometry(20, 20);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x2a2a2a,
            roughness: 0.8,
            metalness: 0.2
        });
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = -Math.PI / 2;
        this.scene.add(plane);
    }
}

// Initialize QMRG mode when the main app loads
export function initQMRGMode(scene, camera, renderer) {
    return new QMRGMode(scene, camera, renderer);
}
