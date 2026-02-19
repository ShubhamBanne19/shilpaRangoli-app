/**
 * stage-guides.data.ts
 * Rich popover data for the ℹ icon in each learning stage.
 * Includes pedagogical guidance, cultural citations, and technique tips.
 */

export interface StageGuideItem {
    icon: string;
    title: string;
    description: string;
}

export interface StageGuide {
    stage: number;
    stageName: string;
    technique: string;
    guideItems: StageGuideItem[];
    culturalContext: {
        tradition: string;
        practitioner: string;
        citation: string;
    };
    drills: string[];
    passThreshold: string;
}

export const STAGE_GUIDES: StageGuide[] = [
    {
        stage: 1,
        stageName: 'Foundation',
        technique: 'Pinch Grip Mastery',
        guideItems: [
            {
                icon: '👌',
                title: 'Three-Finger Hold',
                description: 'Thumb, index, middle—like holding a grain of rice. Ring and pinky rest on table for stability.'
            },
            {
                icon: '🎯',
                title: 'Pressure Sweet Spot',
                description: 'Aim for 60–80% pressure. Too light = shaky lines. Too hard = hand fatigue.'
            },
            {
                icon: '🔄',
                title: 'Wrist Pivot Point',
                description: 'Your wrist is the compass center. Fingers control detail, wrist controls curves.'
            },
            {
                icon: '⏱️',
                title: 'Practice Rhythm',
                description: '3 sets × 5 strokes. Rest 30 seconds between sets. Quality over quantity.'
            }
        ],
        culturalContext: {
            tradition: 'Tamil Kolam',
            practitioner: 'Expert kolam artists develop calluses on these three fingers after years of daily practice.',
            citation: 'Dr. Vijaya Nagarajan, "Threshold Designs" (2018)'
        },
        drills: [
            'Straight Line Pressure Hold — maintain σ < 0.12',
            'Concentric Circle Consistency — 3 circles, σ < 0.15',
            'Dot Grid Precision — 5×5 grid at 75% pressure',
            'Petal Stroke Sequence — 8 symmetrical petals',
            'Speed–Pressure Decoupling — same pressure at 3 speeds'
        ],
        passThreshold: '80%+ on 4 out of 5 drills'
    },
    {
        stage: 2,
        stageName: 'Control',
        technique: 'Controlled Release Dynamics',
        guideItems: [
            {
                icon: '🌊',
                title: 'Flow Like Water',
                description: 'Imagine pouring honey—steady, continuous, never jerky. Your hand should feel weightless.'
            },
            {
                icon: '🎵',
                title: 'Listen to Your Speed',
                description: 'Enable audio feedback. A steady tone = perfect control. Pitch changes = speed wobbles.'
            },
            {
                icon: '👁️',
                title: 'Peripheral Vision Trick',
                description: 'Don\'t stare at the cursor. Soften your gaze to see the whole pattern. Masters draw \'blind\'.'
            },
            {
                icon: '💨',
                title: 'Breath Sync',
                description: 'Exhale during strokes. Inhale during pauses. This is Zen archery applied to art.'
            }
        ],
        culturalContext: {
            tradition: 'Rajasthani Mandana',
            practitioner: 'Village artists create 10-meter murals in one breath-controlled session.',
            citation: 'Gujarat Folk Arts Museum, Field Study 2019'
        },
        drills: [
            'Velocity Staircase — 3, 5, 7 cm/s segments',
            'Spiral Consistency — outward spiral at constant speed',
            'Pulsed Line Texture — dotted line via pulsed motion',
            'Figure-8 Infinity Loop — 30 second continuous loop',
            'Blindfold Mode — draw straight line from muscle memory'
        ],
        passThreshold: '85%+ on 4 out of 5 drills'
    },
    {
        stage: 3,
        stageName: 'Symmetry',
        technique: 'Radial Precision',
        guideItems: [
            {
                icon: '🧭',
                title: 'Mental Compass',
                description: 'Imagine a clock face. 12, 3, 6, 9 = perfect 4-fold. Use this as your anchor.'
            },
            {
                icon: '🔢',
                title: 'Count Your Angles',
                description: 'Whisper the divisions out loud: "45… 90… 135…" Verbal encoding improves motor accuracy.'
            },
            {
                icon: '🎯',
                title: 'Pivot From Center',
                description: 'Your wrist is the compass point. Small wrist rotation = big arc on the edge.'
            },
            {
                icon: '🪞',
                title: 'Mirror Check',
                description: 'After each stroke, imagine folding the canvas. Would the halves match?'
            }
        ],
        culturalContext: {
            tradition: 'Tamil Kolam',
            practitioner: 'Traditional kolam use \'pulli\' (dot grids) as built-in angle guides.',
            citation: 'Ascher, M. "Ethnomathematics" (1991)'
        },
        drills: [
            'Cardinal Directions — 4 dots at 0°, 90°, 180°, 270°',
            'Octagon Construction — 8 petals at 45° intervals',
            'Speed–Accuracy Tradeoff — 8-fold in 60s / 45s / 30s',
            'Inverted Symmetry — draw pattern rotated 180°',
            'Hybrid Symmetry — 4-fold primary + 8-fold secondary'
        ],
        passThreshold: '90%+ on 4-fold and 6-fold accuracy'
    },
    {
        stage: 4,
        stageName: 'Composition',
        technique: 'Stroke Order Mastery',
        guideItems: [
            {
                icon: '🌸',
                title: 'Bloom From Center',
                description: 'Like a real flower: seed → petals → leaves. Never draw leaves before petals.'
            },
            {
                icon: '🎼',
                title: 'Visual Music',
                description: 'Each stroke is a note. Wrong order = dissonant chord. Right order = harmony.'
            },
            {
                icon: '🧘',
                title: 'Meditative Sequence',
                description: 'Traditional artists chant mantras synced to stroke order. Rhythm creates flow.'
            },
            {
                icon: '🔗',
                title: 'Continuous Line',
                description: 'Advanced: Draw entire pattern without lifting. Requires perfect sequence planning.'
            }
        ],
        culturalContext: {
            tradition: 'Bengali Alpana',
            practitioner: 'Alpana artists use specific stroke sequences passed down orally through generations.',
            citation: 'Santiniketan Archives, Oral History Project (2015)'
        },
        drills: [
            'Linear Sequence — 3-layer center → petals → ring',
            'Speed Sequence Challenge — 8-layer in 90 seconds',
            'Memory Sequence — study 30s, then draw without hints',
            'Interrupted Sequence — 15s forced pause every 10 strokes',
            'Adaptive Sequencing — user-defined order validated by AI'
        ],
        passThreshold: '95%+ sequence compliance on 3 patterns'
    },
    {
        stage: 5,
        stageName: 'Mastery',
        technique: 'Flow State Achievement',
        guideItems: [
            {
                icon: '🌊',
                title: 'Effortless Effort',
                description: 'Stop trying. Let your hand draw itself. You\'re just watching.'
            },
            {
                icon: '⏰',
                title: 'Time Collapse',
                description: 'If you\'re checking the clock, you\'re not in flow. True mastery feels timeless.'
            },
            {
                icon: '🎭',
                title: 'Lose Yourself',
                description: 'The boundary between you and the canvas dissolves. This is \'no-mind\'.'
            },
            {
                icon: '🔥',
                title: 'Challenge–Skill Balance',
                description: 'Flow occurs when task difficulty perfectly matches your ability. We\'ll auto-adjust.'
            }
        ],
        culturalContext: {
            tradition: 'Universal (Zen, Sufism, Tamil Kolam)',
            practitioner: 'Master artists describe entering \'trance states\' where patterns emerge spontaneously.',
            citation: 'Csikszentmihalyi, M. "Flow" (1990)'
        },
        drills: [
            'Timed Mastery Pattern — 12-fold with zero UI feedback',
            'Blindfold Mastery — audio cues only',
            'Ambient Mastery — draw with distractions (<10% performance drop)',
            'Teaching Mode — explain while drawing (dual-task)',
            'Improvisational Mastery — create original pattern'
        ],
        passThreshold: 'Flow Index > 0.85 on 3 different pattern families'
    }
];
