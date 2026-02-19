=======================================================================
EXECUTIVE BRIEF — PRINCIPAL ENGINEER ASSIGNMENT
=======================================================================

ROLE SPECIFICATION:
You are Priya Sharma, Principal Full-Stack Engineer at Anthropic Arts Division.
Specializations:
  • Angular 17 standalone architecture + Signals API
  • p5.js biomechanical motion tracking & gesture analysis
  • Traditional arts pedagogy (certified in Tamil Kolam instruction)
  • Psychomotor learning theory (Fitts & Posner model implementation)
  • RxJS reactive state patterns + Web Worker orchestration

MISSION CRITICAL OBJECTIVE:
Architect "ShilpaRangoli" — a psychomotor skill acquisition platform that 
teaches the PHYSICAL EMBODIMENT of traditional Rangoli drawing, not just 
visual pattern replication. Users must develop actual hand-eye coordination, 
muscle memory, and cultural technique mastery translatable to physical media.

UNPRECEDENTED CONSTRAINT:
This is NOT a drawing game. This is a digital apprenticeship system that 
simulates the 10,000-hour expertise path of traditional Rangoli masters. 
Every design decision must answer: "Does this build real-world motor skill?"

PROJECT CODENAME: "Guru Protocol" (Digital Transmission of Tacit Knowledge)

=======================================================================
TECHNICAL ARCHITECTURE — NON-NEGOTIABLE STACK
=======================================================================

ANGULAR 17 STANDALONE ARCHITECTURE:
├── No NgModules — 100% standalone components
├── Signals API for synchronous state (Angular 17.1+)
├── RxJS BehaviorSubject ONLY for cross-component async streams
├── Strict TypeScript (noImplicitAny, strictNullChecks)
└── Functional Guards for route protection (no class-based guards)

WEB WORKER ECOSYSTEM:
├── accuracy.worker.ts      → Pixel-based pattern matching
├── biomechanics.worker.ts  → NEW: Real-time gesture analysis
├── flow-state.worker.ts    → NEW: Psychomotor smoothness scoring
└── stroke-order.worker.ts  → NEW: Sequential element validation

P5.JS PERFORMANCE PROFILE:
├── Instance mode (no global p5 functions)
├── WebGL renderer for 60fps at 4K resolution
├── Custom shader for motion blur trail effects
├── Frame budget: 16.67ms (strict 60fps, no drops tolerated)

STATE MANAGEMENT PATTERN:
├── Facade Service Layer (single source of truth per domain)
├── Immutable state updates (use Immer.js for deep clones)
├── Time-travel debugging (Redux DevTools integration)
└── Offline-first (IndexedDB sync via Dexie.js)

=======================================================================
PILLAR 1: "PHYSICAL MASTERY" CURRICULUM FRAMEWORK
=======================================================================

PEDAGOGICAL FOUNDATION:
Base the learning progression on Fitts & Posner's Three-Stage Model:
  1. Cognitive Stage → Understanding "what" and "why"
  2. Associative Stage → Refining "how" through feedback
  3. Autonomous Stage → Unconscious competence

CULTURAL AUTHENTICITY PROTOCOL:
Every technique must reference verified traditional practice:
  • Tamil Nadu Kolam Technique (source: Dr. Vijaya Nagarajan, UC Berkeley)
  • Rajasthani Mandana Tradition (source: Gujarat Folk Arts Museum)
  • Bengali Alpana Method (source: Santiniketan Archives)

─────────────────────────────────────────────────────────────────────
STAGE 1: FOUNDATION — Pinch Grip Mastery (Cognitive Phase)
─────────────────────────────────────────────────────────────────────

PHYSICAL OBJECTIVE:
Develop the traditional "three-finger pinch" used to control rice flour 
flow in authentic Rangoli. This grip provides:
  • Precise quantity control (grain-by-grain release)
  • Wrist stabilization for circular motions
  • Tactile feedback for consistent line width

TECHNICAL FOCUS:
  Parameter: GRIP_PRESSURE_VARIANCE
  Definition: Standard deviation of pressure applied over stroke duration
  Target Metric: σ < 0.15 (normalized 0-1 scale)
  
  Calculation (in biomechanics.worker.ts):
    1. Sample pointer pressure at 60 samples/second (if device supports)
    2. Calculate rolling mean and std deviation per stroke
    3. Score = 1 - (σ / 0.15) where σ capped at 0.15

DIGITAL PROXY VALIDATION:
  p5.js Implementation:
    • Track mousePressed force (if available) or simulate via stroke velocity
    • Visualize pressure via line width variation (2px-8px dynamic range)
    • Haptic feedback (if Web Vibration API available): vibrate on pressure spike
    
  Real-time UI Feedback:
    • Pressure Gauge: Circular meter (0-100%) with color gradient:
       └─ Green (60-80%): Optimal "Guru Pressure"
       └─ Yellow (<60% or >80%): Guidance arrow to adjust
       └─ Red (<40% or >90%): "Reset hand position" prompt
    
  Failure Pattern Detection:
    IF σ > 0.25 for 3 consecutive strokes THEN:
      → Pause exercise
      → Show video: "Pinch Grip Reset Tutorial" (15s loop)
      → Require user to acknowledge "I've repositioned my hand"

ONBOARDING UI — INFO ICON POPOVER (JSON Schema):

{
  "stage": "Foundation",
  "technique": "Pinch Grip Mastery",
  "guideItems": [
    {
      "icon": "👌",
      "title": "Three-Finger Hold",
      "description": "Thumb, index, middle—like holding a grain of rice. Ring and pinky rest on table for stability.",
      "videoUrl": "/assets/tutorials/pinch-grip-demo.mp4",
      "duration": 12
    },
    {
      "icon": "🎯",
      "title": "Pressure Sweet Spot",
      "description": "Aim for 60-80% pressure. Too light = shaky lines. Too hard = hand fatigue.",
      "interactiveDemo": true,
      "demoType": "pressure-calibration"
    },
    {
      "icon": "🔄",
      "title": "Wrist Pivot Point",
      "description": "Your wrist is the compass center. Fingers control detail, wrist controls curves.",
      "anatomyDiagram": "/assets/diagrams/wrist-pivot.svg"
    },
    {
      "icon": "⏱️",
      "title": "Practice Rhythm",
      "description": "3 sets × 5 strokes. Rest 30 seconds between sets. Quality over quantity.",
      "timerIntegration": true
    }
  ],
  "culturalContext": {
    "tradition": "Tamil Kolam",
    "practitioner": "Expert kolam artists develop calluses on these three fingers after years of daily practice.",
    "citation": "Dr. Vijaya Nagarajan, 'Threshold Designs' (2018)"
  }
}

EXERCISE SET (5 Drills):
  1.1 Straight Line Pressure Hold (30 seconds each)
      → Draw 5cm horizontal line at constant 70% pressure
      → Success: σ < 0.12
  
  1.2 Concentric Circle Consistency
      → Draw 3 circles (radius 5cm, 10cm, 15cm) without lifting finger
      → Success: Pressure variance across all 3 circles σ < 0.15
  
  1.3 Dot Grid Precision
      → Place 25 dots in 5×5 grid, each requiring 0.3s hold at 75% pressure
      → Success: All dots within ±5% target pressure, ±2mm placement
  
  1.4 Petal Stroke Sequence
      → 8 identical petal strokes around a center point
      → Success: Pressure profile similarity > 85% across all petals
  
  1.5 Speed-Pressure Decoupling
      → Draw line at 2cm/s, then 5cm/s, then 10cm/s—SAME pressure
      → Success: Pressure variance across speed changes < 0.10

PROGRESSION GATE:
User must achieve 80%+ on 4 out of 5 drills to unlock Stage 2.
Estimated time to mastery: 15-25 minutes for novices.

─────────────────────────────────────────────────────────────────────
STAGE 2: CONTROL — Controlled Release Dynamics (Associative Phase)
─────────────────────────────────────────────────────────────────────

PHYSICAL OBJECTIVE:
Master the "pinch-and-release" rhythm that creates the characteristic 
"bead-on-string" texture of traditional rice flour Rangoli lines. This 
requires pulsed muscle control, not sustained tension.

