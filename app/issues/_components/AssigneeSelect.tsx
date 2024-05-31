"use client";
import { Issue, User } from "@prisma/client";
import { Avatar, Select, Skeleton } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const AssigneeSelect = ({
  issue,
  value,
  onChange,
}: {
  issue?: Issue;
  value: string | null;
  onChange: (value: string | null) => void;
}) => {
  const { data: users, error, isLoading } = useUsers();
  if (isLoading) return <Skeleton />;
  if (error) return null;

  return (
    <Select.Root
      defaultValue={issue?.assignedToUserId ?? "null"}
      onValueChange={(value) => onChange(value === "null" ? null : value)}
    >
      <Select.Trigger placeholder="Assign..." />
      <Select.Content>
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
      </Select.Content>
    </Select.Root>
  );
};

export const useUsers = () =>
  useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => axios.get("/api/users").then((res) => res.data),
    staleTime: 60 * 1000, // 60 seconds
    retry: 3,
  });

export default AssigneeSelect;
