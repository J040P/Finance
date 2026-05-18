import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

export async function GET(req: Request) {
  const token = getTokenFromHeader(req);
  if (!token) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });

  const row = db
    .prepare('SELECT data FROM user_data WHERE user_id = ?')
    .get(payload.userId) as { data: string } | undefined;

  if (!row) return NextResponse.json({ error: 'Dados não encontrados.' }, { status: 404 });

  return NextResponse.json(JSON.parse(row.data));
}

export async function PUT(req: Request) {
  const token = getTokenFromHeader(req);
  if (!token) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });

  try {
    const data = await req.json();

    db.prepare(`
      INSERT INTO user_data (user_id, data, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
    `).run(payload.userId, JSON.stringify(data));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Save data error:', err);
    return NextResponse.json({ error: 'Erro ao salvar.' }, { status: 500 });
  }
}
