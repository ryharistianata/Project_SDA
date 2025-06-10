import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const cookie = await cookies();
  const token = cookie.get("Session");
  const path = request.nextUrl.pathname;

  if (token) {
    const session = await (
      await fetch(
        `${process.env.NEXT_PUBLIC_UPSTASH_URI}/get/Session:${token.value}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_UPSTASH_REDIS}`,
          },
        }
      )
    ).json();
    if (!session.result) {
      cookie.delete("Session");
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (path.startsWith("/login") || path.startsWith("/register")) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } else {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/dashboard", "/register", "/login", "/api/:path*", "/data-peserta"],
};
