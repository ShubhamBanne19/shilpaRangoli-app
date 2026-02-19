import { Injectable } from '@angular/core';
import p5 from 'p5';
import { IPatternGenerator, PatternLayer } from '../models/pattern.interface';

@Injectable({
    providedIn: 'root'
})
export class PatternEngineService {

    getPatterns(): IPatternGenerator[] {
        const patterns: IPatternGenerator[] = [];

        // Generate 50 patterns procedurally based on difficulty tiers
        for (let i = 1; i <= 50; i++) {
            patterns.push(this.createPattern(i));
        }
        return patterns;
    }

    private createPattern(id: number): IPatternGenerator {
        // Difficulty Formula: 
        // Beginner (1-15): 4-6 axes
        // Intermediate (16-35): 8-12 axes
        // Advanced (36-50): 12-16 axes

        let difficulty: 1 | 2 | 3 | 4 | 5 = 1;
        let axes = 4;
        let name = `Pattern ${id}`;
        let note = "A simple geometric design.";

        if (id <= 5) { difficulty = 1; axes = 4; name = "Simple Flower"; note = "Foundational 4-petal motif common in daily threshold designs."; }
        else if (id <= 15) { difficulty = 2; axes = 6; name = "Hexa Star"; note = "Six-pointed star representing balance in nature."; }
        else if (id <= 25) { difficulty = 3; axes = 8; name = "Lotus Mandala"; note = "The Lotus (Padma) symbolizes purity and spiritual awakening."; }
        else if (id <= 35) { difficulty = 4; axes = 10; name = "Sun Ray"; note = "Dedicated to Surya, the Sun God, for vitality."; }
        else { difficulty = 5; axes = 12 + ((id % 2) * 4); name = "Royal Peacock"; note = "Intricate peacock feather motifs (Mayura) for prosperity."; }

        // Unique variations based on ID
        if (id === 1) return this.pattern1_SimpleFlower();
        if (id === 2) return this.pattern2_DottedSquare();
        if (id === 3) return this.pattern3_SixPointStar();
        if (id === 16) return this.pattern16_LotusMandala();
        if (id === 36) return this.pattern36_PeacockBloom();

        // Procedural generation for others to reach 50
        return {
            id,
            name: `${name} Var. ${id}`,
            difficulty,
            symmetryAxes: axes,
            culturalNote: note,
            layers: [], // Placeholder for metadata
            generate: (p: p5, cx: number, cy: number, r: number) => {
                const layers = 2 + Math.floor(id / 10);

                p.push();
                p.translate(cx, cy);

                for (let l = 0; l < layers; l++) {
                    const radius = r * (0.2 + (l * 0.2));
                    const count = axes * (1 + (l % 2));
                    const hue = (id * 10 + l * 40) % 360;
                    p.noFill();
                    p.stroke(hue, 80, 90);
                    p.strokeWeight(2);

                    if (l % 3 === 0) {
                        // Circles
                        p.ellipse(0, 0, radius * 2);
                    } else if (l % 3 === 1) {
                        // Petals
                        for (let a = 0; a < 360; a += 360 / count) {
                            p.push();
                            p.rotate(p.radians(a));
                            p.ellipse(radius, 0, radius * 0.5, radius * 0.3);
                            p.pop();
                        }
                    } else {
                        // Dots
                        p.fill(hue, 80, 90);
                        p.noStroke();
                        for (let a = 0; a < 360; a += 360 / count) {
                            const x = p.cos(p.radians(a)) * radius;
                            const y = p.sin(p.radians(a)) * radius;
                            p.circle(x, y, 5);
                        }
                    }
                }
                p.pop();
            }
        };
    }

    // --- SPECIFIC PATTERNS ---

    private pattern1_SimpleFlower(): IPatternGenerator {
        return {
            id: 1,
            name: "Simple Flower",
            difficulty: 1,
            symmetryAxes: 4,
            layers: [],
            culturalNote: "A basic 4-petaled flower, often drawn by beginners in Southern India.",
            generate: (p: p5, cx, cy, r) => {
                p.push();
                p.translate(cx, cy);
                p.noStroke();
                // Layer 1: Petals
                p.fill('#FF6B9D'); // Pink
                for (let i = 0; i < 4; i++) {
                    p.push();
                    p.rotate(p.TWO_PI / 4 * i);
                    p.ellipse(r * 0.5, 0, r * 0.6, r * 0.3);
                    p.pop();
                }
                // Layer 2: Center
                p.fill('#FFD93D'); // Yellow
                p.circle(0, 0, r * 0.3);
                p.pop();
            }
        };
    }

