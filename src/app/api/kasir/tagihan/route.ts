import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({ message: "Deprecated. Billing is now handled by Apoteker." });
}
