import NextAuth from "next-auth";
import { edgeAuthConfig } from "~/server/auth/edge-config";

const { auth } = NextAuth(edgeAuthConfig);

export default auth((req) => {
  if (!req.auth) {
    const signInUrl = new URL("/api/auth/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return Response.redirect(signInUrl);
  }
});

/**
 * Routes listed here are protected — unauthenticated users are redirected
 * to sign-in. Add new protected route prefixes here as the app grows.
 */
export const config = {
  matcher: ["/organization/:path*"],
};
