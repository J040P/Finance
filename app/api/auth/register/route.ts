import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { signToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Preencha todos os campos.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = db
      .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
      .run(email.toLowerCase().trim(), passwordHash);

    const userId = result.lastInsertRowid as number;

    // Salva dados iniciais com o nome
    const initialData = {
      user: {
        name: name.trim(),
        age: 0,
        financialProfile: 'moderado',
        objectives: [],
        setupComplete: false,
      },
      incomes: [],
      expenses: [],
      investments: [],
      goals: [],
      currentMonth: new Date().toISOString().slice(0, 7),
    };

    db.prepare('INSERT INTO user_data (user_id, data) VALUES (?, ?)').run(
      userId,
      JSON.stringify(initialData)
    );

    const token = signToken(userId);
    return NextResponse.json({ token, name: name.trim() });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 });
  }
}
