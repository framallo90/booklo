import { Request, Response } from 'express';
import * as CategoryModel from '../models/category.model';

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  const categories = await CategoryModel.findAll();
  res.json(categories);
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  const category = await CategoryModel.findById(Number(req.params.id));
  if (!category) {
    res.status(404).json({ message: 'Categoría no encontrada' });
    return;
  }
  res.json(category);
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ message: 'El nombre es requerido' });
    return;
  }
  try {
    const id = await CategoryModel.create(name);
    res.status(201).json({ id, name });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: 'Ya existe una categoría con ese nombre' });
      return;
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ message: 'El nombre es requerido' });
    return;
  }
  try {
    const updated = await CategoryModel.update(Number(req.params.id), name);
    if (!updated) {
      res.status(404).json({ message: 'Categoría no encontrada' });
      return;
    }
    res.json({ message: 'Categoría actualizada' });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: 'Ya existe una categoría con ese nombre' });
      return;
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deactivate = async (req: Request, res: Response): Promise<void> => {
  const deactivated = await CategoryModel.deactivate(Number(req.params.id));
  if (!deactivated) {
    res.status(404).json({ message: 'Categoría no encontrada' });
    return;
  }
  res.json({ message: 'Categoría desactivada' });
};