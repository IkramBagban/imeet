import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prismaClient } from "db/client";

export const POST = async (req: NextRequest) => {
  try {
    const { uid, password, name } = await req.json();
    console.log("body", { uid, password, name });

    if (!uid) {
      return NextResponse.json({ message: "UID is Required" }, { status: 400 });
    }
    if (!password || !name) {
      return NextResponse.json(
        { message: "Name & Password are Required" },
        { status: 400 }
      );
    }

    // Hash the password
    const salt = 10;
    console.log("BEFORE HASHED PASSWORD");
    const hashedPassword: string = await bcrypt.hash(password, salt);

    console.log("BEFORE PRISMA");
    const user = await prismaClient.user.create({
      data: {
        uid,
        password: hashedPassword,
        name,
        email: `ikram${Math.random()}@gmail.com`,
      },
    });
    console.log("AFTER PRISMA");

    return NextResponse.json(
      {
        message: "User created successfully",
        data: user,
      },
      { status: 201 }
    );
  } catch (e) {
    const errorMessage =
      e instanceof Error ? e.message : "Unknown error occurred";
    console.error("Error creating user:", errorMessage);

    return NextResponse.json(
      { message: "Internal server error.", error: errorMessage },
      { status: 500 }
    );
  }
};
