"use client";
import { Issue, User } from "@prisma/client";
import { Avatar, Select, Skeleton } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const AssigneeSelect = ({ issue }: { issue: Issue }) => {
  const { data: users, error, isLoading } = useUsers();
  if (isLoading) return <Skeleton />;
  if (error) return null;
  const assignIssue = (userId: string) => {
    axios
      .patch("/api/issues/" + issue.id, {
        assignedToUserId: userId === "null" ? null : userId,
      })
      .catch(() => {
        toast.error("An unexpected error occured! The change is not saved.");
      });
  };
  return (
    <>
      <Select.Root
        defaultValue={issue.assignedToUserId || "null"}
        onValueChange={assignIssue}
      >
        <Select.Trigger placeholder="Assign..." />
        <Select.Content>
          <Select.Group>
            <Select.Label>Suggestions</Select.Label>
            <Select.Item value="null">
              <Avatar
                src=""
                fallback=""
                size="1"
                radius="full"
                className="cursor-pointer"
                referrerPolicy="no-referrer"
              />
              {"  "}Unassigned
            </Select.Item>
            {users?.map((user) => (
              <Select.Item key={user.id} value={user.id}>
                <Avatar
                  src={user.image!}
                  fallback="?"
                  size="1"
                  radius="full"
                  className="cursor-pointer"
                  referrerPolicy="no-referrer"
                />
                {"  "}
                {user.name}
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Content>
      </Select.Root>
      <Toaster />
    </>
  );
};

const useUsers = () =>
  useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => axios.get("/api/users").then((res) => res.data),
    staleTime: 60 * 1000, // 60 seconds
    retry: 3,
  });

export default AssigneeSelect;
