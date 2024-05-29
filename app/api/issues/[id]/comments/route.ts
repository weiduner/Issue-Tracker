import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import { deleteCommentSchema, commentSchema } from "@/app/validationSchemas";

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
  await prisma.issue.update({
    where: { id: issue.id },
    data: { commentIds: [...issue.commentIds, newComment.id] },
  });
  return NextResponse.json(newComment, { status: 201 });
}

export async function DELETE(
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
  const validation = deleteCommentSchema.safeParse(body);
  if (!validation.success)
    return NextResponse.json(validation.error.format(), { status: 400 });
  const issue = await prisma.issue.findUnique({
    where: { id: params.id },
  });
  if (!issue)
    return NextResponse.json({ error: "Invalid Issue" }, { status: 404 });

  const comment = await prisma.comment.findUnique({
    where: { id: body.commentId },
  });
  if (!comment)
    return NextResponse.json({ error: "Invalid Comment" }, { status: 404 });
  if (!issue.commentIds.includes(comment.id))
    return NextResponse.json(
      { error: "Comment Not Found in Issue" },
      { status: 404 }
    );
  await prisma.comment.delete({
    where: {
      id: comment.id,
    },
  });
  const commentSet = new Set(issue.commentIds);
  commentSet.delete(comment.id);
  await prisma.issue.update({
    where: { id: issue.id },
    data: { commentIds: Array.from(commentSet) },
  });
  return NextResponse.json({});
}
