import { NextResponse } from 'next/server';
import { addUser, type UserData, type UserRole } from './addUser';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { auth_user_id, first_name, last_name, role } = body as {
      auth_user_id: string;
      first_name: string;
      last_name: string;
      role: UserRole;
    };

    // Validate required fields
    if (!auth_user_id || !first_name || !last_name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Attempt to add user
    const result = await addUser({
      auth_user_id,
      first_name,
      last_name,
      role,
    } satisfies UserData);

    // Handle `addUser` response
    if (result.userExists) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 } // HTTP 409 Conflict
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to create user (database error)" },
        { status: 500 }
      );
    }

    // Success
    return NextResponse.json(
      { user: result.data, message: "User created successfully" },
      { status: 201 }
    );

  } catch (error: unknown) {
    return NextResponse.json(
      {
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' 
        ? error instanceof Error 
          ? error.message 
          : typeof error === 'string'
            ? error
            : 'Unknown error'
        : undefined,
    },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; // Disable caching