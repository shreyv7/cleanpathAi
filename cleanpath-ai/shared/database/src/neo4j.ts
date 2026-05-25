
import neo4j, { Driver, Session } from 'neo4j-driver';

export interface Neo4jConfig {
    uri: string;
    user: string;
    pass: string;
}

export class Neo4jPool {
    private driver: Driver;
    private static instance: Neo4jPool;

    private constructor(config: Neo4jConfig) {
        this.driver = neo4j.driver(
            config.uri,
            neo4j.auth.basic(config.user, config.pass),
            {
                maxConnectionPoolSize: 50,
                connectionTimeout: 30000,
            }
        );
    }

    public static getInstance(config?: Neo4jConfig): Neo4jPool {
        if (!Neo4jPool.instance) {
            const resolvedConfig = config || {
                uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
                user: process.env.NEO4J_USER || 'neo4j',
                pass: process.env.NEO4J_PASS || 'password'
            };
            Neo4jPool.instance = new Neo4jPool(resolvedConfig);
        }
        return Neo4jPool.instance;
    }

    public async read<T>(query: string, params: Record<string, any> = {}): Promise<T[]> {
        const session: Session = this.driver.session({ defaultAccessMode: neo4j.session.READ });
        try {
            const result = await session.run(query, params);
            return result.records.map(record => record.toObject() as T);
        } finally {
            await session.close();
        }
    }

    public async write<T>(query: string, params: Record<string, any> = {}): Promise<T[]> {
        const session: Session = this.driver.session({ defaultAccessMode: neo4j.session.WRITE });
        try {
            const result = await session.run(query, params);
            return result.records.map(record => record.toObject() as T);
        } finally {
            await session.close();
        }
    }

    public async close(): Promise<void> {
        await this.driver.close();
    }

    /**
     * Get a raw session for complex transactions
     */
    public getSession(accessMode: 'READ' | 'WRITE' = 'WRITE'): Session {
        return this.driver.session({ defaultAccessMode: accessMode === 'READ' ? neo4j.session.READ : neo4j.session.WRITE });
    }

    /**
     * Health check helper
     */
    public async verifyConnectivity(): Promise<boolean> {
        try {
            await this.driver.verifyConnectivity();
            return true;
        } catch (error) {
            console.error('Neo4j Connectivity Error:', error);
            return false;
        }
    }
}
