import prisma from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";

export async function GET(request: NextRequest) {
  noStore();
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(users);
}
