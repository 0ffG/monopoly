// app/api/create-lobby/route.ts
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 6 haneli, kolay okunur bir ID üretelim.
    const lobbyId = nanoid(6).toUpperCase();
    return NextResponse.json({ lobbyId });
  } catch (error) {
    return NextResponse.json({ error: 'Lobi oluşturulamadı.' }, { status: 500 });
  }
}