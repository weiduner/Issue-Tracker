import prisma from "@/prisma/client";
import { Box, Flex, Grid } from "@radix-ui/themes";
import { notFound } from "next/navigation";
import IssueDetails from "./IssueDetails";
import DeleteIssueButton from "./DeleteIssueButton";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import AssigneeSelect from "../_components/AssigneeSelect";
import { cache } from "react";
import IssueRelations from "./IssueRelations";
import IssueForm from "../_components/IssueForm";

interface Props {
  params: { id: string };
}
const fetchUser = cache((issueId: string) =>
  prisma.issue.findUnique({ where: { id: issueId } })
);
const IssueDetailPage = async ({ params }: Props) => {
  const session = await getServerSession(authOptions);
  try {
    const issue = await fetchUser(params.id);

    if (!issue) throw new Error("Issue not found");

    return (
      <Grid columns={{ initial: "1", sm: "5" }} gap="5">
        <Box className="md:col-span-4">
          <IssueDetails issue={issue} session={session} />
        </Box>
        {session && (
          <Box>
            <Flex direction="column" gap="4">
              {/* <AssigneeSelect issue={issue} /> */}
              <IssueForm issue={issue} />
              <DeleteIssueButton issueId={issue.id} />
              <IssueRelations issue={issue} />
            </Flex>
          </Box>
        )}
      </Grid>
    );
  } catch (error) {
    notFound();
  }
};
export async function generateMetadata({ params }: Props) {
  const issue = await fetchUser(params.id);
  return {
    title: issue?.title,
    description: "Details of issue " + issue?.id,
  };
}
export default IssueDetailPage;
