// src/lib/auth.ts

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client"; // ✅ Importer l'enum Role

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "fallback-secret-change-me-in-production",
  
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  
  providers: [
    CredentialsProvider({
      name: "Identifiants",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        
        if (!user || !user.active) return null;
        
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role, // ✅ Déjà un enum Role
          image: user.avatarUrl,
        };
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // ✅ Correction : typer correctement
        session.user.role = token.role as Role;  // ✅ Utiliser Role au lieu de string
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
      }
      return session;
    },
  },
  
  debug: process.env.NODE_ENV === "development",
};