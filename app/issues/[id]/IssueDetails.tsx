import IssueStatusBadge from "@/app/components/IssueStatusBadge";
import { Issue } from "@prisma/client";
import { Flex, Heading, Card, Text } from "@radix-ui/themes";
import React from "react";
import ReactMarkdown from "react-markdown";
import StatusSelect from "./StatusSelect";
import { Session } from "next-auth";

const IssueDetails = ({
  issue,
  session,
}: {
  issue: Issue;
  session: Session | null;
}) => {
  return (
    <div>
      <Flex gap="3" my="2">
        <Heading as="h2">{issue.id} </Heading>
        <Heading as="h2">{issue.title}</Heading>
      </Flex>

      <Flex gap="3" my="2" align="center">
        {session ? (
          <StatusSelect issue={issue} />
        ) : (
          <IssueStatusBadge status={issue.status} />
        )}
        <Text>{issue.createdAt.toDateString()}</Text>
      </Flex>
      <Card className="prose max-w-full" mt="4">
        <ReactMarkdown>{issue.description}</ReactMarkdown>
      </Card>
    </div>
  );
};

export default IssueDetails;
