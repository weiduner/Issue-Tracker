import { Button, Flex } from "@radix-ui/themes";
import Link from "next/link";
import React from "react";
import IssueStatusFilter from "./IssueStatusFilter";
import { Session } from "next-auth";
import IssueForm from "./_components/IssueForm";

const IssueActions = ({ session }: { session: Session | null }) => {
  return (
    <Flex justify="between">
      <IssueStatusFilter />
      {session && <IssueForm />}
      {/* <Link href="/issues/new">
        <Button>New Issue</Button>
      </Link> */}
    </Flex>
  );
};

export default IssueActions;