TECHNICAL FOCUS:
  Parameter: STROKE_VELOCITY_CONSISTENCY
  Definition: Coefficient of variation (CV) of instantaneous velocity
  Target Metric: CV < 0.20 (lower = smoother, more controlled)
  
  Calculation (in flow-state.worker.ts):
    1. Sample (x,y) position every 16.67ms (60fps)
    2. Calculate instantaneous velocity: v[i] = distance / dt
    3. Compute CV = (std_dev(velocity) / mean(velocity))
    4. Penalize acceleration spikes > 3x mean velocity

DIGITAL PROXY VALIDATION:
  p5.js Implementation:
    • Record timestamp and position for every mouseMoved event
    • Render velocity heatmap overlay (optional toggle):
       └─ Blue (slow): v < 3cm/s
       └─ Green (optimal): 3-8cm/s  
       └─ Red (rushed): v > 8cm/s
    
  Biofeedback Mechanism:
    • Audio tone generator: Map velocity to frequency (200Hz-800Hz)
    • Goal: Maintain constant tone pitch = constant velocity
    • Inspired by surgical training simulators (Da Vinci system)

ONBOARDING UI — INFO ICON POPOVER:

{
  "stage": "Control",
  "technique": "Controlled Release",
  "guideItems": [
    {
      "icon": "🌊",
      "title": "Flow Like Water",
      "description": "Imagine pouring honey—steady, continuous, never jerky. Your hand should feel weightless.",
      "meditationAudio": "/assets/audio/flow-breathing.mp3"
    },
    {
      "icon": "🎵",
      "title": "Listen to Your Speed",
      "description": "Enable audio feedback. A steady tone = perfect control. Pitch changes = speed wobbles.",
      "audioDemo": true
    },
    {
      "icon": "👁️",
      "title": "Peripheral Vision Trick",
      "description": "Don't stare at the cursor. Soften your gaze to see the whole pattern. Masters draw 'blind'.",
      "eyeTrackingTip": true
    },
    {
      "icon": "💨",
      "title": "Breath Sync",
      "description": "Exhale during strokes. Inhale during pauses. This is Zen archery applied to art.",
      "breathingPattern": "4-2-6 rhythm"
    }
  ],
  "culturalContext": {
    "tradition": "Rajasthani Mandana",
    "practitioner": "Village artists create 10-meter murals in one breath-controlled session.",
    "citation": "Gujarat Folk Arts Museum, Field Study 2019"
  }
}

EXERCISE SET (5 Drills):
  2.1 Velocity Staircase
      → Draw line at 3cm/s, hold 2s, then 5cm/s, hold 2s, then 7cm/s
      → Success: CV within each speed segment < 0.15
  
  2.2 Spiral Consistency
      → Draw outward spiral from center, maintaining 5cm/s throughout
      → Success: CV < 0.18 across entire 360° rotation
  
  2.3 Pulsed Line Texture
      → Create dotted line via pulsed 0.5s on / 0.5s off motion
      → Success: All dots same size (σ < 10%), equal spacing (σ < 8%)
  
  2.4 Figure-8 Infinity Loop
      → Continuous figure-8 motion for 30 seconds
      → Success: Loop overlap precision > 90%, CV < 0.20
  
  2.5 Blindfold Mode (Advanced)
      → Close eyes, draw 10cm straight line using only muscle memory
      → Success: Endpoint within 15mm of target, CV < 0.25

PROGRESSION GATE:
Achieve 85%+ on 4 out of 5 drills. Unlock "Flow State" badge.
Estimated mastery time: 20-35 minutes.

─────────────────────────────────────────────────────────────────────
STAGE 3: SYMMETRY — Radial Precision (Associative Phase)
─────────────────────────────────────────────────────────────────────

PHYSICAL OBJECTIVE:
Develop proprioceptive awareness of angular spacing and rotational 
consistency—the foundation of mandala construction. This trains the 
brain's parietal lobe spatial processing centers.

TECHNICAL FOCUS:
  Parameter: ANGULAR_SPACING_ERROR
  Definition: Deviation from perfect equidistant angular division
  Target Metric: Mean angular error < 3° for 8-fold symmetry
  
  Calculation (in stroke-order.worker.ts):
    1. Detect radial strokes originating from canvas center (±5% tolerance)
    2. Calculate angle of each stroke relative to horizontal axis
    3. Compute expected angles: [0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°]
    4. Error = MIN(|actual - expected|) for all expected angles
    5. Score = 100 × (1 - mean_error / 15°) // 15° = maximum forgiveness

DIGITAL PROXY VALIDATION:
  p5.js Implementation:
    • Ghost guides: Faint radial lines at correct angles (toggle on/off)
    • Angle snap: If stroke within 5° of ideal, snap to perfect angle
    • Rotational grid overlay: Polar coordinate grid with angle markers
    
  Cognitive Load Reduction:
    • Start with 4-fold symmetry (90° divisions) → easier mental math
    • Progress to 6-fold (60°) → 8-fold (45°) → 12-fold (30°)
    • Do NOT start with odd symmetries (5, 7) — cognitively harder

ONBOARDING UI — INFO ICON POPOVER:

{
  "stage": "Symmetry",
  "technique": "Radial Precision",
  "guideItems": [
    {
      "icon": "🧭",
      "title": "Mental Compass",
      "description": "Imagine a clock face. 12, 3, 6, 9 = perfect 4-fold. Use this as your anchor.",
      "clockOverlay": true
    },
    {
      "icon": "🔢",
      "title": "Count Your Angles",
      "description": "Whisper the divisions out loud: '45... 90... 135...' Verbal encoding improves motor accuracy.",
      "voiceRecognitionTip": true
    },
    {
      "icon": "🎯",
      "title": "Pivot From Center",
      "description": "Your wrist is the compass point. Small wrist rotation = big arc on the edge.",
      "biomechanicsVideo": "/assets/tutorials/wrist-rotation.mp4"
    },
    {
      "icon": "🪞",
      "title": "Mirror Check",
      "description": "After each stroke, imagine folding the canvas. Would the halves match?",
      "symmetryValidator": true
    }
  ],
  "culturalContext": {
    "tradition": "Tamil Kolam",
    "practitioner": "Traditional kolam use 'pulli' (dot grids) as built-in angle guides.",
    "citation": "Ascher, M. 'Ethnomathematics' (1991)"
  }
}

EXERCISE SET (5 Drills):
  3.1 Cardinal Directions (4-Fold)
      → Place 4 dots at 0°, 90°, 180°, 270° (radius 10cm)
      → Success: All angles within ±2° of target
  
  3.2 Octagon Construction (8-Fold)
      → Draw 8 petal strokes at 45° intervals
      → Success: Mean angular error < 3°, all petals same length (±8%)
  
  3.3 Speed-Accuracy Tradeoff
      → Complete 8-fold pattern in: 60s (easy), 45s (medium), 30s (hard)
      → Success: Maintain angular error < 4° even at fastest speed
  
  3.4 Inverted Symmetry
      → Draw pattern upside-down (rotate canvas 180°)
      → Success: Angular accuracy matches right-side-up performance
  
  3.5 Hybrid Symmetry (Cognitive Challenge)
      → 4-fold primary + 8-fold secondary elements
      → Success: Both symmetry systems maintained with < 4° error

PROGRESSION GATE:
Master 4-fold and 6-fold with 90%+ accuracy. Estimated time: 25-40 minutes.

─────────────────────────────────────────────────────────────────────
STAGE 4: COMPOSITION — Stroke Order Mastery (Autonomous Phase Transition)
─────────────────────────────────────────────────────────────────────

PHYSICAL OBJECTIVE:
Internalize the traditional "inside-out" or "outside-in" construction 
sequences that allow Rangoli to be drawn continuously without lifting 
the hand—a meditative flow state practice.

TECHNICAL FOCUS:
  Parameter: STROKE_ORDER_COMPLIANCE
  Definition: Percentage of strokes executed in prescribed sequence
  Target Metric: 100% compliance (no sequence violations)
  
  Calculation (in stroke-order.worker.ts):
    1. Each pattern defines `requiredStrokeOrder: number[]`
       Example: [1,2,3,4,5,6,7,8] for center→edge progression
    2. Track user's actual stroke sequence: `userStrokeOrder: number[]`
    3. Use Longest Common Subsequence (LCS) algorithm to compute:
       Compliance = LCS_length / required_length × 100
    4. Penalize "backtracking" (drawing inner elements after outer)

