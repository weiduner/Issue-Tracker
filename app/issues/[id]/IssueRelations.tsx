import IssueStatusBadge from "@/app/components/IssueStatusBadge";
import prisma from "@/prisma/client";
import { Issue } from "@prisma/client";
import {
  Box,
  Card,
  Flex,
  Heading,
  HoverCard,
  Link,
  Text,
} from "@radix-ui/themes";
import React from "react";
import RelationForm from "../_components/RelationForm";

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
        <RelationForm issue={issue} />
      </Flex>

      <Card>
        {relatedIssues.map((relatedIssue) => (
          <HoverCard.Root key={relatedIssue.id}>
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
