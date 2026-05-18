import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'financia-local-dev-secret-2024';

export function signToken(userId: number): string {
  return jwt.sign({ userId }, SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, SECRET) as { userId: number };
  } catch {
    return null;
  }
}

export function getTokenFromHeader(req: Request): string | null {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7);
}