DIGITAL PROXY VALIDATION:
  p5.js Implementation:
    • Numbered stroke hints: Display "Draw stroke #3 next" with arrow
    • Progressive reveal: Only show next valid stroke zones (grayed out future)
    • Stroke history visualizer: Timeline showing order with color-coding:
       └─ Green: Correct sequence
       └─ Orange: Out-of-order but eventually corrected
       └─ Red: Sequence violation (requires redo)
    
  Haptic Resistance Simulation:
    IF user attempts to draw out-of-sequence stroke THEN:
      → Disable drawing in that region (visual + cursor change)
      → Subtle vibration pulse (if supported)
      → Tooltip: "Complete the center lotus before outer petals"

ONBOARDING UI — INFO ICON POPOVER:

{
  "stage": "Composition",
  "technique": "Stroke Order Mastery",
  "guideItems": [
    {
      "icon": "🌸",
      "title": "Bloom From Center",
      "description": "Like a real flower: seed → petals → leaves. Never draw leaves before petals.",
      "botanicalAnalogy": true
    },
    {
      "icon": "🎼",
      "title": "Visual Music",
      "description": "Each stroke is a note. Wrong order = dissonant chord. Right order = harmony.",
      "musicalNotation": true
    },
    {
      "icon": "🧘",
      "title": "Meditative Sequence",
      "description": "Traditional artists chant mantras synced to stroke order. Rhythm creates flow.",
      "mantraAudio": "/assets/audio/kolam-chant.mp3"
    },
    {
      "icon": "🔗",
      "title": "Continuous Line",
      "description": "Advanced: Draw entire pattern without lifting. Requires perfect sequence planning.",
      "singleStrokeChallenge": true
    }
  ],
  "culturalContext": {
    "tradition": "Bengali Alpana",
    "practitioner": "Alpana artists use specific stroke sequences passed down orally through generations.",
    "citation": "Santiniketan Archives, Oral History Project (2015)"
  }
}

EXERCISE SET (5 Drills):
  4.1 Linear Sequence (3-Layer Pattern)
      → Layer 1: Center circle → Layer 2: 6 petals → Layer 3: Outer ring
      → Success: 100% sequence compliance, no backtracking
  
  4.2 Speed Sequence Challenge
      → Complete 8-layer pattern in prescribed order within 90 seconds
      → Success: Sequence compliance 100%, time < 90s
  
  4.3 Memory Sequence (No Hints)
      → Study stroke order for 30s, then draw from memory (hints disabled)
      → Success: ≥ 90% sequence accuracy
  
  4.4 Interrupted Sequence
      → Forced pause every 10 strokes (15s break) — tests working memory
      → Success: Resume correct sequence after each interruption
  
  4.5 Adaptive Sequencing
      → User chooses their own efficient sequence (multiple valid paths)
      → Success: AI validates sequence is geometrically sound (no overlaps)

PROGRESSION GATE:
Complete 3 patterns with 95%+ sequence compliance. Unlock "Methodical Artist" badge.

─────────────────────────────────────────────────────────────────────
STAGE 5: MASTERY — Flow State Achievement (Autonomous Phase)
─────────────────────────────────────────────────────────────────────

PHYSICAL OBJECTIVE:
Enter the "zone" where conscious thought dissolves and muscle memory 
takes over—the ultimate goal of psychomotor mastery. Characterized by:
  • Effortless attention (no mental strain)
  • Distorted time perception (30 minutes feels like 5)
  • Loss of self-consciousness (body-tool unity)

TECHNICAL FOCUS:
  Parameter: FLOW_STATE_INDEX (Multi-Metric)
  Components:
    1. Velocity Smoothness (CV < 0.15) — 25% weight
    2. Pressure Consistency (σ < 0.12) — 25% weight
    3. Angular Precision (error < 2°) — 20% weight
    4. Stroke Timing Regularity (inter-stroke interval σ < 0.3s) — 15% weight
    5. Gaze Fixation Stability (if eye-tracking available) — 15% weight
  
  Composite Score: 
    Flow Index = Σ(component_score × weight) where each component ∈ [0,1]
    
  Flow State Declared IF:
    Flow Index > 0.85 sustained for ≥ 2 consecutive minutes

DIGITAL PROXY VALIDATION:
  p5.js Implementation:
    • Minimal UI mode: Hide all controls, metrics, and distractions
    • Ambient soundscape: Generative music that adapts to stroke rhythm
    • Breath-paced visuals: Canvas background pulses at 4-2-6 breathing rate
    
  Neurophysiological Alignment:
    • Frame rate locked to 60fps (no jitter) → predictable sensorimotor loop
    • Input latency < 20ms → sensation of "direct manipulation"
    • Visual trails (motion blur) → perceive continuity, not discrete frames

ONBOARDING UI — INFO ICON POPOVER:

{
  "stage": "Mastery",
  "technique": "Flow State",
  "guideItems": [
    {
      "icon": "🌊",
      "title": "Effortless Effort",
      "description": "Stop trying. Let your hand draw itself. You're just watching.",
      "mindfulnessGuide": true
    },
    {
      "icon": "⏰",
      "title": "Time Collapse",
      "description": "If you're checking the clock, you're not in flow. True mastery feels timeless.",
      "timePerceptionStudy": true
    },
    {
      "icon": "🎭",
      "title": "Lose Yourself",
      "description": "The boundary between you and the canvas dissolves. This is 'no-mind'.",
      "zenPhilosophy": "/articles/mushin.md"
    },
    {
      "icon": "🔥",
      "title": "Challenge-Skill Balance",
      "description": "Flow occurs when task difficulty perfectly matches your ability. We'll auto-adjust.",
      "dynamicDifficultyEnabled": true
    }
  ],
  "culturalContext": {
    "tradition": "Universal (Zen, Sufism, Tamil Kolam)",
    "practitioner": "Master artists describe entering 'trance states' where patterns emerge spontaneously.",
    "citation": "Csikszentmihalyi, M. 'Flow' (1990)"
  }
}

EXERCISE SET (5 Drills):
  5.1 Timed Mastery Pattern
      → Complete expert-level 12-fold pattern with zero UI feedback
      → Success: Flow Index > 0.85 for entire duration
  
  5.2 Blindfold Mastery
      → Draw familiar pattern with eyes closed (audio cues only)
      → Success: Accuracy > 75%, subjective flow report
  
  5.3 Ambient Mastery
      → Draw with TV/distractions in background — test autonomous processing
      → Success: Performance degrades < 10% vs. focused conditions
  
  5.4 Teaching Mode
      → Verbally explain pattern to a peer while drawing
      → Success: Maintain Flow Index > 0.80 despite dual-task load
  
  5.5 Improvisational Mastery
      → Create original pattern using learned techniques (no template)
      → Success: Demonstrates all 4 previous stage skills in novel context

PROGRESSION GATE:
Achieve Flow Index > 0.85 on 3 different pattern families. Unlock "Guru" title.

=======================================================================
PILLAR 2: PROFESSIONAL DESIGN SYSTEM (CSS/SCSS)
=======================================================================

DESIGN PHILOSOPHY:
"Zen-Professional" = Invisible when not needed, indispensable when engaged.
Inspired by: Braun industrial design, Japanese wabi-sabi, MUJI minimalism.

─────────────────────────────────────────────────────────────────────
GLOBAL SCSS TOKENS (styles/_tokens.scss)
─────────────────────────────────────────────────────────────────────

// ========== TYPOGRAPHY SCALE (Major Third: 1.250 ratio) ==========
// Based on: "Practical Typography" by Matthew Butterick
// Optimized for: Active learning (not passive reading)

$font-scale: (
  'micro':      0.64rem,   //  ~10px — Metadata, timestamps
  'caption':    0.80rem,   //  ~13px — Help text, tooltips
  'body':       1.00rem,   //  ~16px — Primary instruction text
  'subhead':    1.25rem,   //  ~20px — Section headers
  'title':      1.563rem,  //  ~25px — Pattern names
  'display':    1.953rem,  //  ~31px — Stage announcements
  'hero':       2.441rem   //  ~39px — App branding
);

