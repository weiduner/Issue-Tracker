import dynamic from "next/dynamic";
import IssueFormSkelenton from "./loading";

const IssueForm = dynamic(() => import("@/app/issues/_components/IssueForm"), {
  ssr: false,
  loading: () => <IssueFormSkelenton />,
});

const NewIssuePage = () => {
  return <IssueForm />;
};

export default NewIssuePage;
