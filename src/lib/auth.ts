// src/lib/auth.ts

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  // ✅ AJOUTER LE SECRET
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "JmiI22srV/12Vrdf6dVxZ+u4iHyVicvir9Ab0pqc8c8=",
  
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
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Credentials manquants");
          return null;
        }
        
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          
          if (!user) {
            console.log(`❌ Utilisateur non trouvé: ${credentials.email}`);
            return null;
          }
          
          if (!user.active) {
            console.log(`❌ Compte désactivé: ${credentials.email}`);
            return null;
          }
          
          const valid = await bcrypt.compare(credentials.password, user.password);
          if (!valid) {
            console.log(`❌ Mot de passe incorrect: ${credentials.email}`);
            return null;
          }
          
          console.log(`✅ Authentification réussie: ${credentials.email}`);
          
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.avatarUrl,
          };
        } catch (error) {
          console.error("❌ Erreur d'authentification:", error);
          return null;
        }
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
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
      }
      return session;
    },
  },
  
  // ✅ AJOUTER LE DEBUG POUR LE TEST
  debug: process.env.NODE_ENV === "development",
};