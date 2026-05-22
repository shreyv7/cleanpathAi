/// <reference types="jest" />
import { FinancialAuditor } from '../../services/FinancialAuditor';
import { Neo4jPool } from '@cleanpath/database';

describe('FinancialAuditor Integration', () => {
    let auditor: FinancialAuditor;

    beforeAll(async () => {
        // Initialize Neo4j pool first to connect to the Docker container
        Neo4jPool.getInstance({
            uri: 'neo4j://localhost:7687',
            user: 'neo4j',
            pass: 'password'
        });
        
        auditor = new FinancialAuditor();
        // Option to inject bad path data here, but our queries return real results 
        // regardless of matching rows since they do not fail against the DB.
    });

    afterAll(async () => {
        // Cleanup connections
        const pool = Neo4jPool.getInstance();
        if (pool) {
            await pool.close();
        }
    });

    it('should successfully execute findHighFeePaths against real Neo4j without stubbing', async () => {
        // Find paths with fee threshold > 0.10 (10%)
        const results = await auditor.findHighFeePaths(0.10);
        
        // Results may be empty if we haven't seeded explicit fee data,
        // but it must return an array and not throw.
        expect(Array.isArray(results)).toBe(true);
    });

    it('should calculate average path fees for a given domain', async () => {
        const avgFee = await auditor.getAveragePathFees('thetimes.com');
        
        // Expected to return a number (could be 0 if no relationships match)
        expect(typeof avgFee).toBe('number');
        expect(avgFee).toBeGreaterThanOrEqual(0);
    });
});
