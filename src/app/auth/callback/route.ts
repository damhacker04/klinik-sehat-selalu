import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const next = searchParams.get("next") || "/";

    const supabase = await createClient();

    // Handle PKCE code exchange (newer Supabase flow)
    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            return NextResponse.redirect(new URL(next, origin));
        }
    }

    // Handle token_hash exchange (email link flow)
    if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
        });
        if (!error) {
            // For recovery, redirect to confirm page
            if (type === "recovery") {
                return NextResponse.redirect(new URL("/reset-password/confirm", origin));
            }
            return NextResponse.redirect(new URL(next, origin));
        }
    }

    // If we get here, something went wrong
    return NextResponse.redirect(
        new URL(`/reset-password?error_description=invalid_link`, origin)
    );
}
