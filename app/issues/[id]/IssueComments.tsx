import prisma from "@/prisma/client";
import { Issue, User } from "@prisma/client";
import { Box, Blockquote, Flex, Text, Avatar, Heading } from "@radix-ui/themes";
import React from "react";
import CommentEditer from "../_components/CommentEditer";
import { Session } from "next-auth";
const IssueComments = async ({
  issue,
  session,
}: {
  issue: Issue;
  session: Session | null;
}) => {
  const comments = await prisma.comment.findMany({
    where: {
      id: { in: issue.commentIds },
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
    <Flex direction="column" gap="2" mt="4">
      <Flex gap="2">
        <Heading size="4">Discussion</Heading>
        {session && <CommentEditer issue={issue} session={session} />}
      </Flex>

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
