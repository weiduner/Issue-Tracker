import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { filterIssueSchema, issueSchema } from "../../validationSchemas";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import { Status } from "@prisma/client";
const statuses = Object.values(Status);

export async function POST(request: NextRequest) {
  // const session = await getServerSession(authOptions);
  // if (!session) return NextResponse.json({}, { status: 401 });
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
  const body = await request.json();
  const validation = issueSchema.safeParse(body);
  if (!validation.success)
    return NextResponse.json(validation.error.format(), { status: 400 });
  const issueId = await generateCustomId();
  const newIssue = await prisma.issue.create({
    data: {
      title: body.title,
      description: body.description,
      issueId: issueId,
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
