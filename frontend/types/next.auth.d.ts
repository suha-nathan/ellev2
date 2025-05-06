import { DefaultSession } from "next-auth";

declare module "next-auth" {
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
