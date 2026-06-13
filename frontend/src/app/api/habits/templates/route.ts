import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  getHabitTemplates,
  createHabitFromTemplate,
  handleError,
} from '@flowstate/backend';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;

    const templates = await getHabitTemplates(category);
    return NextResponse.json({ templates });
  } catch (error: any) {
    const { message, statusCode } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { templateId } = body;

    if (!templateId) {
      return NextResponse.json({ error: 'templateId is required' }, { status: 400 });
    }

    const habit = await createHabitFromTemplate(session.user.id, templateId);
    return NextResponse.json({ habit }, { status: 201 });
  } catch (error: any) {
    const { message, statusCode } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
