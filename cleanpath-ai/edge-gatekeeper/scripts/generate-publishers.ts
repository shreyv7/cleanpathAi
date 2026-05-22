import * as fs from 'fs';
import * as path from 'path';
import { PublisherMFAProfile, RiskLevel, PublisherTier, PublisherStatus } from '@cleanpath/types';

const DATA_DIR = path.resolve(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const OUT_FILE = path.join(DATA_DIR, 'publishers.json');

const getRandomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const generateCleanPublisher = (index: number): PublisherMFAProfile => {
    // Clean: Low score (0-25), High engagement, Low ad density
    return {
        publisherId: `pub_clean_${index}`,
        domain: `clean-publisher-${index}.com`,
        currentThermalScore: {
            overall: getRandomInt(0, 25),
            breakdown: {
                adDensity: getRandomInt(0, 20),
                engagement: getRandomInt(0, 20), // Low score means high engagement (inverse)
                contentQuality: getRandomInt(0, 20), // Low score means high quality (inverse)
                domainReputation: getRandomInt(0, 20)
            },
            signals: [],
            confidence: 0.9 + (Math.random() * 0.1)
        },
        currentRiskLevel: RiskLevel.CLEAN,
        historicalScores: [],
        lastEvaluated: Date.now(),
        evaluationCount: 1,
        // Mock additional properties if they existed on PublisherMFAProfile but types says:
        // publisherId, currentThermalScore, currentRiskLevel, historicalScores, lastEvaluated, evaluationCount, overrides
    };
};

const generateModeratePublisher = (index: number): PublisherMFAProfile => {
    // Moderate: Score 30-70
    return {
        publisherId: `pub_moderate_${index}`,
        domain: `moderate-publisher-${index}.com`,
        currentThermalScore: {
            overall: getRandomInt(35, 65),
            breakdown: {
                adDensity: getRandomInt(30, 60),
                engagement: getRandomInt(30, 60),
                contentQuality: getRandomInt(30, 60),
                domainReputation: getRandomInt(30, 60)
            },
            signals: [],
            confidence: 0.8
        },
        currentRiskLevel: RiskLevel.MODERATE,
        historicalScores: [],
        lastEvaluated: Date.now(),
        evaluationCount: 1
    };
};

const generateHighPublisher = (index: number): PublisherMFAProfile => {
    // High: Score 75-100
    return {
        publisherId: `pub_high_${index}`,
        domain: `high-risk-publisher-${index}.com`,
        currentThermalScore: {
            overall: getRandomInt(80, 100),
            breakdown: {
                adDensity: getRandomInt(80, 100),
                engagement: getRandomInt(80, 100), // High score = low engagement
                contentQuality: getRandomInt(80, 100), // High score = low quality
                domainReputation: getRandomInt(80, 100)
            },
            signals: [], // In real engine, signals would be populated based on rules
            confidence: 0.95
        },
        currentRiskLevel: RiskLevel.HIGH,
        historicalScores: [],
        lastEvaluated: Date.now(),
        evaluationCount: 1
    };
};

const publishers: PublisherMFAProfile[] = [
    ...Array.from({ length: 20 }, (_, i) => generateCleanPublisher(i + 1)),
    ...Array.from({ length: 20 }, (_, i) => generateModeratePublisher(i + 1)),
    ...Array.from({ length: 10 }, (_, i) => generateHighPublisher(i + 1))
];

fs.writeFileSync(OUT_FILE, JSON.stringify(publishers, null, 2));
console.log(`Generated ${publishers.length} publisher profiles to ${OUT_FILE}`);
