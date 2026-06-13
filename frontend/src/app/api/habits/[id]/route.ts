import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  getHabitById,
  updateHabit,
  deleteHabit,
  updateHabitSchema,
  handleError,
  ValidationError,
} from '@flowstate/backend';
import { z } from 'zod';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const habit = await getHabitById(session.user.id, id);
    return NextResponse.json({ habit });
  } catch (error: any) {
    const { message, statusCode } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsedData = updateHabitSchema.parse(body);

    const habit = await updateHabit(session.user.id, id, parsedData);
    return NextResponse.json({ habit });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const formattedErrors: Record<string, string[]> = {};
      error.issues.forEach((err: any) => {
        const field = err.path.join('.');
        if (!formattedErrors[field]) formattedErrors[field] = [];
        formattedErrors[field].push(err.message);
      });
      const validationErr = new ValidationError(formattedErrors);
      const { message, statusCode, errors } = handleError(validationErr);
      return NextResponse.json({ error: message, errors }, { status: statusCode });
    }
    const { message, statusCode } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const habit = await deleteHabit(session.user.id, id);
    return NextResponse.json({ habit, message: 'Habit archived successfully' });
  } catch (error: any) {
    const { message, statusCode } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
