import { Request, Response, NextFunction } from 'express';

export function verifyOU(allowedOUs: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientOU = req.headers['x-client-ou'] as string;

    if (!clientOU || !allowedOUs.includes(clientOU)) {
      res.status(403).json({ message: 'Access denied: Invalid OU in client certificate.' });
      return;
    }

    next();
  };
}
