import { Status } from "@prisma/client";
import { Badge, Flex } from "@radix-ui/themes";
import React from "react";

export const statusMap: Record<
  Status,
  { label: string; color: "red" | "blue" | "green" }
> = {
  OPEN: { label: "Open", color: "red" },
  IN_PROGRESS: { label: "In Progress", color: "blue" },
  CLOSED: { label: "Closed", color: "green" },
};

const IssueStatusBadge = ({
  status,
  size = "1",
}: {
  status: Status;
  size?: "1" | "2" | "3";
}) => {
  return (
    <Badge color={statusMap[status].color} size={size}>
      {statusMap[status].label}
    </Badge>
  );
};

export default IssueStatusBadge;
