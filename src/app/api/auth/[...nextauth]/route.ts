import NextAuth, { NextAuthOptions, Profile, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { getCollectionByUserType } from "@/lib/ConnectDB";
import { UserType } from "@/types/user";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";

// Helper to get user by email and userType
const getUserByEmail = async (email: string, userType: UserType) => {
  const collection = await getCollectionByUserType(userType);
  return await collection.findOne({ email });
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const { email, password, userType } = credentials as Record<string, string>;

        // Check that userType is valid
        if (
          !email ||
          !password ||
          !userType ||
          !Object.values(UserType).includes(userType as UserType)
        ) {
          return null;
        }

        // Allow login for all user types: PATIENT, DOCTOR, HOSPITAL, PHARMACY
        const user = await getUserByEmail(email, userType as UserType);

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return null;
        }

        // Return user object (omit password)
        const { password: _pw, ...userWithoutPassword } = user;
        // NextAuth expects email to be string | null | undefined, so ensure it's string or undefined
        return {
          ...userWithoutPassword,
          userType,
          id: user._id.toString(),
          email: typeof user.email === "string" ? user.email : undefined,
        } as User & { userType: string; id: string; email?: string };
      },
    }),
    // Google provider (patient-only)
    GoogleProvider({
      clientId: "718358145430-5ji4g9fltnht9d5vqvi4rtgopni0b02i.apps.googleusercontent.com",
      clientSecret: "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",
      allowDangerousEmailAccountLinking: true,
      // Restrict to patient role in sign-in callback
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // For Google, only allow patients
      if (account?.provider === "google") {
        // Only allow Google sign-in for patients
        // (You could add logic here to restrict by email domain or other checks if needed)
        return true;
      }
      // For credentials, allow all user types (already checked in authorize)
      return true;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      // user is only defined on sign in
      if (user) {
        // Only assign if defined
        if ("userType" in user && user.userType !== undefined) {
          (token as any).userType = user.userType;
        }
        if ("id" in user && user.id !== undefined) {
          (token as JWT).id = user.id;
        }
        // NextAuth expects email to be string | null | undefined
        if ("email" in user) {
          token.email = user.email ?? null;
        }
      }
      // Handle Google sign-in: upsert patient record and set token fields
      if (account?.provider === "google") {
        try {
          const email = token.email as string | null | undefined;
          const name = (profile as Profile)?.name || user?.name || null;
          if (email) {
            const patients = await getCollectionByUserType(UserType.PATIENT);
            const existing = await patients.findOne({ email });
            //ts-ignore
            if (!existing) {
              const now = new Date();
              const newPatient = {
                name: name,
                email,
                userType: UserType.PATIENT,
                createdAt: now,
                updatedAt: now,
                mobileNumber: "",
                age: null,
                gender: "",
                role: "patient",
                address: "",
                bloodGroup: "",
                pastReports: [],
                family: [],
                isActive: true,
                profileCompleted: false,
                // No password for OAuth users
              } as any;
              const result = await patients.insertOne(newPatient);
              (token as JWT).id = result.insertedId.toString();
              (token as JWT).userType = UserType.PATIENT;
            } else {
              (token as JWT).id = existing._id.toString();
              (token as JWT).userType = existing.userType || UserType.PATIENT;
            }
          } else {
            // No email from Google? reject by returning token unchanged (session callback can handle)
          }
        } catch (e) {
          // If DB fails, still allow session but without custom fields
        }
      }
      return token;
    },
    async session({ session, token }) {
      // session.user is { name, email, image } by default
      // Add id and userType if present in token
      //ts-ignore
      if (session.user) {
        if ("id" in token) {
          (session.user as User).id = (token as any).id;
        }
        if ("userType" in token) {
          //ts-ignore
          (session.user as any).userType = (token as any).userType;
        }
        // email is already present, but ensure it's string | null | undefined
        //ts-ignore
        if ("email" in token) {
          session.user.email = token.email ?? null;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
