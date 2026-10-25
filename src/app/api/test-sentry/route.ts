import { NextResponse } from "next/server";

export async function GET() {
  // This error will be automatically captured by Sentry
  throw new Error("Sentry Test Error: This is a test from the Lumière server!");
  
  // This line will never be reached, but Next.js requires a return
  return NextResponse.json({ success: true });
}