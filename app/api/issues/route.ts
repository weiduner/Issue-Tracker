import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { filterIssueSchema, issueSchema } from "../../lib/validationSchemas";
import { Status } from "@prisma/client";
import {
  validateSchema,
  validateSession,
  validateUserBySession,
} from "@/app/lib/validationUtils";
const statuses = Object.values(Status);

export async function POST(request: NextRequest) {
  // Validation Session
  const session = await validateSession();
  if (session instanceof NextResponse) return session;
  // Validation  User
  const user = await validateUserBySession(session);
  if (user instanceof NextResponse) return user;
  // Validation Request Body
  const body = await validateSchema({
    schema: issueSchema,
    body: await request.json(),
  });
  if (body instanceof NextResponse) return body;

  // Function Begin
  const { title, description, status } = body;
  const generateCustomId = async () => {
    const date = new Date().toISOString().split("T")[0].replace(/-/g, ""); // Get current date in YYYY-MM-DD format

    // Get the count of documents created today
    const count = await prisma.issue.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(24, 0, 0, 0)),
        },
      },
    });

    return `${date}-${count + 1}`;
  };
  const issueId = await generateCustomId();
  const newIssue = await prisma.issue.create({
    data: {
      title,
      description,
      status,
      issueId: issueId,
      createdByUserId: user?.id,
      // createdByUserId: "664ef7ae28f0d8249be7d81f",
    },
  });
  return NextResponse.json(newIssue, { status: 201 });
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const queryParams = Object.fromEntries(url.searchParams.entries());
  const validation = filterIssueSchema.safeParse(queryParams);
  if (!validation.success)
    return NextResponse.json(validation.error.format(), { status: 400 });
  const [assignedToUserId, status] = [
    queryParams.assignedToUserId,
    queryParams.status,
  ];

  const query = { where: {} };

  if (status) {
    if (!statuses.includes(status as Status))
      return NextResponse.json({ error: "Invalid Status." }, { status: 400 });
    query["where"] = { ...query["where"], status: status };
  }

  if (assignedToUserId) {
    const user = await prisma.user.findUnique({
      where: { id: assignedToUserId },
    });
    if (!user)
      return NextResponse.json({ error: "Invalid User." }, { status: 400 });
    query["where"] = {
      ...query["where"],
      assignedToUserId: assignedToUserId,
    };
  }

  const issues = await prisma.issue.findMany(query);
  return NextResponse.json(
    { count: issues.length, data: issues },
    { status: 200 }
  );
}