// Font Families (Google Fonts CDN)
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@300;400;600&family=Inter:wght@400;500;700&family=JetBrains+Mono:wght@400;700&display=swap');

$font-display:    'Crimson Pro', serif;      // Elegant, traditional feel
$font-body:       'Inter', sans-serif;       // Maximum legibility
$font-mono:       'JetBrains Mono', monospace; // Metrics, code

// Line Heights (Optimal for active tasks vs. extended reading)
$line-height-tight:   1.2;   // Headings, UI labels
$line-height-base:    1.5;   // Body text, instructions
$line-height-loose:   1.8;   // Long-form cultural notes

// ========== COLOR SYSTEM (HSL for programmatic manipulation) ==========

// Semantic Palette (inspired by traditional Rangoli pigments)
$color-primary:       hsl(340, 95%, 65%);  // Kumkum red
$color-secondary:     hsl(45, 100%, 55%);  // Turmeric gold
$color-accent:        hsl(280, 70%, 60%);  // Indigo dye
$color-success:       hsl(145, 65%, 50%);  // Mehndi green
$color-warning:       hsl(30, 95%, 55%);   // Saffron orange
$color-error:         hsl(10, 85%, 55%);   // Chili red

// Neutral Grays (warm-tinted for softness)
$color-bg-dark:       hsl(240, 15%, 8%);   // Canvas void
$color-bg-medium:     hsl(240, 10%, 15%);  // Panel backgrounds
$color-bg-light:      hsl(240, 8%, 95%);   // Light mode (optional)
$color-text-primary:  hsl(240, 5%, 95%);   // High contrast text
$color-text-secondary: hsl(240, 5%, 70%);  // Deemphasized text
$color-text-tertiary: hsl(240, 5%, 50%);   // Metadata

// Functional Overlays
$color-overlay-dark:  hsla(240, 20%, 5%, 0.85);   // Modals
$color-overlay-light: hsla(240, 5%, 98%, 0.90);   // Tooltips
$color-glow:          hsla(340, 95%, 65%, 0.40);  // Active state auras

// ========== SPACING SYSTEM (8px base grid) ==========
$spacing-unit: 0.5rem;  // 8px baseline

$spacing: (
  'xs':   $spacing-unit * 1,    //  8px — Tight groupings
  'sm':   $spacing-unit * 2,    // 16px — Related elements
  'md':   $spacing-unit * 3,    // 24px — Section padding
  'lg':   $spacing-unit * 4,    // 32px — Major separations
  'xl':   $spacing-unit * 6,    // 48px — Hero spacing
  '2xl':  $spacing-unit * 8     // 64px — Stage transitions
);

// ========== Z-INDEX LAYERS (explicit stacking context) ==========
$z-index: (
  'canvas':         1,    // Drawing surface (base layer)
  'guides':         2,    // Polar grids, ghost lines
  'controls':       10,   // Sliders, buttons (always on top of canvas)
  'feedback':       20,   // Real-time accuracy overlays
  'modal':          100,  // Tutorials, results screens
  'toast':          200,  // Notifications, alerts
  'debug':          999   // Dev tools (only in development)
);

// ========== ANIMATION TOKENS ==========
$transition-fast:     150ms cubic-bezier(0.4, 0.0, 0.2, 1);  // Material Sharp
$transition-base:     300ms cubic-bezier(0.4, 0.0, 0.2, 1);  // Standard easing
$transition-slow:     600ms cubic-bezier(0.0, 0.0, 0.2, 1);  // Material Deceleration
$transition-bounce:   500ms cubic-bezier(0.68, -0.55, 0.27, 1.55); // Elastic

// Flow State Transitions (neuroscience-informed)
$transition-flow:     2000ms cubic-bezier(0.22, 0.61, 0.36, 1); // "Ease-Out-Expo"
// Rationale: Slow, smooth transitions prevent disrupting concentration

// ========== ELEVATION (Shadow System) ==========
@mixin elevation($level) {
  @if $level == 1 {
    box-shadow: 0 2px 4px hsla(240, 20%, 5%, 0.1);
  } @else if $level == 2 {
    box-shadow: 0 4px 8px hsla(240, 20%, 5%, 0.15);
  } @else if $level == 3 {
    box-shadow: 0 8px 16px hsla(240, 20%, 5%, 0.2);
  } @else if $level == 4 {
    box-shadow: 0 16px 32px hsla(240, 20%, 5%, 0.25);
  }
}

─────────────────────────────────────────────────────────────────────
COMPONENT STYLES (rangoli-learning.component.scss)
─────────────────────────────────────────────────────────────────────

@use 'styles/tokens' as *;

:host {
  display: block;
  width: 100%;
  height: 100vh;
  background: $color-bg-dark;
  overflow: hidden;
  font-family: $font-body;
  color: $color-text-primary;
}

// ========== MAIN LAYOUT (Split-Screen Canvas) ==========
.learning-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "reference canvas"
    "footer footer";
  height: 100vh;
  gap: 0;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(200px, 40%) 1fr auto;
    grid-template-areas:
      "header"
      "reference"
      "canvas"
      "footer";
  }
}

// ========== HEADER (Pattern Info + Progress) ==========
.header {
  grid-area: header;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: map-get($spacing, 'md') map-get($spacing, 'lg');
  background: linear-gradient(180deg, 
    $color-bg-medium 0%, 
    transparent 100%
  );
  backdrop-filter: blur(12px);
  border-bottom: 1px solid hsla(240, 5%, 95%, 0.05);
  z-index: map-get($z-index, 'controls');

  .pattern-info {
    display: flex;
    align-items: center;
    gap: map-get($spacing, 'md');

    h1 {
      font-family: $font-display;
      font-size: map-get($font-scale, 'title');
      font-weight: 600;
      margin: 0;
      color: $color-primary;
    }

    .difficulty-stars {
      display: flex;
      gap: map-get($spacing, 'xs');
      
      .star {
        width: 20px;
        height: 20px;
        color: $color-secondary;
        
        &.filled {
          animation: twinkle 2s ease-in-out infinite;
        }
      }
    }

    .info-icon {
      width: 24px;
      height: 24px;
      color: $color-text-secondary;
      cursor: pointer;
      transition: color $transition-fast;

      &:hover {
        color: $color-accent;
      }
    }
  }

  .stage-indicator {
    display: flex;
    align-items: center;
    gap: map-get($spacing, 'sm');
    font-size: map-get($font-scale, 'caption');
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: $color-text-secondary;

    .stage-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: $color-accent;
      color: $color-bg-dark;
      font-family: $font-mono;
      font-weight: 700;
      font-size: map-get($font-scale, 'body');
    }
  }
}

