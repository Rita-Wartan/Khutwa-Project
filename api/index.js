import 'dotenv/config';
import app from '../backend/src/app.js';
import { connectDB } from '../backend/src/config/database.js';

let databaseConnection;

export default async function handler(req, res) {
  databaseConnection ??= connectDB();
  await databaseConnection;
  return app(req, res);
}
