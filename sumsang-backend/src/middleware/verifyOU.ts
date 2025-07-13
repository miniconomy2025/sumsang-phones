import { Request, Response, NextFunction } from 'express';

export function verifyOU(expectedOU: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientOU = req.headers['x-client-ou'] as string;

    if (!clientOU || clientOU !== expectedOU) {
      res.status(403).json({ message: 'Access denied: Invalid OU in client certificate.' });
      return;
    }

    next();
  };
}
