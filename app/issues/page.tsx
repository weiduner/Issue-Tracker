import React from "react";
import prisma from "@/prisma/client";
import IssueActions from "./IssueActions";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import { Status } from "@prisma/client";
import Pagination from "../components/Pagination";
import IssueTable, { columnNames, IssueQuery } from "./IssueTable";
import { Flex } from "@radix-ui/themes";
import { Metadata } from "next";

interface Props {
  searchParams: IssueQuery;
}

const IssuePage = async ({ searchParams }: Props) => {
  const statuses = Object.values(Status);
  const status = statuses.includes(searchParams.status)
    ? searchParams.status
    : undefined;
  const where = { status };

  const page = parseInt(searchParams.page) || 1;
  const pageSize = 10;
  const orderBy = columnNames.includes(searchParams.orderBy)
    ? { [searchParams.orderBy]: "asc" }
    : undefined;
  const issues = await prisma.issue.findMany({
    where,
    orderBy: orderBy,
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
  const issueCount = await prisma.issue.count({ where });
  const session = await getServerSession(authOptions);
  return (
    <Flex direction="column" gap="3">
      {session && <IssueActions />}
      <IssueTable searchParams={searchParams} issues={issues} />
      <Pagination
        pageSize={pageSize}
        currentPage={page}
        itemCount={issueCount}
      />
    </Flex>
  );
};
// dynamically render the page, revalidate every 0 second
export const revalidate = 0;
export default IssuePage;
export const metadata: Metadata = {
  title: "Issue Tracker - Issue List",
  description: "View all issues",
};
