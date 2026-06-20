import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as UserModel from '../models/user.model';
import { AuthRequest } from '../middlewares/auth.middleware';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Nombre, email y contraseña son requeridos' });
      return;
    }

    const existing = await UserModel.findByEmail(email);
    if (existing) {
      res.status(409).json({ message: 'Ya existe una cuenta con ese email' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = await UserModel.create(name, email, hashedPassword, 2);

    res.status(201).json({ id, name, email });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email y contraseña son requeridos' });
      return;
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    const options: jwt.SignOptions = { expiresIn: 86400 };
    const token = jwt.sign(
      { id: user.id, email: user.email, role_id: user.role_id },
      process.env.JWT_SECRET as string,
      options
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role_id: user.role_id }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await UserModel.findById(req.user!.id);
    if (!user) { res.status(404).json({ message: 'Usuario no encontrado' }); return; }
    const { password, ...profile } = user;
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el perfil' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      res.status(400).json({ message: 'Nombre y email son requeridos' }); return;
    }
    const existing = await UserModel.findByEmail(email);
    if (existing && existing.id !== req.user!.id) {
      res.status(409).json({ message: 'Ese email ya está en uso' }); return;
    }
    await UserModel.updateProfile(req.user!.id, name, email);
    res.json({ message: 'Perfil actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el perfil' });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Contraseña actual y nueva son requeridas' }); return;
    }
    const user = await UserModel.findById(req.user!.id);
    if (!user) { res.status(404).json({ message: 'Usuario no encontrado' }); return; }
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      res.status(401).json({ message: 'La contraseña actual es incorrecta' }); return;
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await UserModel.updatePassword(req.user!.id, hashed);
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la contraseña' });
  }
};