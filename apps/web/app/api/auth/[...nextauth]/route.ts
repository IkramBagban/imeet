import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { importJWK, JWTPayload, SignJWT } from "jose";
import bcrypt from "bcrypt";
import { prismaClient } from "db/client";

const generateJWT = async (payload: JWTPayload) => {
  const secret = process.env.JWT_SECRET || "mysecret";

  const jwk = await importJWK({ k: secret, alg: "HS256", kty: "oct" });

  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(jwk);

  return jwt;
};

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentails",
      credentials: {
        uid: { label: "UID", type: "text", disabled: true },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
      },
      authorize: async (credentials): Promise<any> => {
        console.log("authorize credentails", credentials);
        try {
          const existingUser = await prismaClient.user.findFirst({
            where: {
              uid: credentials?.uid,
            },
            select: {
              password: true,
              name: true,
              id: true,
            },
          });

          console.log("existing user", existingUser);

          if (!existingUser) return null;
          // NextResponse.json(
          //     { message: "No account find with this uid" },
          //     { status: 404 }
          //   );

          console.log("after existng user check");
          console.log("Cpassword", credentials?.password);
          console.log("Epassword", existingUser?.password);
          const isValidPassword = await bcrypt.compare(
            credentials?.password,
            existingUser.password
          );

          console.log("isvalid passowrd", isValidPassword);
          if (!isValidPassword) {
            return null;
            //   NextResponse.json(
            //     { message: "Wrong Password" },
            //     { status: 401 }
            //   );
          }

          const jwt = await generateJWT({
            id: existingUser.id,
            uid: credentials?.uid,
          });
          console.log("succesfully login", jwt);

          return {
            id: existingUser.id,
            name: existingUser?.name,
            uid: credentials?.uid,
            token: jwt,
          };
        } catch (e) {
          console.log("error in nextauth", e);
          return null;
        }
      },
    }),
  ],
  pages: { signIn: "/auth" },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
