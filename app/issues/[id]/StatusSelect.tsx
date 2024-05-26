"use client";
import IssueStatusBadge, { statusMap } from "@/app/components/IssueStatusBadge";
import { Issue, Status } from "@prisma/client";
import { Select } from "@radix-ui/themes";
import axios from "axios";
import { useRouter } from "next/navigation";
import React from "react";
import toast, { Toaster } from "react-hot-toast";

const statuses = Object.values(Status);
const StatusSelect = ({ issue }: { issue: Issue }) => {
  const router = useRouter();
  const changeIssueStatus = async (status: Status) => {
    await axios
      .patch("/api/issues/" + issue.id, {
        status: status,
      })
      .catch(() => {
        toast.error("An unexpected error occured! The change is not saved.");
      });
    router.push("/issues/" + issue.id);
    router.refresh();
  };
  return (
    <>
      <Select.Root
        defaultValue={issue?.status || "OPEN"}
        onValueChange={changeIssueStatus}
      >
        <Select.Trigger
          placeholder="OPEN"
          color={statusMap[issue.status].color}
          variant="soft"
        />
        <Select.Content>
          {statuses?.map((status) => (
            <Select.Item key={status} value={status}>
              {status}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
      <Toaster />
    </>
  );
};

export default StatusSelect;
