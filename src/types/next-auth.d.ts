import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "employee";
    } & DefaultSession["user"];
  }

  interface JWT {
    role: "admin" | "employee";
  }
}
