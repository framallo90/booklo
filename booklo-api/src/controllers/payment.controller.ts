import { Response } from 'express';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as CartModel from '../models/cart.model';
import * as OrderModel from '../models/order.model';
import pool from '../config/database';

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

export const createPreference = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const cartItems = await CartModel.findByUser(userId);
    if (cartItems.length === 0) {
      res.status(400).json({ message: 'El carrito está vacío' }); return;
    }

    const orderId = await OrderModel.create(userId, cartItems, 'mercadopago');

    const preference = new Preference(mp);
    const result = await preference.create({
      body: {
        items: cartItems.map(item => ({
          id:         String(item.book_id),
          title:      item.title,
          quantity:   item.quantity,
          unit_price: Number(item.price),
          currency_id: 'ARS',
        })),
        back_urls: {
          success: `${FRONTEND_URL}/payment/success`,
          failure: `${FRONTEND_URL}/payment/failure`,
          pending: `${FRONTEND_URL}/payment/success`,
        },
        auto_return: 'approved',
        payment_methods: {
          installments: 12,
          default_installments: 1,
        },
        external_reference: String(orderId),
        statement_descriptor: 'BOOKLO',
      },
    });

    res.json({ orderId, init_point: result.init_point });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la preferencia de pago' });
  }
};

export const webhook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, data } = req.body;
    if (type !== 'payment' || !data?.id) { res.sendStatus(200); return; }

    const payment = new Payment(mp);
    const paymentData = await payment.get({ id: data.id });

    const orderId = Number(paymentData.external_reference);
    if (!orderId) { res.sendStatus(200); return; }

    if (paymentData.status === 'approved') {
      await OrderModel.updateStatus(orderId, 'confirmado');
    }

    res.sendStatus(200);
  } catch {
    res.sendStatus(200);
  }
};

export const confirmByRedirect = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orderId = Number(req.params.orderId);
    const userId  = req.user!.id;

    const [rows]: any = await pool.query(
      'SELECT id FROM orders WHERE id = ? AND user_id = ? AND status = ?',
      [orderId, userId, 'pendiente']
    );
    if (rows.length > 0) {
      await OrderModel.updateStatus(orderId, 'confirmado');
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ message: 'Error al confirmar el pedido' });
  }
};
