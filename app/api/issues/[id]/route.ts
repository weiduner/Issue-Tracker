import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { patchIssueSchema } from "@/app/lib/validationSchemas";
import { Status } from "@prisma/client";
import {
  validateSchema,
  validateSession,
  validateUserById,
  validateIssueById,
} from "@/app/lib/validationUtils";

const statuses = Object.values(Status);
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validation Session
  const session = await validateSession();
  if (session instanceof NextResponse) return session;
  // Validation Request Body
  const body = await validateSchema({
    schema: patchIssueSchema,
    body: await request.json(),
  });
  if (body instanceof NextResponse) return body;

  const { title, description, assignedToUserId, status, relatedIssueId } = body;

  // Validate Updated Issue
  const issue = await validateIssueById({ id: params.id });
  if (issue instanceof NextResponse) return issue;
  const data: any = { titel: title, description: description };

  // Update Assigned User
  if (assignedToUserId) {
    const assignedToUser = validateUserById(assignedToUserId);
    if (assignedToUser instanceof NextResponse) return assignedToUser;
    data.assignedToUserId = assignedToUserId;
  }
  // Update Issue Status
  if (status) {
    if (!statuses.includes(status)) {
      return NextResponse.json({ error: "Invalid Status." }, { status: 400 });
    }
    data.status = status;
  }

  //Update Related Issue
  if (relatedIssueId) {
    const relatedIssue = await validateIssueById({
      id: relatedIssueId,
      errorMsg: "Cannot find IssuId: " + relatedIssueId,
    });
    if (relatedIssue instanceof NextResponse) return relatedIssue;
    await prisma.issue.update({
      where: { id: relatedIssue.id },
      data: {
        relatedIssueIds: Array.from(
          new Set([...relatedIssue.relatedIssueIds, issue.id])
        ),
      },
    });
    data.relatedIssueIds = Array.from(
      new Set([...issue.relatedIssueIds, relatedIssue.id])
    );
  }

  //update issue
  const updateIssue = await prisma.issue.update({
    where: { id: issue.id },
    data,
  });
  return NextResponse.json(updateIssue);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validation Session
  const session = await validateSession();
  if (session instanceof NextResponse) return session;

  // Validate Deleted Issue
  const issue = await validateIssueById({ id: params.id });
  if (issue instanceof NextResponse) return issue;

  //Delete Issue Comment
  await prisma.comment.updateMany({
    where: { id: { in: issue.commentIds } },
    data: { isDeleted: true },
  });
  //Delete Issue Relation
  {
    issue.relatedIssueIds.map(async (relatedIssueId) => {
      const relatedIssue = await validateIssueById({
        id: relatedIssueId,
        errorMsg: "Cannot find IssuId: " + relatedIssueId,
      });
      if (relatedIssue instanceof NextResponse) return relatedIssue;
      await prisma.issue.update({
        where: { id: relatedIssueId },
        data: {
          relatedIssueIds: relatedIssue.relatedIssueIds.filter(
            (item) => item !== issue.id
          ),
        },
      });
    });
  }

  // Delete Issue
  await prisma.issue.update({
    where: { id: issue.id },
    data: { isDeleted: true },
  });
  return NextResponse.json({});
}
