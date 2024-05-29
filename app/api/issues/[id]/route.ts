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
  const { title, description, assignedToUserId, status, relatedIssueId } = body;

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
  let relatedIssueObjId = "";
  //validate related issueId and add relation
  if (relatedIssueId) {
    const relatedIssue = await prisma.issue.findUnique({
      where: { issueId: relatedIssueId },
    });
    if (!relatedIssue)
      return NextResponse.json(
        { error: "Related Issue Not Found" },
        { status: 404 }
      );
    relatedIssueObjId = relatedIssue.id;
    await prisma.issue.update({
      where: { id: relatedIssue.id },
      data: {
        relatedIssueIds: !relatedIssue.relatedIssueIds.includes(issue.id)
          ? [...relatedIssue.relatedIssueIds, issue.id]
          : relatedIssue.relatedIssueIds,
      },
    });
  }

  //update issue
  const updateIssue = await prisma.issue.update({
    where: { id: issue.id },
    data: {
      title,
      description,
      assignedToUserId,
      status,
      relatedIssueIds:
        relatedIssueId && !issue.relatedIssueIds.includes(relatedIssueObjId)
          ? [...issue.relatedIssueIds, relatedIssueObjId]
          : issue.relatedIssueIds,
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
  await prisma.comment.updateMany({
    where: { id: { in: issue.commentIds } },
    data: { isDeleted: true },
  });
  {
    issue.relatedIssueIds.map(async (relatedIssueId) => {
      const relatedIssue = await prisma.issue.findUnique({
        where: { id: relatedIssueId },
      });
      if (relatedIssue) {
        await prisma.issue.update({
          where: { id: relatedIssueId },
          data: {
            relatedIssueIds: relatedIssue.relatedIssueIds.filter(
              (item) => item !== issue.id
            ),
          },
        });
      }
    });
  }
  await prisma.issue.update({
    where: { id: issue.id },
    data: { isDeleted: true },
  });
  return NextResponse.json({});
}