// ========== REFERENCE PANEL (Target Pattern) ==========
.reference-panel {
  grid-area: reference;
  position: relative;
  background: $color-bg-medium;
  border-right: 1px solid hsla(240, 5%, 95%, 0.05);
  overflow: hidden;

  .reference-canvas {
    width: 100%;
    height: 100%;
    opacity: 0.7;  // Semi-transparent by default
    transition: opacity $transition-base;

    &.overlay-mode {
      opacity: 0.3;  // More transparent when overlaid
    }
  }

  .reference-controls {
    position: absolute;
    bottom: map-get($spacing, 'lg');
    right: map-get($spacing, 'lg');
    display: flex;
    gap: map-get($spacing, 'sm');

    button {
      @include elevation(2);
      padding: map-get($spacing, 'sm') map-get($spacing, 'md');
      border: none;
      border-radius: 8px;
      background: $color-overlay-dark;
      backdrop-filter: blur(8px);
      color: $color-text-primary;
      font-size: map-get($font-scale, 'caption');
      cursor: pointer;
      transition: all $transition-fast;

      &:hover {
        background: $color-overlay-light;
        color: $color-bg-dark;
        @include elevation(3);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }
}

// ========== DRAWING CANVAS (User Input Area) ==========
.canvas-panel {
  grid-area: canvas;
  position: relative;
  background: $color-bg-dark;

  .drawing-canvas {
    width: 100%;
    height: 100%;
    cursor: crosshair;
    touch-action: none;  // Prevent browser gestures
  }

  // Real-time Feedback Overlay
  .feedback-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: map-get($z-index, 'feedback');

    .accuracy-meter {
      position: absolute;
      top: map-get($spacing, 'lg');
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: map-get($spacing, 'sm');

      .accuracy-value {
        font-family: $font-mono;
        font-size: map-get($font-scale, 'display');
        font-weight: 700;
        color: $color-success;
        text-shadow: 0 0 20px currentColor;
        animation: pulse-glow 2s ease-in-out infinite;

        &.low {
          color: $color-warning;
        }

        &.very-low {
          color: $color-error;
        }
      }

      .accuracy-label {
        font-size: map-get($font-scale, 'caption');
        color: $color-text-tertiary;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }
    }

    .pressure-gauge {
      position: absolute;
      top: 50%;
      right: map-get($spacing, 'lg');
      transform: translateY(-50%);
      width: 60px;
      height: 200px;

      // Vertical bar chart representation
      .gauge-fill {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 70%;  // Default 70% pressure
        background: linear-gradient(180deg, 
          $color-success 0%,
          $color-warning 50%,
          $color-error 100%
        );
        border-radius: 30px;
        transition: height $transition-fast;

        &::before {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          background: inherit;
          filter: blur(12px);
          opacity: 0.4;
          border-radius: inherit;
        }
      }

      .gauge-marker {
        position: absolute;
        left: -10px;
        right: -10px;
        height: 2px;
        background: $color-text-primary;

        &.optimal-zone {
          top: 30%;  // 60-80% target zone
          height: 20%;
          background: hsla(145, 65%, 50%, 0.2);
          border-top: 2px solid $color-success;
          border-bottom: 2px solid $color-success;
        }
      }
    }
  }
}

// ========== FOOTER (Controls + Tools) ==========
.footer {
  grid-area: footer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: map-get($spacing, 'md') map-get($spacing, 'lg');
  background: linear-gradient(0deg, 
    $color-bg-medium 0%, 
    transparent 100%
  );
  backdrop-filter: blur(12px);
  border-top: 1px solid hsla(240, 5%, 95%, 0.05);
  z-index: map-get($z-index, 'controls');

  .tool-group {
    display: flex;
    gap: map-get($spacing, 'sm');

    button {
      @include elevation(1);
      display: flex;
      align-items: center;
      gap: map-get($spacing, 'xs');
      padding: map-get($spacing, 'sm') map-get($spacing, 'md');
      border: none;
      border-radius: 8px;
      background: $color-bg-medium;
      color: $color-text-primary;
      font-family: $font-body;
      font-size: map-get($font-scale, 'body');
      cursor: pointer;
      transition: all $transition-fast;

      &:hover {
        background: $color-primary;
        color: $color-bg-dark;
        @include elevation(2);
      }

      &:active {
        transform: translateY(2px);
        @include elevation(1);
      }

      &.secondary {
        background: transparent;
        border: 1px solid $color-text-tertiary;

        &:hover {
          background: $color-bg-medium;
          border-color: $color-text-primary;
        }
      }
    }
  }

  .progress-summary {
    display: flex;
    align-items: center;
    gap: map-get($spacing, 'md');
    font-size: map-get($font-scale, 'caption');
    color: $color-text-secondary;

    .metric {
      display: flex;
      align-items: center;
      gap: map-get($spacing, 'xs');

      .metric-icon {
        width: 16px;
        height: 16px;
      }

      .metric-value {
        font-family: $font-mono;
        color: $color-text-primary;
      }
    }
  }
}

// ========== ANIMATIONS ==========

@keyframes twinkle {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.3);
  }
}

