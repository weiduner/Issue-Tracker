import prisma from "@/prisma/client";
import { Issue, User } from "@prisma/client";
import { Box, Blockquote, Flex } from "@radix-ui/themes";
import React from "react";

const IssueComments = async ({ issue }: { issue: Issue }) => {
  const comments = await prisma.comment.findMany({
    where: {
      issueId: issue.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const createdByUserIds = comments.map((comment) => comment.createdByUserId);
  const users = await prisma.user.findMany({
    where: { id: { in: createdByUserIds } },
  });
  const usersMap: Record<string, User> = {};
  users.forEach((user) => {
    usersMap[user.id] = user;
  });
  return (
    <Flex direction="column" gap="5">
      {comments.map((comment) => (
        <Box>
          <Blockquote size="2">
            <Flex justify="between">
              <p>{usersMap[comment.createdByUserId]?.name}</p>
              <p>{comment.createdAt.toDateString()}</p>
            </Flex>
            {comment.detail}
          </Blockquote>
        </Box>
      ))}
    </Flex>
  );
};

export default IssueComments;
