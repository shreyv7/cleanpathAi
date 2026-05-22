
import pool, { query } from '../db';

interface PublisherSeed {
    domain: string;
    status: 'active' | 'inactive' | 'mfa';
    thermal_score: number;
    risk_level: 'low' | 'medium' | 'high';
}

const CLEAN_DOMAINS = [
    'nytimes.com', 'techcrunch.com', 'github.com', 'stackoverflow.com', 'wired.com',
    'arstechnica.com', 'bloomberg.com', 'reuters.com', 'bbc.com', 'cnn.com',
    'forbes.com', 'wsj.com', 'hbr.org', 'economist.com', 'nationalgeographic.com',
    'scientificamerican.com', 'nature.com', 'ieee.org', 'acm.org', 'mit.edu'
];

const MODERATE_DOMAINS = [
    'buzz-news-daily.com', 'viral-trends.net', 'top10-lists.org', 'celeb-gossip.biz',
    'gaming-cheats.info', 'recipe-haven.net', 'travel-deals-finder.com', 'crypto-watch.io',
    'health-tips-daily.com', 'parenting-advice.net', 'car-reviews-hub.com', 'movie-trailers.tv',
    'funny-cats.io', 'meme-central.xyz', 'gadget-reviews.tech', 'fashion-trends.style',
    'home-decor-ideas.net', 'garden-tips.org', 'pet-care-guide.com', 'fitness-hacks.io'
];

const HIGH_RISK_DOMAINS = [
    'win-free-money-now.xyz', 'download-free-ram.net', 'meet-singles-tonight.biz',
    'cure-all-diseases.info', 'click-here-now.site', 'viral-video-shocking.tv',
    'get-rich-quick.scheme', 'unbelievable-stories.news', 'you-wont-believe-wait.click',
    'claim-your-prize.reward'
];

const publishers: PublisherSeed[] = [];

// Generate Clean Publishers (Score 0-25)
CLEAN_DOMAINS.forEach(domain => {
    publishers.push({
        domain,
        status: 'active',
        thermal_score: Math.floor(Math.random() * 26), // 0-25
        risk_level: 'low'
    });
});

// Generate Moderate Publishers (Score 30-60)
MODERATE_DOMAINS.forEach(domain => {
    publishers.push({
        domain,
        status: 'active',
        thermal_score: Math.floor(Math.random() * 31) + 30, // 30-60
        risk_level: 'medium'
    });
});

// Generate High Risk Publishers (Score 75-95)
HIGH_RISK_DOMAINS.forEach(domain => {
    publishers.push({
        domain,
        status: 'mfa',
        thermal_score: Math.floor(Math.random() * 21) + 75, // 75-95
        risk_level: 'high'
    });
});

async function seed() {
    console.log('🌱 Seeding publishers...');

    try {
        // Clear existing data to avoid duplicates/conflicts during improved dev cycles
        await query('TRUNCATE TABLE publishers CASCADE');
        console.log('Cleared existing publishers table');

        for (const pub of publishers) {
            await query(
                `INSERT INTO publishers (domain, status, thermal_score, risk_level)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (domain) DO UPDATE 
         SET thermal_score = EXCLUDED.thermal_score,
             risk_level = EXCLUDED.risk_level,
             status = EXCLUDED.status`,
                [pub.domain, pub.status, pub.thermal_score, pub.risk_level]
            );
        }

        console.log(`✅ Successfully seeded ${publishers.length} publishers`);
    } catch (err) {
        console.error('❌ Error seeding publishers:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

seed();
