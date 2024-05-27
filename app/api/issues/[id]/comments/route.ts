import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import { commentSchema } from "@/app/validationSchemas";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({}, { status: 401 });

  const email = session.user?.email ?? "";
  const user = await prisma.user.findUnique({
    where: { email: email },
  });
  if (!user) return NextResponse.json("User required", { status: 401 });

  const body = await request.json();
  const validation = commentSchema.safeParse(body);
  if (!validation.success)
    return NextResponse.json(validation.error.format(), { status: 400 });
  const issue = await prisma.issue.findUnique({
    where: { id: params.id },
  });
  if (!issue)
    return NextResponse.json({ error: "Invalid Issue" }, { status: 404 });
  const newComment = await prisma.comment.create({
    data: {
      detail: body.detail,
      issueId: issue.id,
      createdByUserId: user.id,
    },
  });
  return NextResponse.json(newComment, { status: 201 });
}
