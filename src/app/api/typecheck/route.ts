import { NextRequest, NextResponse } from "next/server";
import { typeCheck } from "@/lib/typecheck";
import { z } from "zod";

const requestSchema = z.object({
  code: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = requestSchema.parse(body);

    const result = typeCheck(code);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Type check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
