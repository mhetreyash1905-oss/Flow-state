import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  completeHabit,
  completeHabitSchema,
  handleError,
  ValidationError,
} from '@flowstate/backend';
import { z } from 'zod';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const parsedData = completeHabitSchema.parse(body);

    const result = await completeHabit(
      session.user.id,
      id,
      parsedData.note,
      parsedData.completedAt
    );

    return NextResponse.json(result);
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
