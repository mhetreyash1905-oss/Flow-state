import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isAuthPage = nextUrl.pathname === '/login' || nextUrl.pathname === '/register';
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const isPublicProfile = nextUrl.pathname.startsWith('/profile/');
  const isHome = nextUrl.pathname === '/';

  const isPublicRoute = isAuthPage || isApiAuthRoute || isPublicProfile || isHome;

  if (isApiAuthRoute) {
    return;
  }

  if (isAuthPage) {
    if (isLoggedIn) {
      return Response.redirect(new URL('/dashboard', nextUrl));
    }
    return;
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL('/login', nextUrl));
  }

  return;
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
