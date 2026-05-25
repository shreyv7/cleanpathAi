import app from './app';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { runMigrations } from './database/migrate';

dotenv.config();

const port = process.env.PORT || 3000;

async function bootstrap() {
    try {
        await runMigrations();
    } catch (e) {
        console.error('Failed to run migrations on startup:', e);
    }

    const server = app.listen(port, () => {
        console.log(`Application API running on port ${port}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM signal received: closing HTTP server');
        server.close(() => {
            console.log('HTTP server closed');
        });
    });
}

bootstrap();