    private pattern2_DottedSquare(): IPatternGenerator {
        return {
            id: 2,
            name: "Dotted Square",
            difficulty: 1,
            symmetryAxes: 4,
            layers: [],
            culturalNote: "Grid-based designs (Kolam) start with a pattern of dots.",
            generate: (p: p5, cx, cy, r) => {
                p.push();
                p.translate(cx, cy);
                p.fill('#FF8C42'); // Orange
                p.noStroke();
                const grid = 4;
                const step = (r * 1.5) / grid;
                const offset = (grid - 1) * step / 2;

                for (let x = 0; x < grid; x++) {
                    for (let y = 0; y < grid; y++) {
                        p.circle(x * step - offset, y * step - offset, r * 0.16);
                    }
                }
                p.pop();
            }
        };
    }

    private pattern3_SixPointStar(): IPatternGenerator {
        return {
            id: 3,
            name: "Six-Point Star",
            difficulty: 2,
            symmetryAxes: 6,
            culturalNote: "Geometric harmony representing the balance of elements.",
            layers: [],
            generate: (p: p5, cx, cy, r) => {
                p.push();
                p.translate(cx, cy);
                p.noFill();
                p.strokeWeight(3);

                // Hexagon
                p.stroke('#4ECDC4');
                p.beginShape();
                for (let i = 0; i < 6; i++) {
                    let angle = p.TWO_PI / 6 * i;
                    p.vertex(p.cos(angle) * r * 0.4, p.sin(angle) * r * 0.4);
                }
                p.endShape(p.CLOSE);

                // Triangles
                p.stroke('#556270');
                for (let i = 0; i < 6; i++) {
                    p.push();
                    p.rotate(p.TWO_PI / 6 * i);
                    p.line(r * 0.4, 0, r * 0.8, 0); // Spikes
                    p.pop();
                }
                p.pop();
            }
        }
    }

    private pattern16_LotusMandala(): IPatternGenerator {
        return {
            id: 16,
            name: "Lotus Mandala",
            difficulty: 3,
            symmetryAxes: 8,
            culturalNote: "A complex lotus motif for festivals.",
            layers: [],
            generate: (p: p5, cx, cy, r) => {
                p.push();
                p.translate(cx, cy);
                p.noStroke();

                // 8 Large Petals
                p.fill(280, 60, 80); // Purple HSB approx (assuming colorMode set in component)
                for (let i = 0; i < 8; i++) {
                    p.push();
                    p.rotate(p.TWO_PI / 8 * i);
                    // Draw teardrop
                    p.beginShape();
                    p.vertex(0, 0);
                    (p as any).bezierVertex(r * 0.3, -r * 0.2, r * 0.8, -r * 0.1, r * 0.9, 0);
                    (p as any).bezierVertex(r * 0.8, r * 0.1, r * 0.3, r * 0.2, 0, 0);
                    p.endShape();
                    p.pop();
                }

                // Center
                p.fill(50, 80, 100); // Gold
                p.circle(0, 0, r * 0.2);
                p.pop();
            }
        }
    }

    private pattern36_PeacockBloom(): IPatternGenerator {
        return {
            id: 36,
            name: "Peacock Bloom",
            difficulty: 5,
            symmetryAxes: 12,
            culturalNote: "The national bird of India, representing grace.",
            layers: [],
            generate: (p: p5, cx, cy, r) => {
                p.push();
                p.translate(cx, cy);
                p.colorMode(p.HSB);

                // 12 Feathers
                for (let i = 0; i < 12; i++) {
                    p.push();
                    p.rotate(p.TWO_PI / 12 * i);
                    p.stroke(200, 80, 80); // Blue
                    p.strokeWeight(2);
                    p.noFill();
                    (p as any).bezier(0, 0, r * 0.3, -r * 0.1, r * 0.6, -r * 0.1, r, 0);
                    (p as any).bezier(0, 0, r * 0.3, r * 0.1, r * 0.6, r * 0.1, r, 0);

                    // Eye of feather
                    p.fill(120, 80, 80); // Green
                    p.ellipse(r * 0.8, 0, r * 0.15, r * 0.1);
                    p.fill(280, 80, 80); // Purple dot
                    p.circle(r * 0.8, 0, r * 0.05);
                    p.pop();
                }
                p.pop();
            }
        }
    }
}
