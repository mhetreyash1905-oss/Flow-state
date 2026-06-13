import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.level = user.level;
        token.xp = user.xp;
        token.title = user.title;
      }
      if (trigger === 'update' && session) {
        if (session.level !== undefined) token.level = session.level;
        if (session.xp !== undefined) token.xp = session.xp;
        if (session.title !== undefined) token.title = session.title;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.level = token.level as number;
        session.user.xp = token.xp as number;
        session.user.title = token.title as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
