
import app from './app';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log(`Application API running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        // Close DB pool if needed
    });
});
