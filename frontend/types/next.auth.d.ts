import { DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface ExtendedToken extends JWT {
    id?: string;
    role?: "user" | "admin";
  }

  interface Session {
    user: {
      id: string;
      role: "user" | "admin";
      name?: string;
      email?: string;
      image?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "user" | "admin";
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}
