import { api } from '../api/client';
import type { CarModel, GetOptionalsResponse } from '../types';

export async function getModels(): Promise<CarModel[]> {
  const res = await api.get<CarModel[]>('/models');
  return res.data;
}

export async function getOptionals(): Promise<GetOptionalsResponse> {
  const res = await api.get<GetOptionalsResponse>('/optionals');
  return res.data;
}

export default { getModels, getOptionals };
