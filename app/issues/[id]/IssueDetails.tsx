import IssueStatusBadge from "@/app/components/IssueStatusBadge";
import { Issue } from "@prisma/client";
import { Flex, Heading, Card, Text } from "@radix-ui/themes";
import React from "react";
import ReactMarkdown from "react-markdown";
import StatusSelect from "./StatusSelect";
import { Session } from "next-auth";
import IssueComments from "./IssueComments";

const IssueDetails = ({
  issue,
  session,
}: {
  issue: Issue;
  session: Session | null;
}) => {
  return (
    <div>
      <Heading as="h2">
        {issue.issueId} {">"} {issue.title}
      </Heading>

      <Flex gap="3" my="2" align="center">
        {session ? (
          <StatusSelect issue={issue} />
        ) : (
          <IssueStatusBadge status={issue.status} />
        )}
        <Text>{issue.createdAt.toDateString()}</Text>
      </Flex>
      <Flex direction="column" mt="4">
        <Heading size="4">Description</Heading>
        <Card className="prose max-w-full min-h-80">
          <ReactMarkdown>{issue.description}</ReactMarkdown>
        </Card>
      </Flex>
      <Flex direction="column" mt="4">
        <Heading size="4">Discussion</Heading>
        <IssueComments issue={issue} />
      </Flex>
    </div>
  );
};

export default IssueDetails;
