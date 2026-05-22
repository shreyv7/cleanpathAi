import express from 'express';
import cors from 'cors';
import publisherRoutes from './routes/publisherRoutes';
import decisionRoutes from './routes/decisionRoutes';
import graphRoutes from './routes/graphRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import budgetRoutes from './routes/budgetRoutes';
import financialRoutes from './routes/financialRoutes';
import pulseRoutes from './routes/pulseRoutes';
import telemetryRoutes from './routes/telemetryRoutes';
import { authMiddleware } from './middleware/authMiddleware';

const app = express();

// Enable CORS with explicit custom headers allowed
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'x-api-key', 'x-internal-service-key']
}));

// Basic Security Headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

app.use(express.json());

// Apply Authentication Middleware globally for routes
app.use(authMiddleware);

// Routes
app.use('/api/publishers', publisherRoutes);
app.use('/api/decisions', decisionRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/pulse', pulseRoutes);
app.use('/api/telemetry', telemetryRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