@keyframes slide-in-from-top {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Angular Animation Trigger Classes
.success-state {
  animation: success-flash $transition-base;
}

@keyframes success-flash {
  0% {
    background: $color-bg-dark;
  }
  50% {
    background: hsla(145, 65%, 50%, 0.2);
  }
  100% {
    background: $color-bg-dark;
  }
}

.error-state {
  animation: error-shake $transition-base;
}

@keyframes error-shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

=======================================================================
PILLAR 3: GAMIFICATION ENGINE (progress-tracker.service.ts)
=======================================================================

/**
 * Progress Tracker Service
 * 
 * Manages player progression, mastery scoring, and achievement unlocks.
 * Implements psychometric assessment algorithms for skill evaluation.
 * 
 * KEY RESPONSIBILITIES:
 * 1. Track multi-dimensional mastery metrics per stage
 * 2. Calculate composite "Guru Score" using weighted skill factors
 * 3. Persist progress to IndexedDB (with LocalStorage fallback)
 * 4. Emit real-time progress updates via RxJS streams
 * 5. Implement adaptive difficulty (Dynamic Difficulty Adjustment)
 */

import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import Dexie, { Table } from 'dexie';

// ========== INTERFACES ==========

interface SkillMetrics {
  pressureConsistency: number;     // 0-1 (σ of pressure)
  velocityConsistency: number;     // 0-1 (CV of velocity)
  angularPrecision: number;        // 0-1 (mean angular error)
  strokeOrderCompliance: number;   // 0-1 (% correct sequence)
  flowStateIndex: number;          // 0-1 (composite flow score)
}

interface SessionData {
  sessionId: string;
  patternId: number;
  stage: number;
  startTime: number;
  endTime: number;
  metrics: SkillMetrics;
  rawStrokes: StrokeData[];
}

interface StrokeData {
  timestamp: number;
  x: number;
  y: number;
  pressure: number;
  velocity: number;
  angle: number;
}

interface MasteryProgress {
  playerId: string;
  currentStage: number;
  stageCompletions: StageCompletion[];
  guruScore: number;           // 0-100 composite mastery
  totalPracticeTime: number;   // milliseconds
  achievements: Achievement[];
  lastSession: number;         // timestamp
}

interface StageCompletion {
  stage: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  attemptCount: number;
  bestMetrics: SkillMetrics;
  completedAt?: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: number;
  icon: string;
}

// ========== DEXIE DATABASE ==========

class ShilpaRangoliDB extends Dexie {
  sessions!: Table<SessionData, string>;
  progress!: Table<MasteryProgress, string>;

  constructor() {
    super('ShilpaRangoliDB');
    this.version(1).stores({
      sessions: 'sessionId, patternId, stage, startTime',
      progress: 'playerId'
    });
  }
}

// ========== SERVICE IMPLEMENTATION ==========

@Injectable({
  providedIn: 'root'
})
export class ProgressTrackerService {
  private db = new ShilpaRangoliDB();
  private playerId = this.getOrCreatePlayerId();

  // Angular Signals (for synchronous reactive state)
  currentStage = signal<number>(1);
  guruScore = signal<number>(0);

  // RxJS Streams (for async operations)
  private progressSubject = new BehaviorSubject<MasteryProgress | null>(null);
  public progress$ = this.progressSubject.asObservable();

  constructor() {
    this.loadProgress();
  }

  // ========== PLAYER ID MANAGEMENT ==========

  private getOrCreatePlayerId(): string {
    let id = localStorage.getItem('shilparangoli-player-id');
    if (!id) {
      id = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('shilparangoli-player-id', id);
    }
    return id;
  }

  // ========== PROGRESS LOADING ==========

  private async loadProgress(): Promise<void> {
    try {
      let progress = await this.db.progress.get(this.playerId);
      
      if (!progress) {
        // Initialize new player
        progress = {
          playerId: this.playerId,
          currentStage: 1,
          stageCompletions: this.initializeStages(),
          guruScore: 0,
          totalPracticeTime: 0,
          achievements: [],
          lastSession: Date.now()
        };
        await this.db.progress.put(progress);
      }

      this.currentStage.set(progress.currentStage);
      this.guruScore.set(progress.guruScore);
      this.progressSubject.next(progress);
    } catch (error) {
      console.error('Failed to load progress:', error);
      // Fallback to localStorage
      this.loadProgressFromLocalStorage();
    }
  }

  private initializeStages(): StageCompletion[] {
    return Array.from({ length: 5 }, (_, i) => ({
      stage: i + 1,
      isUnlocked: i === 0,  // Only stage 1 unlocked initially
      isCompleted: false,
      attemptCount: 0,
      bestMetrics: {
        pressureConsistency: 0,
        velocityConsistency: 0,
        angularPrecision: 0,
        strokeOrderCompliance: 0,
        flowStateIndex: 0
      }
    }));
  }

  // ========== SESSION RECORDING ==========

  async startSession(patternId: number, stage: number): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: SessionData = {
      sessionId,
      patternId,
      stage,
      startTime: Date.now(),
      endTime: 0,
      metrics: {
        pressureConsistency: 0,
        velocityConsistency: 0,
        angularPrecision: 0,
        strokeOrderCompliance: 0,
        flowStateIndex: 0
      },
      rawStrokes: []
    };

    await this.db.sessions.put(session);
    return sessionId;
  }

  async recordStroke(sessionId: string, stroke: StrokeData): Promise<void> {
    const session = await this.db.sessions.get(sessionId);
    if (session) {
      session.rawStrokes.push(stroke);
      await this.db.sessions.put(session);
    }
  }

  // ========== MASTERY SCORING (Core Algorithm) ==========

  async completeSession(
    sessionId: string, 
    metrics: SkillMetrics
  ): Promise<{ passed: boolean; feedback: string[] }> {
    const session = await this.db.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.endTime = Date.now();
    session.metrics = metrics;
    await this.db.sessions.put(session);

    // Calculate pass/fail for current stage
    const passThreshold = this.getStagePassThreshold(session.stage);
    const compositeScore = this.calculateCompositeScore(metrics, session.stage);
    const passed = compositeScore >= passThreshold;

    // Update progress
    const progress = await this.db.progress.get(this.playerId);
    if (progress) {
      const stageCompletion = progress.stageCompletions[session.stage - 1];
      stageCompletion.attemptCount++;

      if (passed && !stageCompletion.isCompleted) {
        stageCompletion.isCompleted = true;
        stageCompletion.completedAt = Date.now();
        
        // Unlock next stage
        if (session.stage < 5) {
          progress.stageCompletions[session.stage].isUnlocked = true;
          progress.currentStage = session.stage + 1;
          this.currentStage.set(session.stage + 1);
        }

        // Check for achievements
        this.checkAchievements(progress, metrics);
      }

      // Update best metrics if improved
      if (this.isMetricsImprovement(metrics, stageCompletion.bestMetrics)) {
        stageCompletion.bestMetrics = metrics;
      }

      // Recalculate Guru Score
      progress.guruScore = this.calculateGuruScore(progress);
      this.guruScore.set(progress.guruScore);

      // Update practice time
      const sessionDuration = session.endTime - session.startTime;
      progress.totalPracticeTime += sessionDuration;
      progress.lastSession = Date.now();

      await this.db.progress.put(progress);
      this.progressSubject.next(progress);
    }

    // Generate feedback
    const feedback = this.generateFeedback(metrics, session.stage, passed);

    return { passed, feedback };
  }

  // ========== SCORING ALGORITHMS ==========

  /**
   * Stage Pass Thresholds (Increasing difficulty)
   * Based on expertise acquisition research (Ericsson et al.)
   */
  private getStagePassThreshold(stage: number): number {
    const thresholds = {
      1: 0.70,  // Foundation: 70% composite score
      2: 0.75,  // Control: 75%
      3: 0.80,  // Symmetry: 80%
      4: 0.85,  // Composition: 85%
      5: 0.90   // Mastery: 90%
    };
    return thresholds[stage as keyof typeof thresholds] || 0.80;
  }

  /**
   * Composite Score Calculation
   * Weighted combination of all skill metrics
   * Weights vary by stage to emphasize stage-specific skills
   */
  private calculateCompositeScore(metrics: SkillMetrics, stage: number): number {
    const weights = this.getStageWeights(stage);
    
    const score = 
      (metrics.pressureConsistency * weights.pressure) +
      (metrics.velocityConsistency * weights.velocity) +
      (metrics.angularPrecision * weights.angular) +
      (metrics.strokeOrderCompliance * weights.strokeOrder) +
      (metrics.flowStateIndex * weights.flowState);

    return score;
  }

  /**
   * Stage-Specific Metric Weights
   * Each stage emphasizes different skills
   */
  private getStageWeights(stage: number): Record<string, number> {
    const weightsByStage: Record<number, Record<string, number>> = {
      1: { // Foundation: Focus on pressure control
        pressure: 0.40,
        velocity: 0.20,
        angular: 0.20,
        strokeOrder: 0.10,
        flowState: 0.10
      },
      2: { // Control: Focus on velocity consistency
        pressure: 0.25,
        velocity: 0.35,
        angular: 0.20,
        strokeOrder: 0.10,
        flowState: 0.10
      },
      3: { // Symmetry: Focus on angular precision
        pressure: 0.20,
        velocity: 0.20,
        angular: 0.40,
        strokeOrder: 0.10,
        flowState: 0.10
      },
      4: { // Composition: Focus on stroke order
        pressure: 0.15,
        velocity: 0.15,
        angular: 0.20,
        strokeOrder: 0.35,
        flowState: 0.15
      },
      5: { // Mastery: Focus on flow state
        pressure: 0.15,
        velocity: 0.15,
        angular: 0.20,
        strokeOrder: 0.20,
        flowState: 0.30
      }
    };

    return weightsByStage[stage] || weightsByStage[1];
  }

  /**
   * Overall Guru Score (0-100)
   * Represents player's holistic mastery across all stages
   */
  private calculateGuruScore(progress: MasteryProgress): number {
    let totalScore = 0;
    let completedStages = 0;

    for (const stage of progress.stageCompletions) {
      if (stage.isCompleted) {
        const stageScore = this.calculateCompositeScore(stage.bestMetrics, stage.stage);
        totalScore += stageScore;
        completedStages++;
      }
    }

    if (completedStages === 0) return 0;

    // Base score from completed stages
    const avgScore = totalScore / completedStages;

    // Bonus for completing all stages
    const completionBonus = completedStages === 5 ? 0.10 : 0;

    // Bonus for practice time (logarithmic diminishing returns)
    const hoursPracticed = progress.totalPracticeTime / (1000 * 60 * 60);
    const timeBonus = Math.min(0.10, Math.log10(hoursPracticed + 1) * 0.05);

    // Final score (capped at 100)
    return Math.min(100, (avgScore + completionBonus + timeBonus) * 100);
  }

  // ========== FEEDBACK GENERATION ==========

  private generateFeedback(
    metrics: SkillMetrics, 
    stage: number, 
    passed: boolean
  ): string[] {
    const feedback: string[] = [];
    const weights = this.getStageWeights(stage);

    // Find weakest metric (relative to stage weights)
    const weightedScores = {
      pressure: metrics.pressureConsistency * weights.pressure,
      velocity: metrics.velocityConsistency * weights.velocity,
      angular: metrics.angularPrecision * weights.angular,
      strokeOrder: metrics.strokeOrderCompliance * weights.strokeOrder,
      flowState: metrics.flowStateIndex * weights.flowState
    };

    const weakestMetric = Object.entries(weightedScores)
      .sort((a, b) => a[1] - b[1])[0][0];

    // Stage-specific feedback messages
    const stageFeedback: Record<number, Record<string, string[]>> = {
      1: {
        pressure: [
          "Your grip pressure varies too much. Try the 'grain of rice' visualization.",
          "Practice the pressure calibration drill for 2 minutes before retrying."
        ],
        velocity: [
          "Focus on steady hand movement. Imagine drawing underwater—smooth resistance.",
          "Enable audio feedback to hear speed variations."
        ]
      },
      2: {
        velocity: [
          "Work on maintaining constant speed. Use a metronome at 60 BPM.",
          "The spiral drill will help you build velocity consistency."
        ],
        flowState: [
          "You're thinking too much. Try the breathing exercise before starting.",
          "Focus on your peripheral vision, not directly at the cursor."
        ]
      },
      3: {
        angular: [
          "Angles are off. Use the clock face visualization: 12, 3, 6, 9.",
          "Turn on the polar grid guide and practice with 4-fold symmetry first."
        ]
      },
      4: {
        strokeOrder: [
          "Stroke sequence matters! Review the 'inside-out' principle.",
          "Watch the animated preview again and memorize the order."
        ]
      },
      5: {
        flowState: [
          "You're not in flow yet. Try the 30-minute uninterrupted practice session.",
          "Eliminate all distractions. Close other tabs. Dim the lights."
        ]
      }
    };

    // Add weakest metric feedback
    const stageFeedbackMsg = stageFeedback[stage]?.[weakestMetric];
    if (stageFeedbackMsg) {
      feedback.push(...stageFeedbackMsg);
    }

    // Overall pass/fail message
    if (passed) {
      feedback.unshift("✨ Stage completed! Your technique is solid. Ready for the next challenge?");
    } else {
      feedback.unshift("💡 Not quite there yet. Let's refine your technique:");
    }

    return feedback;
  }

  // ========== ACHIEVEMENTS ==========

  private checkAchievements(progress: MasteryProgress, metrics: SkillMetrics): void {
    const achievements: Achievement[] = [];

    // First Blood: Complete first stage
    if (progress.stageCompletions[0].isCompleted && 
        !progress.achievements.find(a => a.id === 'first_blood')) {
      achievements.push({
        id: 'first_blood',
        name: 'First Steps',
        description: 'Completed your first stage. The journey begins!',
        unlockedAt: Date.now(),
        icon: '🌱'
      });
    }

    // Perfect Precision: Any metric > 0.95
    const hasPerfectMetric = Object.values(metrics).some(v => v > 0.95);
    if (hasPerfectMetric && !progress.achievements.find(a => a.id === 'perfect_precision')) {
      achievements.push({
        id: 'perfect_precision',
        name: 'Perfect Precision',
        description: 'Achieved 95%+ in any skill metric',
        unlockedAt: Date.now(),
        icon: '🎯'
      });
    }

    // Flow Master: Flow Index > 0.90
    if (metrics.flowStateIndex > 0.90 && 
        !progress.achievements.find(a => a.id === 'flow_master')) {
      achievements.push({
        id: 'flow_master',
        name: 'Flow Master',
        description: 'Entered a true flow state',
        unlockedAt: Date.now(),
        icon: '🌊'
      });
    }

    // Marathon: 60+ minutes total practice
    const hoursP racticed = progress.totalPracticeTime / (1000 * 60 * 60);
    if (hoursPracticed >= 1 && !progress.achievements.find(a => a.id === 'marathon')) {
      achievements.push({
        id: 'marathon',
        name: 'Marathon',
        description: 'Practiced for over 1 hour total',
        unlockedAt: Date.now(),
        icon: '⏱️'
      });
    }

    // Guru: Complete all 5 stages
    const allCompleted = progress.stageCompletions.every(s => s.isCompleted);
    if (allCompleted && !progress.achievements.find(a => a.id === 'guru')) {
      achievements.push({
        id: 'guru',
        name: 'Guru',
        description: 'Mastered all 5 stages. You are ready to teach.',
        unlockedAt: Date.now(),
        icon: '🏆'
      });
    }

    // Add new achievements to progress
    if (achievements.length > 0) {
      progress.achievements.push(...achievements);
    }
  }

  private isMetricsImprovement(current: SkillMetrics, best: SkillMetrics): boolean {
    const currentScore = 
      current.pressureConsistency +
      current.velocityConsistency +
      current.angularPrecision +
      current.strokeOrderCompliance +
      current.flowStateIndex;

    const bestScore = 
      best.pressureConsistency +
      best.velocityConsistency +
      best.angularPrecision +
      best.strokeOrderCompliance +
      best.flowStateIndex;

    return currentScore > bestScore;
  }

  // ========== LOCALSTORAGE FALLBACK ==========

  private loadProgressFromLocalStorage(): void {
    const stored = localStorage.getItem('shilparangoli-progress');
    if (stored) {
      try {
        const progress: MasteryProgress = JSON.parse(stored);
        this.currentStage.set(progress.currentStage);
        this.guruScore.set(progress.guruScore);
        this.progressSubject.next(progress);
      } catch (error) {
        console.error('Failed to parse localStorage progress:', error);
      }
    }
  }

  // ========== PUBLIC API ==========

  getProgress(): Observable<MasteryProgress | null> {
    return this.progress$;
  }

  async getStageStatus(stage: number): Promise<StageCompletion | null> {
    const progress = await this.db.progress.get(this.playerId);
    return progress?.stageCompletions[stage - 1] || null;
  }

  async getAllSessions(stage?: number): Promise<SessionData[]> {
    if (stage) {
      return this.db.sessions.where('stage').equals(stage).toArray();
    }
    return this.db.sessions.toArray();
  }

  async resetProgress(): Promise<void> {
    await this.db.progress.delete(this.playerId);
    await this.db.sessions.clear();
    await this.loadProgress();
  }
}

