// QMRG Labels and UI Enhancements
// Laura Cruz - Complete labeling system

import * as THREE from 'three';

class QMRGLabels {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.labels = [];
        this.infoPanel = null;
    }

    createGalaxyLabels(galaxies) {
        galaxies.forEach((galaxy, index) => {
            // Create text label for each galaxy
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 64;
            
            context.fillStyle = '#00ff00';
            context.font = 'bold 24px monospace';
            context.textAlign = 'center';
            context.fillText(`${galaxy.name}`, 128, 32);
            
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ 
                map: texture,
                transparent: true,
                opacity: 0.8
            });
            
            const sprite = new THREE.Sprite(material);
            sprite.scale.set(2, 1, 1);
            
            // Position label above galaxy
            const galaxyGroup = galaxies[index];
            sprite.position.set(0, 3, 0);
            galaxyGroup.add(sprite);
            
            this.labels.push(sprite);
        });
    }

    createInfoPanel() {
        // Remove existing panel
        const existing = document.getElementById('qmrg-complete-info');
        if (existing) existing.remove();
        
        const panel = document.createElement('div');
        panel.id = 'qmrg-complete-info';
        panel.innerHTML = `
            <div class="qmrg-header">
                <h2>🌌 QMRG Universe Explorer</h2>
                <div class="qmrg-subtitle">Quantum-Medium Relative Gravity Visualization</div>
            </div>
            
            <div class="qmrg-controls-grid">
                <div class="control-section">
                    <h3>🎮 Navigation</h3>
                    <div class="control-item">← → Switch Galaxies</div>
                    <div class="control-item">Mouse Rotate Camera</div>
                    <div class="control-item">Scroll Zoom In/Out</div>
                </div>
                
                <div class="control-section">
                    <h3>🌟 Display Options</h3>
                    <div class="control-item">Space Toggle Quantum Field</div>
                    <div class="control-item">L Toggle Labels</div>
                    <div class="control-item">K Toggle Galaxy Info</div>
                </div>
                
                <div class="control-section">
                    <h3>📊 Current Galaxy</h3>
                    <div class="galaxy-details">
                        <div class="detail-row">
                            <span class="label">Name:</span>
                            <span id="current-name" class="value">--</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">L (kpc):</span>
                            <span id="current-L" class="value">--</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Σ₀ (M☉/pc²):</span>
                            <span id="current-sigma0" class="value">--</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Type:</span>
                            <span id="current-type" class="value">--</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">χ² Fit:</span>
                            <span id="current-chi2" class="value">--</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="qmrg-legend">
                <h3>🎨 Legend</h3>
                <div class="legend-item">
                    <div class="legend-color barred-spiral"></div>
                    <span>Barred Spiral</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color late-spiral"></div>
                    <span>Late Spiral</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color dwarf-irregular"></div>
                    <span>Dwarf Irregular</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color low-surface"></div>
                    <span>Low Surface Brightness</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color quantum-field"></div>
                    <span>Quantum Medium</span>
                </div>
            </div>
            
            <div class="qmrg-physics">
                <h3>⚛️ Physics</h3>
                <div class="physics-item">
                    <strong>Displacement Mechanism:</strong> Quantum particles avoid baryonic matter
                </div>
                <div class="physics-item">
                    <strong>Coherence Length (L):</strong> Governs transition scale
                </div>
                <div class="physics-item">
                    <strong>Universal Acceleration (a₀):</strong> 1.22 × 10⁻¹⁰ m/s²
                </div>
            </div>
        `;
        
        // Add comprehensive styles
        const style = document.createElement('style');
        style.textContent = `
            #qmrg-complete-info {
                position: fixed;
                top: 10px;
                left: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.95);
                color: #00ff00;
                padding: 20px;
                border-radius: 15px;
                border: 2px solid #00ff00;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                z-index: 2000;
                backdrop-filter: blur(15px);
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .qmrg-header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #00ff00;
            }
            
            .qmrg-header h2 {
                margin: 0 0 5px 0;
                color: #00ffff;
                text-shadow: 0 0 15px #00ffff;
                font-size: 24px;
            }
            
            .qmrg-subtitle {
                color: #888;
                font-size: 14px;
                margin-top: 5px;
            }
            
            .qmrg-controls-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }
            
            .control-section {
                background: rgba(0, 255, 0, 0.1);
                padding: 15px;
                border-radius: 10px;
                border: 1px solid #00ff00;
            }
            
            .control-section h3 {
                margin: 0 0 10px 0;
                color: #00ffff;
                font-size: 16px;
            }
            
            .control-item {
                margin: 5px 0;
                padding: 5px 0;
                border-left: 3px solid #00ff00;
                padding-left: 10px;
            }
            
            .galaxy-details {
                background: rgba(0, 100, 255, 0.1);
                padding: 15px;
                border-radius: 10px;
                border: 1px solid #0066cc;
            }
            
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                padding: 5px 0;
                border-bottom: 1px dashed #444;
            }
            
            .label {
                color: #aaa;
                font-weight: bold;
            }
            
            .value {
                color: #00ff00;
                font-weight: bold;
            }
            
            .qmrg-legend {
                background: rgba(255, 255, 0, 0.1);
                padding: 15px;
                border-radius: 10px;
                border: 1px solid #ffff00;
                margin-top: 20px;
            }
            
            .qmrg-legend h3 {
                margin: 0 0 10px 0;
                color: #ffff00;
            }
            
            .legend-item {
                display: flex;
                align-items: center;
                margin: 8px 0;
            }
            
            .legend-color {
                width: 20px;
                height: 20px;
                margin-right: 10px;
                border-radius: 3px;
                border: 1px solid #666;
            }
            
            .barred-spiral { background: #ff6b6b; }
            .late-spiral { background: #4ecdc4; }
            .dwarf-irregular { background: #95e1d3; }
            .low-surface { background: #f38181; }
            .quantum-field { background: #4a7c7e; }
            
            .qmrg-physics {
                background: rgba(255, 0, 255, 0.1);
                padding: 15px;
                border-radius: 10px;
                border: 1px solid #ff00ff;
                margin-top: 20px;
            }
            
            .qmrg-physics h3 {
                margin: 0 0 10px 0;
                color: #ff00ff;
            }
            
            .physics-item {
                margin: 8px 0;
                padding: 8px 0;
                border-left: 3px solid #ff00ff;
                padding-left: 10px;
            }
            
            @media (max-width: 768px) {
                .qmrg-controls-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(panel);
        this.infoPanel = panel;
    }

    updateGalaxyInfo(galaxy) {
        if (!this.infoPanel) return;
        
        const elements = {
            name: document.getElementById('current-name'),
            L: document.getElementById('current-L'),
            sigma0: document.getElementById('current-sigma0'),
            type: document.getElementById('current-type'),
            chi2: document.getElementById('current-chi2')
        };
        
        if (elements.name) elements.name.textContent = galaxy.name;
        if (elements.L) elements.L.textContent = galaxy.L;
        if (elements.sigma0) elements.sigma0.textContent = galaxy.sigma0;
        if (elements.type) elements.type.textContent = galaxy.type.replace('_', ' ');
        if (elements.chi2) elements.chi2.textContent = galaxy.chi2;
    }

    toggleLabels(visible) {
        this.labels.forEach(label => {
            label.visible = visible;
        });
    }

    show() {
        if (this.infoPanel) {
            this.infoPanel.style.display = 'block';
        }
    }

    hide() {
        if (this.infoPanel) {
            this.infoPanel.style.display = 'none';
        }
    }
}

export { QMRGLabels };
