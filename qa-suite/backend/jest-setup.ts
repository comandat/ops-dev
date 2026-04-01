import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });
// Override DATABASE_URL for all E2E tests, regardless of .env or imports 
process.env.DATABASE_URL = "file:C:/Users/titam/Documents/Zebra Printer Test/OpenSales/backend/prisma/test.db";
