import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import categoryRoutes from './routes/category.routes';
import authRoutes from './routes/auth.routes';
import bookRoutes from './routes/book.routes';
import externalBookRoutes from './routes/external-book.routes';
import favoriteRoutes from './routes/favorite.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import dashboardRoutes from './routes/dashboard.routes';
import homeRoutes from './routes/home.routes';
import adminRoutes from './routes/admin.routes';





dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', project: 'booklo-api' });
});

app.use('/categories', categoryRoutes);
app.use('/auth', authRoutes);
app.use('/books', bookRoutes);
app.use('/external-books', externalBookRoutes);
app.use('/favorites', favoriteRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/home', homeRoutes);
app.use('/admin', adminRoutes);




export default app;
