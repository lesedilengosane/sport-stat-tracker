import {createUser} from "./addUser"

export async function POST(request) {
  try {
    const body = await request.json();
    const { auth_user_id, first_name, last_name, role } = body;

    if (!first_name || !last_name || !role) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const newUser = await createUser({
      auth_user_id,
      first_name,
      last_name,
      role,
    });

    return new Response(JSON.stringify(newUser), { status: 201 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to create user",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}