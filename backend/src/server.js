import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/database.js';
const port = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Khutwa Backend Server Running on port ${port}`);
  });
};

startServer().catch(error => {
  console.error(`Server startup error: ${error.message}`);
  process.exit(1);
});
