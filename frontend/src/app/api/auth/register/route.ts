import { NextResponse } from 'next/server';
import { registerUser, registerSchema, handleError, ValidationError } from '@flowstate/backend';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsedData = registerSchema.parse(body);
    const user = await registerUser(parsedData);
    return NextResponse.json({ user }, { status: 201 });
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
