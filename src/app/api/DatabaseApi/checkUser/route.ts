// app/api/DatabaseApi/checkUser/route.ts
import { NextResponse } from 'next/server';
import { checkUser } from './checkUser'; // <- your checkUser function

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { auth_user_id } = body as { auth_user_id: string };

    if (!auth_user_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { exists, error } = await checkUser(auth_user_id);

    if (error) {
      return NextResponse.json(
        { error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { exists }, // ✅ always return exists = true/false
      { status: 200 }
    );

  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development"
          ? error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : "Unknown error"
          : undefined,
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
