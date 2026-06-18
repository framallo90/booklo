import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import categoryRoutes from './routes/category.routes';
import authRoutes from './routes/auth.routes';
import bookRoutes from './routes/book.routes';
import externalBookRoutes from './routes/external-book.routes';


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', project: 'booklo-api' });
});

app.use('/categories', categoryRoutes);
app.use('/auth', authRoutes);
app.use('/books', bookRoutes);
app.use('/external-books', externalBookRoutes);


export default app;
