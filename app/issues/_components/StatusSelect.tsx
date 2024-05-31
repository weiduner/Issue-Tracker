"use client";
import { statusMap } from "@/app/components/IssueStatusBadge";
import { Issue, Status } from "@prisma/client";
import { Select } from "@radix-ui/themes";
import React, { useState } from "react";
const statuses = Object.values(Status);

const StatusSelect = ({
  issue,
  value,
  onChange,
}: {
  issue?: Issue;
  value: Status;
  onChange: (value: Status) => void;
}) => {
  const [selectedStatus, setSelectedStatus] = useState<Status>(
    issue?.status || "OPEN"
  );
  const handleValueChange = (value: Status) => {
    setSelectedStatus(value);
    onChange(value); // Notify the parent component of the value change
  };
  return (
    <Select.Root
      defaultValue={issue?.status || "OPEN"}
      onValueChange={handleValueChange}
    >
      <Select.Trigger
        placeholder="OPEN"
        color={statusMap[selectedStatus].color}
        variant="soft"
      />
      <Select.Content>
        {statuses?.map((status) => (
          <Select.Item key={status} value={status}>
            {statusMap[status].label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
};

export default StatusSelect;
