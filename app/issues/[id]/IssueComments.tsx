import prisma from "@/prisma/client";
import { Issue, User } from "@prisma/client";
import { Box, Blockquote, Flex, Text, Avatar } from "@radix-ui/themes";
import React from "react";
import CommentEditer from "../_components/CommentEditer";

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
      <CommentEditer issue={issue} />
      {comments.map((comment) => (
        <Box key={comment.id} display="block">
          <Blockquote size="2">
            <Flex justify="between">
              <div className=" flex gap-2 items-center">
                <Avatar
                  src={usersMap[comment.createdByUserId]?.image!}
                  fallback="?"
                  size="2"
                  radius="full"
                  className="cursor-pointer"
                  referrerPolicy="no-referrer"
                />
                <p>{usersMap[comment.createdByUserId]?.name}</p>
              </div>
              <p>{comment.createdAt.toDateString()}</p>
            </Flex>
            <Text size="3">{comment.detail}</Text>
          </Blockquote>
        </Box>
      ))}
    </Flex>
  );
};

export default IssueComments;
