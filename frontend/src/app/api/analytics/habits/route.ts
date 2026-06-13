import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getHabitAnalytics, handleError } from '@flowstate/backend';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    const data = await getHabitAnalytics(session.user.id, days);
    return NextResponse.json(data);
  } catch (error: any) {
    const { message, statusCode } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
