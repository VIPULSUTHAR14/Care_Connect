import { UserType } from "./user";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      id?: string;
      userType?: UserType;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    userType?: UserType;
  }
}


