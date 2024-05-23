import React from "react";
import dynamic from "next/dynamic";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import IssueFormSkelenton from "./loading";

const IssueForm = dynamic(() => import("../../_components/IssueForm"), {
  ssr: false,
  loading: () => <IssueFormSkelenton />,
});

interface Props {
  params: { id: string };
}

const EditIssuePage = async ({ params }: Props) => {
  try {
    const issue = await prisma.issue.findUnique({
      where: { id: params.id },
    });

    if (!issue) throw new Error("Issue not found");

    return <IssueForm issue={issue} />;
  } catch (error) {
    notFound();
  }
};

export default EditIssuePage;
