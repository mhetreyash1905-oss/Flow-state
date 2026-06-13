import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      level: number;
      xp: number;
      title: string;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    username?: string;
    level?: number;
    xp?: number;
    title?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    username?: string;
    level?: number;
    xp?: number;
    title?: string;
  }
}
