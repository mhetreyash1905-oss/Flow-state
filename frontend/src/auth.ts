import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { loginUser } from '@flowstate/backend';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await loginUser({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          if (user) {
            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              username: user.username,
              level: user.level,
              xp: user.xp,
              title: user.title,
            };
          }
        } catch (error) {
          console.error('NextAuth authorize error:', error);
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
});
