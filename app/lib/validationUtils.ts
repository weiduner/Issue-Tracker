import { getServerSession, Session } from "next-auth";
import authOptions from "../auth/authOptions";
import prisma from "@/prisma/client";
import { NextResponse } from "next/server";
import { ZodSchema } from "zod";

// Session
export async function validateSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({}, { status: 401 });
  }
  return session;
}

// Schema
export async function validateSchema({
  schema,
  body,
}: {
  schema: ZodSchema;
  body: any;
}) {
  const validation = schema.safeParse(body);
  if (!validation.success)
    return NextResponse.json(validation.error.format(), { status: 400 });
  return body;
}

// User by Session
export async function validateUserBySession(session: Session) {
  const email = session.user?.email ?? "";
  const user = await prisma.user.findUnique({
    where: { email: email },
  });
  if (!user) {
    return NextResponse.json("User required", { status: 401 });
  }
  return user;
}

// User by Id
export async function validateUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id: id },
  });
  
  if (!user) {
    return NextResponse.json("User Not Found", { status: 404 });
  }
  return user;
}

// Issue by Id
export async function validateIssueById({
  id,
  errorMsg = "Issue Not Found",
}: {
  id: string;
  errorMsg?: string;
}) {
  const issue = await prisma.issue.findUnique({
    where: { id: id, isDeleted: false },
  });
  if (!issue) {
    return NextResponse.json(errorMsg, { status: 404 });
  }
  return issue;
}

// Issue by Id
export async function validateIssueByIssueId({
  issueId,
  errorMsg = "Issue Not Found",
}: {
  issueId: string;
  errorMsg?: string;
}) {
  const issue = await prisma.issue.findUnique({
    where: { issueId: issueId, isDeleted: false },
  });
  if (!issue) {
    return NextResponse.json(errorMsg, { status: 404 });
  }
  return issue;
}

// Issue Comment by Id
export async function validateIssueCommentById({
  id,
  errorMsg = "Issue Comment Not Found",
}: {
  id: string;
  errorMsg?: string;
}) {
  const issueComment = await prisma.comment.findUnique({
    where: { id: id, isDeleted: false },
  });
  if (!issueComment) {
    return NextResponse.json(errorMsg, { status: 404 });
  }
  return issueComment;
}
