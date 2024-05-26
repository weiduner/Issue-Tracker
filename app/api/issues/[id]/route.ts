import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { patchIssueSchema } from "@/app/validationSchemas";
import authOptions from "@/app/auth/authOptions";
import { getServerSession } from "next-auth";
import { Status } from "@prisma/client";

const statuses = Object.values(Status);
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // require login
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({}, { status: 401 });

  //validate body
  const body = await request.json();
  const validation = patchIssueSchema.safeParse(body);
  if (!validation.success)
    return NextResponse.json(validation.error.format(), { status: 400 });
  const { title, description, assignedToUserId, status } = body;

  //validate assigned user
  if (assignedToUserId) {
    const user = await prisma.user.findUnique({
      where: { id: assignedToUserId },
    });
    if (!user)
      return NextResponse.json({ error: "Invalid User." }, { status: 400 });
  }
  if (status && !statuses.includes(status)) {
    return NextResponse.json({ error: "Invalid Status." }, { status: 400 });
  }

  //validate updated issue
  const issue = await prisma.issue.findUnique({
    where: { id: params.id },
  });
  if (!issue)
    return NextResponse.json({ error: "Invalid Issue" }, { status: 404 });

  //update issue
  const updateIssue = await prisma.issue.update({
    where: { id: issue.id },
    data: {
      title,
      description,
      assignedToUserId,
      status,
    },
  });
  return NextResponse.json(updateIssue);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({}, { status: 401 });
  const issue = await prisma.issue.findUnique({
    where: { id: params.id },
  });
  if (!issue)
    return NextResponse.json({ error: "Invalid Issue" }, { status: 404 });
  await prisma.issue.delete({
    where: { id: issue.id },
  });
  return NextResponse.json({});
}