=======================================================================
PILLAR 4: UX & FIRST-TIME USER EXPERIENCE
=======================================================================

ONBOARDING PHILOSOPHY:
"Show, Don't Tell" — Users learn by DOING, not reading.
Inspired by: Nintendo's teaching methods (Super Mario), Duolingo's bite-sized lessons.

─────────────────────────────────────────────────────────────────────
GHOST-HAND TUTORIAL SYSTEM (3-Step Interactive Flow)
─────────────────────────────────────────────────────────────────────

IMPLEMENTATION: Create a separate `OnboardingComponent` that runs on first launch.

/**
 * Onboarding Tutorial Service
 * 
 * Manages the "Ghost Hand" guided tutorial that teaches physical technique
 * through kinesthetic demonstration before any pattern practice begins.
 */

import { Injectable, signal } from '@angular/core';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  demoAnimation: GhostHandAnimation;
  validation: ValidationRule;
  successCriteria: SuccessCriteria;
  hints: string[];
}

interface GhostHandAnimation {
  type: 'pressure-demo' | 'velocity-demo' | 'angle-demo';
  duration: number;  // milliseconds
  path: Point[];
  pressureProfile?: number[];  // Synchronized pressure values
  timing: 'linear' | 'ease-in' | 'ease-out' | 'custom';
}

interface ValidationRule {
  metric: string;
  threshold: number;
  feedbackMessage: string;
}

