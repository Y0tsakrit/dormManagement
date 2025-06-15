import app from './src/app';
import { PrismaClient } from './generated/prisma';
import dotenv from 'dotenv';

const prisma = new PrismaClient();

dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

async function startServer() {
  try {
    await connectDatabase();
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`URL: http://localhost:${PORT}`);
      
      if (NODE_ENV === 'development') {
        console.log(`Health check: http://localhost:${PORT}/health`);
      }
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal:any) => {
      console.log(`Received ${signal}. Starting graceful shutdown...`);
      
      // Stop accepting new requests
      server.close(async () => {
        console.log('HTTP server closed');

        try {
          await prisma.$disconnect();
          console.log('Database connection closed');
          
          console.log('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      setTimeout(() => {
        console.log('Forcing shutdown...');
        process.exit(1);
      }, 10000); 
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();