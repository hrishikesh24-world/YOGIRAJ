import { withAuth } from "next-auth/middleware";

export default withAuth({
  secret: process.env.NEXTAUTH_SECRET || "yogiraj_default_secret_key_2026_safe_fallback",
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico|manifest.json|icon-.*\\.png).*)"],
};
