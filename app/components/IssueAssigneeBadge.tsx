import { Avatar, Badge, Flex } from "@radix-ui/themes";
import React from "react";
import prisma from "@/prisma/client";

const IssueAssigneeBadge = async ({
  assigneedId,
}: {
  assigneedId: string | null;
}) => {
  if (!assigneedId)
    return (
      <Badge>
        <Flex align="center" gap="2">
          <Avatar
            src=""
            fallback=""
            size="1"
            radius="full"
            className="cursor-pointer"
            referrerPolicy="no-referrer"
          />
          Unassigned
        </Flex>
      </Badge>
    );
  const user = await prisma.user.findUnique({ where: { id: assigneedId } });
  return (
    <Badge>
      <Flex align="center" gap="2">
        <Avatar
          src={user?.image ?? ""}
          fallback=""
          size="1"
          radius="full"
          className="cursor-pointer"
          referrerPolicy="no-referrer"
        />
        {user?.name ?? "None"}
      </Flex>
    </Badge>
  );
};

export default IssueAssigneeBadge;
