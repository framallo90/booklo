import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as OrderModel from '../models/order.model';
import * as CartModel from '../models/cart.model';

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { payment_method, notes } = req.body;

    const cartItems = await CartModel.findByUser(userId);
    if (cartItems.length === 0) {
      res.status(400).json({ message: 'El carrito está vacío' }); return;
    }

    const orderId = await OrderModel.create(userId, cartItems, payment_method, notes);
    res.status(201).json({ id: orderId, message: 'Pedido creado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el pedido' });
  }
};

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user!.role_id === 1;
    if (isAdmin) {
      const status = req.query.status as string | undefined;
      const orders = await OrderModel.findAll(status);
      res.json(orders);
    } else {
      const orders = await OrderModel.findByUser(req.user!.id);
      res.json(orders);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los pedidos' });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user!.role_id === 1;
    const orderId = Number(req.params.id);
    const order = isAdmin
      ? await OrderModel.findByIdAdmin(orderId)
      : await OrderModel.findById(orderId, req.user!.id);
    if (!order) { res.status(404).json({ message: 'Pedido no encontrado' }); return; }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el pedido' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const validStatuses = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: 'Estado inválido' }); return;
    }
    await OrderModel.updateStatus(Number(req.params.id), status);
    res.json({ message: 'Estado actualizado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el estado' });
  }
};