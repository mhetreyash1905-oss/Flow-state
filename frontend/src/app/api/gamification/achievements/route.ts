import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserAchievements, handleError } from '@flowstate/backend';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const achievements = await getUserAchievements(session.user.id);
    return NextResponse.json({ achievements });
  } catch (error: any) {
    const { message, statusCode } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
