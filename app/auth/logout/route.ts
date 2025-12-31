import { NextResponse } from 'next/server';
import { logoutAction } from './actions';

export async function POST() {
  // API route for logout
  // In a real app, this would clear cookies/sessions
  await logoutAction();
  return NextResponse.json({ success: true });
}

