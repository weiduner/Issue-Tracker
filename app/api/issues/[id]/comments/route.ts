import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import {
  deleteCommentSchema,
  commentSchema,
} from "@/app/lib/validationSchemas";
import {
  validateIssueById,
  validateSchema,
  validateSession,
  validateUserBySession,
} from "@/app/lib/validationUtils";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validation Session
  const session = await validateSession();
  if (session instanceof NextResponse) return session;

  // Validation  User
  const user = await validateUserBySession(session);
  if (user instanceof NextResponse) return user;

  // Validation Request Body
  const body = await validateSchema({
    schema: commentSchema,
    body: await request.json(),
  });
  if (body instanceof NextResponse) return body;

  // Validate Updated Issue
  const issue = await validateIssueById({ id: params.id });
  if (issue instanceof NextResponse) return issue;

  // Create Comment
  const newComment = await prisma.comment.create({
    data: {
      detail: body.detail,
      issueId: issue.id,
      createdByUserId: user.id,
    },
  });

  // Add CommentId to Issue
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
  // Validation Session
  const session = await validateSession();
  if (session instanceof NextResponse) return session;

  // Validation Request Body
  const body = await validateSchema({
    schema: deleteCommentSchema,
    body: await request.json(),
  });
  if (body instanceof NextResponse) return body;

  // Validate Updated Issue
  const issue = await validateIssueById({ id: params.id });
  if (issue instanceof NextResponse) return issue;

  // Validate Deleted Issue Comment
  const issueComment = await validateIssueById({ id: body.commentId });
  if (issueComment instanceof NextResponse) return issueComment;

  // Validate the Deleted Comment is in Updated Issue
  if (!issue.commentIds.includes(issueComment.id))
    return NextResponse.json(
      { error: "Comment Not Found in Issue" },
      { status: 404 }
    );
  //  Delete Comment
  await prisma.comment.update({
    where: {
      id: issueComment.id,
    },
    data: { isDeleted: true },
  });
  return NextResponse.json({});
}
