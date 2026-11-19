import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { connectDB } from './config/database.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import companyAuthRoutes from './routes/companyAuthRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import testRoutes from './routes/testRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Khutwa Backend Server Running' });
});

app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/company', companyAuthRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

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
