import type { Response } from 'express';
import { jest } from '@jest/globals';

export const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};

  // 👇 Explicitly cast to the correct Express method types
  res.status = jest.fn().mockReturnThis() as unknown as Response['status'];
  res.json = jest.fn().mockReturnThis() as unknown as Response['json'];
  res.send = jest.fn().mockReturnThis() as unknown as Response['send'];

  return res;
};
