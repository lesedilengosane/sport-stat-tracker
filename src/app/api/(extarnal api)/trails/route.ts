import { NextResponse } from "next/server";

const BASE_URL = "https://orion-api-qeyv.onrender.com/api/trails";

export async function GET(request: Request) {
  try {
    // Parse URL query parameters
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const difficulty = searchParams.get("difficulty") || "";
    const status = searchParams.get("status") || "";
    const tags = searchParams.get("tags") || "";

    // Build the external API URL with query params
    const query = new URLSearchParams({
      page,
      limit,
    });

    if (difficulty) query.append("difficulty", difficulty);
    if (status) query.append("status", status);
    if (tags) query.append("tags", tags);

    const apiUrl = `${BASE_URL}?${query.toString()}`;

    // Fetch data from external Orion API
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Revalidate cache every 30 minutes (optional optimization)
      next: { revalidate: 1800 },
    });

    // Handle response
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`External API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    return NextResponse.json(
      {
        success: true,
        trails: data.data || [],
        pagination: data.pagination || {},
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error fetching trails:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch trails",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
