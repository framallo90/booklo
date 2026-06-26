import { Request, Response } from 'express';
import * as HomeModel from '../models/home.model';

export const featured = async (_req: Request, res: Response) => {
  const data = await HomeModel.getFeatured();
  res.json(data);
};

export const novedades = async (_req: Request, res: Response) => {
  const data = await HomeModel.getNovedades();
  res.json(data);
};

export const topVentas = async (_req: Request, res: Response) => {
  const data = await HomeModel.getTopVentas();
  res.json(data);
};
