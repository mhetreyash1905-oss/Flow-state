import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  getUserJournalEntries,
  createJournalEntry,
  createJournalEntrySchema,
  handleError,
  ValidationError,
} from '@flowstate/backend';
import { z } from 'zod';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await getUserJournalEntries(session.user.id, page, limit);
    return NextResponse.json(result);
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
    const parsedData = createJournalEntrySchema.parse(body);

    const entry = await createJournalEntry(session.user.id, parsedData);
    return NextResponse.json({ entry }, { status: 201 });
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
