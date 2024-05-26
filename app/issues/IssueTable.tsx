import { ArrowUpIcon } from "@radix-ui/react-icons";
import { Table } from "@radix-ui/themes";
import Link from "../components/Link";
import NextLink from "next/link";
import React from "react";
import IssueStatusBadge from "../components/IssueStatusBadge";
import { Issue, Status } from "@prisma/client";

export interface IssueQuery {
  status: Status;
  orderBy: keyof Issue;
  sortOrder: "asc" | "desc";
  page: string;
}
interface Props {
  searchParams: IssueQuery;
  issues: Issue[];
}

const IssueTable = ({ searchParams, issues }: Props) => {
  const getNextSortOrder = (currentOrder: "asc" | "desc") => {
    return currentOrder === "asc" ? "desc" : "asc";
  };
  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          {/* {columns.map((col) => (
            <Table.ColumnHeaderCell key={col.value} className={col.className}>
              <NextLink
                href={{
                  query: {
                    ...searchParams,
                    orderBy: col.value,
                  },
                }}
              >
                {col.label}
              </NextLink>
              {col.value === searchParams.orderBy && (
                <ArrowUpIcon className="inline" />
              )}
            </Table.ColumnHeaderCell>
          ))} */}
          {columns.map((col) => {
            const isSorted = col.value === searchParams.orderBy;
            const nextSortOrder = isSorted
              ? getNextSortOrder(searchParams.sortOrder)
              : "asc";
            return (
              <Table.ColumnHeaderCell key={col.value} className={col.className}>
                <NextLink
                  href={{
                    query: {
                      ...searchParams,
                      orderBy: col.value,
                      sortOrder: nextSortOrder, // Set next sort order
                    },
                  }}
                >
                  {col.label}
                </NextLink>
                {isSorted && (
                  <ArrowUpIcon
                    className={`inline ${
                      searchParams.sortOrder === "asc" ? "" : "rotate-180"
                    }`}
                  />
                )}
              </Table.ColumnHeaderCell>
            );
          })}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {issues.map((issue) => (
          <Table.Row key={issue.id}>
            <Table.Cell>
              <Link href={`/issues/${issue.id}`}>{issue.id.toString()}</Link>
            </Table.Cell>
            <Table.Cell>{issue.title}</Table.Cell>
            <Table.Cell>
              <IssueStatusBadge status={issue.status} />
            </Table.Cell>
            <Table.Cell className="hidden md:table-cell">
              {issue.createdAt.toDateString()}
            </Table.Cell>
            <Table.Cell className="hidden md:table-cell">
              {issue.updatedAt.toDateString()}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};

export default IssueTable;

const columns: {
  label: string;
  value: keyof Issue;
  className?: string;
}[] = [
  { label: "Id", value: "id" },
  { label: "Title", value: "title" },
  { label: "Status", value: "status" },
  {
    label: "Created",
    value: "createdAt",
    className: "hidden md:table-cell",
  },
  {
    label: "Last Update",
    value: "updatedAt",
    className: "hidden md:table-cell",
  },
];
export const columnNames = columns.map((col) => col.value);