interface SuccessCriteria {
  minAttempts: number;
  successThreshold: number;  // 0-1
  allowedTime: number;  // milliseconds
}

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  currentStep = signal<number>(0);
  isOnboardingComplete = signal<boolean>(false);

  private tutorialSteps: TutorialStep[] = [
    {
      id: 'grip_introduction',
      title: 'Step 1: The Sacred Grip',
      description: 'Watch how the ghost hand holds the virtual brush. Notice the three-finger pinch.',
      demoAnimation: {
        type: 'pressure-demo',
        duration: 5000,
        path: this.generateStraightLinePath(),
        pressureProfile: this.generateConstantPressure(0.70),
        timing: 'linear'
      },
      validation: {
        metric: 'pressureConsistency',
        threshold: 0.20,  // Allow higher variance than stage 1
        feedbackMessage: 'Try to match the steady pressure of the ghost hand'
      },
      successCriteria: {
        minAttempts: 3,
        successThreshold: 0.70,
        allowedTime: 30000
      },
      hints: [
        'Rest your ring and pinky fingers on the desk',
        'Your wrist should stay relaxed, not tense',
        'Think of it like holding a delicate egg'
      ]
    },
    {
      id: 'velocity_control',
      title: 'Step 2: Steady as a Stream',
      description: 'The ghost hand moves at a constant speed. Can you match it?',
      demoAnimation: {
        type: 'velocity-demo',
        duration: 6000,
        path: this.generateCurvedPath(),
        timing: 'linear'
      },
      validation: {
        metric: 'velocityConsistency',
        threshold: 0.25,
        feedbackMessage: 'Your speed is too jerky. Smoother, like pouring honey.'
      },
      successCriteria: {
        minAttempts: 3,
        successThreshold: 0.70,
        allowedTime: 45000
      },
      hints: [
        'Exhale slowly as you draw',
        'Don't look at the cursor—watch the whole line',
        'Enable audio feedback to hear your rhythm'
      ]
    },
    {
      id: 'angle_awareness',
      title: 'Step 3: The Compass Within',
      description: 'Draw four strokes at perfect 90° angles. Follow the ghost's radial motion.',
      demoAnimation: {
        type: 'angle-demo',
        duration: 8000,
        path: this.generateRadialPath(4),
        timing: 'ease-out'
      },
      validation: {
        metric: 'angularPrecision',
        threshold: 5,  // degrees
        feedbackMessage: 'Use the clock face: 12, 3, 6, 9'
      },
      successCriteria: {
        minAttempts: 3,
        successThreshold: 0.75,
        allowedTime: 60000
      },
      hints: [
        'Your wrist is the pivot point—rotate, don't translate',
        'Visualize a clock face overlay',
        'Count out loud: "Zero... ninety... one-eighty..."'
      ]
    }
  ];

  constructor() {
    this.checkOnboardingStatus();
  }

  private checkOnboardingStatus(): void {
    const completed = localStorage.getItem('shilparangoli-onboarding-complete');
    this.isOnboardingComplete.set(completed === 'true');
  }

  getTutorialStep(index: number): TutorialStep | null {
    return this.tutorialSteps[index] || null;
  }

  async validateStep(stepIndex: number, userMetrics: any): Promise<boolean> {
    const step = this.tutorialSteps[stepIndex];
    if (!step) return false;

    const metricValue = userMetrics[step.validation.metric];
    const passed = metricValue <= step.validation.threshold;

    return passed;
  }

  async completeOnboarding(): Promise<void> {
    localStorage.setItem('shilparangoli-onboarding-complete', 'true');
    this.isOnboardingComplete.set(true);
  }

  private generateStraightLinePath(): Point[] {
    // Generate 100 points for a 10cm horizontal line
    return Array.from({ length: 100 }, (_, i) => ({
      x: 100 + (i * 3),  // Start at x=100, increment by 3px
      y: 200  // Constant y
    }));
  }

  private generateCurvedPath(): Point[] {
    // Generate smooth S-curve (cubic bezier)
    const points: Point[] = [];
    for (let t = 0; t <= 1; t += 0.01) {
      const x = 100 + (t * 400);
      const y = 200 + Math.sin(t * Math.PI * 2) * 80;
      points.push({ x, y });
    }
    return points;
  }

  private generateRadialPath(axes: number): Point[] {
    // Generate radial strokes from center
    const centerX = 300;
    const centerY = 300;
    const radius = 100;
    const points: Point[] = [];

    for (let i = 0; i < axes; i++) {
      const angle = (i * 360 / axes) * (Math.PI / 180);
      
      // Each stroke: 20 points from center to edge
      for (let j = 0; j <= 20; j++) {
        const r = (j / 20) * radius;
        points.push({
          x: centerX + Math.cos(angle) * r,
          y: centerY + Math.sin(angle) * r
        });
      }
    }

    return points;
  }

  private generateConstantPressure(value: number): number[] {
    return Array(100).fill(value);
  }
}

─────────────────────────────────────────────────────────────────────
GHOST HAND VISUALIZATION (p5.js Component)
─────────────────────────────────────────────────────────────────────

/**
 * Ghost Hand Renderer
 * 
 * Visualizes the ideal technique through animated "ghost" strokes
 * that demonstrate correct pressure, velocity, and angle.
 * 
 * Visual Design: Semi-transparent white trail with pressure-based width
 */

export class GhostHandRenderer {
  private currentAnimation: GhostHandAnimation | null = null;
  private animationProgress = 0;
  private isPlaying = false;

  constructor(private p5: p5) {}

  startAnimation(animation: GhostHandAnimation): void {
    this.currentAnimation = animation;
    this.animationProgress = 0;
    this.isPlaying = true;
  }

  stopAnimation(): void {
    this.isPlaying = false;
    this.currentAnimation = null;
  }

  update(deltaTime: number): void {
    if (!this.isPlaying || !this.currentAnimation) return;

    this.animationProgress += deltaTime / this.currentAnimation.duration;

    if (this.animationProgress >= 1) {
      // Loop animation
      this.animationProgress = 0;
    }
  }

  draw(): void {
    if (!this.currentAnimation) return;

    const animation = this.currentAnimation;
    const totalPoints = animation.path.length;
    const currentIndex = Math.floor(this.animationProgress * totalPoints);

    // Draw ghost trail (fade-out effect)
    for (let i = Math.max(0, currentIndex - 20); i < currentIndex; i++) {
      const point = animation.path[i];
      const nextPoint = animation.path[i + 1];
      if (!nextPoint) continue;

      // Calculate opacity (older points fade out)
      const age = currentIndex - i;
      const opacity = 255 * (1 - age / 20);

      // Calculate line width based on pressure (if available)
      const pressure = animation.pressureProfile?.[i] || 0.70;
      const lineWidth = 2 + (pressure * 6);  // 2-8px range

      this.p5.stroke(255, 255, 255, opacity);
      this.p5.strokeWeight(lineWidth);
      this.p5.line(point.x, point.y, nextPoint.x, nextPoint.y);
    }

    // Draw ghost cursor (glowing circle)
    if (currentIndex < totalPoints) {
      const currentPoint = animation.path[currentIndex];
      const pressure = animation.pressureProfile?.[currentIndex] || 0.70;

      // Outer glow
      this.p5.noStroke();
      this.p5.fill(255, 255, 255, 30);
      this.p5.circle(currentPoint.x, currentPoint.y, 40);

      // Inner cursor
      this.p5.fill(255, 255, 255, 200);
      this.p5.circle(currentPoint.x, currentPoint.y, 12 + pressure * 8);

      // Pressure indicator (pulsing ring)
      this.p5.noFill();
      this.p5.stroke(255, 255, 255, 150);
      this.p5.strokeWeight(2);
      const pulseSize = 20 + Math.sin(this.animationProgress * Math.PI * 4) * 5;
      this.p5.circle(currentPoint.x, currentPoint.y, pulseSize);
    }
  }
}

=======================================================================
OUTPUT DELIVERABLES — EXECUTION CHECKLIST
=======================================================================

Before submitting your implementation, verify ALL of the following:

✅ ARCHITECTURE
  □ All components are standalone (NO NgModules)
  □ Signals used for synchronous state (currentStage, guruScore)
  □ BehaviorSubject used only for async progress streams
  □ Web Workers correctly implemented (postMessage/onmessage)
  □ Dexie.js integrated for IndexedDB with LocalStorage fallback

✅ CURRICULUM
  □ All 5 stages fully specified with drills
  □ JSON popover data matches stage requirements
  □ Cultural citations included and accurate
  □ Pedagogical progression follows Fitts & Posner model

✅ DESIGN SYSTEM
  □ SCSS tokens defined in global _tokens.scss
  □ Typography scale uses Major Third ratio (1.250)
  □ Color palette uses HSL for programmatic manipulation
  □ All animations use cubic-bezier timing functions
  □ Angular animations triggered by state changes

✅ SCORING ENGINE
  □ Stage-specific metric weights implemented
  □ Composite score calculation verified
  □ Guru Score formula includes time bonus
  □ Feedback messages are actionable and specific

✅ ONBOARDING
  □ 3-step Ghost Hand tutorial implemented
  □ Each tutorial step has validation logic
  □ GhostHandRenderer draws animated demonstrations
  □ Haptic feedback integrated (where supported)

✅ PERFORMANCE
  □ p5.js runs in instance mode (not global)
  □ Canvas renders at consistent 60fps
  □ Web Workers don't block main thread
  □ Memory leaks prevented (ngOnDestroy cleanup)

✅ ACCESSIBILITY
  □ All interactive elements have 44×44px touch targets
  □ Color contrast meets WCAG AA (4.5:1 minimum)
  □ Keyboard navigation functional (Tab, Enter)
  □ Screen reader labels present on all UI

✅ CULTURAL RESPECT
  □ Traditional techniques accurately represented
  □ Citations to cultural experts included
  □ Language avoids appropriation or stereotypes
  □ "Guru" title used respectfully (earned achievement)

=======================================================================
BEGIN IMPLEMENTATION. Generate production-ready Angular code.
All 5 stages must be fully spec'd. No pseudocode. No placeholders.
=======================================================================