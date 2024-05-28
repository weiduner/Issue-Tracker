import IssueStatusBadge from "@/app/components/IssueStatusBadge";
import prisma from "@/prisma/client";
import { Issue } from "@prisma/client";
import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  HoverCard,
  Link,
  Text,
  TextField,
} from "@radix-ui/themes";
import React from "react";

const IssueRelations = async ({ issue }: { issue: Issue }) => {
  const relatedIssues = await prisma.issue.findMany({
    where: { id: { in: issue.relatedIssueIds } },
  });
  return (
    <Flex direction="column" gap="1">
      <Flex justify="between" mx="1">
        <Text size="2" weight="bold">
          Related Issues
        </Text>
        <Dialog.Root>
          {" "}
          <Dialog.Trigger>
            <Button size="1">+</Button>
          </Dialog.Trigger>
          <Dialog.Content maxWidth="450px">
            {" "}
            <Dialog.Title>Add Related Issues</Dialog.Title>{" "}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Issue ID
              </Text>
              <TextField.Root placeholder="Enter the Issue ID" />
            </label>
            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </Dialog.Close>
              <Dialog.Close>
                <Button>Save</Button>
              </Dialog.Close>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </Flex>

      <Card>
        {relatedIssues.map((relatedIssue) => (
          <HoverCard.Root>
            <HoverCard.Trigger>
              <Link href={`/issues/${relatedIssue.id}`} target="_blank">
                <Text as="div">{relatedIssue.issueId}</Text>
              </Link>
            </HoverCard.Trigger>
            <HoverCard.Content maxWidth="300px">
              <Box>
                <Heading size="3" as="h3">
                  {relatedIssue.title}
                </Heading>
                <Flex justify="between" gap="2">
                  {" "}
                  <IssueStatusBadge status={relatedIssue.status} />
                  <Text as="div" size="2" mb="2">
                    {relatedIssue.createdAt.toDateString()}
                  </Text>
                </Flex>
              </Box>
            </HoverCard.Content>
          </HoverCard.Root>
        ))}
      </Card>
    </Flex>
  );
};

export default IssueRelations;
