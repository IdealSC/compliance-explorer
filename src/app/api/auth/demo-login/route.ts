/**
 * Demo Login API — Sets the demo session cookie.
 *
 * POST /api/auth/demo-login
 * Body: { email: string }
 *
 * Demo-only. Not production authentication.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getDemoUserByEmail, DEMO_USERS } from '@/auth/demo-users';
import { DEMO_SESSION_COOKIE } from '@/auth/session';

export async function POST(req: NextRequest) {
  const isDemoAuth = process.env.DEMO_AUTH_ENABLED !== 'false';
  if (!isDemoAuth) {
    return NextResponse.json({ error: 'Demo auth is disabled' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const email = body?.email;

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  const user = getDemoUserByEmail(email);
  if (!user) {
    return NextResponse.json(
      { error: 'Unknown demo user', available: DEMO_USERS.map((u) => u.email) },
      { status: 404 }
    );
  }

  const response = NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, roles: user.roles },
  });

  response.cookies.set(DEMO_SESSION_COOKIE, user.email, {
    path: '/',
    httpOnly: false, // Client-readable for demo role switcher
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Demo session cleared' });
  response.cookies.delete(DEMO_SESSION_COOKIE);
  return response;
}
