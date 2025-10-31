import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { startServer } from './src/config/db.ts';
import route from './src/routes/deliveryRoute.ts';
import locationRoutes from './src/routes/locationRoute.ts';
import pickupRoutes from './src/routes/pickupRoute.ts';
import agentRoutes from './src/routes/agentRoute.ts';
import authRoutes from './src/routes/authRoute.ts';
import uploadRoutes from './src/routes/uploadRoute.ts';
import adminRoutes from './src/routes/adminRoutes';

import cron from 'node-cron';
import https from 'https';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// For ES modules - get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware setup
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Swagger setup BEFORE other routes
try {
  const swaggerPath = path.join(__dirname, 'src', 'swagger', 'swagger.yaml');
  console.log('Looking for swagger file at:', swaggerPath);

  const swaggerDocument = YAML.load(swaggerPath);

  const swaggerOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Pick N Get API Documentation',
  };

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

  console.log('✓ Swagger documentation loaded successfully');
} catch (error) {
  console.error('✗ Error setting up Swagger:', error);
}

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to Pick N Get API',
    documentation: `http://localhost:${PORT}/api-docs`,
  });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.use('/api/v1', route);
app.use('/api/v1/pickups', pickupRoutes);
app.use('/api/v1/location', locationRoutes);
app.use('/api/v1/agents', agentRoutes);
app.use('/api/v1/upload', uploadRoutes); // Upload routes for Hedera File Service
app.use('/api/v1/auth', authRoutes); //auth routes
app.use('/api/v1/admin', adminRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
});

startServer().catch((err) => console.log(err));

function keepAlive(url: string) {
  https
    .get(url, (res) => {
      console.log(`Status: ${res.statusCode}`);
    })
    .on('error', (error) => {
      console.error(`Error: ${error.message}`);
    });
}

cron.schedule('*/14 * * * *', () => {
  keepAlive('https://pick-n-get-be.onrender.com');
  console.log('Pinged the server every 14 minutes');
});
