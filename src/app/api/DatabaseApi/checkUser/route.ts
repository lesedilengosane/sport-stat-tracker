// app/api/DatabaseApi/checkUser/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkUser } from './checkUser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { auth_user_id } = body as { auth_user_id: string };

    if (!auth_user_id) {
      return NextResponse.json(
        { error: "Missing required field: auth_user_id" },
        { status: 400 }
      );
    }

    const result = await checkUser(auth_user_id, 'auth_user_id');

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        exists: result.exists, 
        role: result.role, 
        first_name: result.first_name,
        user_id:result.user_id,
        last_name: result.last_name,
        auth_user_id:result.auth_user_id,
        hasTeam : result.hasTeam
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Error in POST /api/DatabaseApi/checkUser:', error);
    
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

// Export other HTTP methods if needed, or return 405 for unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST instead." },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST instead." },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST instead." },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST instead." },
    { status: 405 }
  );
}

export const dynamic = "force-dynamic";