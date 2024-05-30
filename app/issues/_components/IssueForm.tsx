"use client";
import ErrorMessage from "@/app/components/ErrorMessage";
import { issueSchema } from "@/app/lib/validationSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Issue } from "@prisma/client";
import { Button, Callout, Flex, Spinner, TextField } from "@radix-ui/themes";
import axios from "axios";
import "easymde/dist/easymde.min.css";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import SimpleMDE from "react-simplemde-editor";

type IssueFormData = z.infer<typeof issueSchema>;

const IssueForm = ({ issue }: { issue?: Issue }) => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isProcessing, setProcessing] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setProcessing(true);
      if (issue) {
        await axios.patch("/api/issues/" + issue.id, data);
      } else {
        const response = await axios.post("/api/issues", data);
        issue = response.data;
      }
      setError("");
      router.push("/issues/" + issue!.id);
      router.refresh();
    } catch (error) {
      setProcessing(false);
      setError("An unexpected error occured.");
    }
  });
  const handleCancel = async () => {
    setProcessing(true);
    router.push(`/issues/${issue ? issue.id : ""}`);
  };

  return (
    <div className="max-w-xl">
      {/* Form Error */}
      {error && (
        <Callout.Root color="red" className="mb-5">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      <form className="space-y-3" onSubmit={onSubmit}>
        {/* title input */}
        <TextField.Root
          defaultValue={issue?.title}
          placeholder="Title"
          {...register("title")}
        ></TextField.Root>
        <ErrorMessage>{errors.title?.message}</ErrorMessage>

        {/* description input */}
        <Controller
          defaultValue={issue?.description}
          name="description"
          control={control}
          render={({ field }) => (
            <SimpleMDE placeholder="Description" {...field} />
          )}
        />
        <ErrorMessage>{errors.description?.message}</ErrorMessage>

        {/* submit button */}
        <Flex gap="2">
          <Button disabled={isProcessing}>
            {issue ? "Update Issue" : "Submit New Issue"}{" "}
            {isProcessing && <Spinner />}
          </Button>
          {/* cancel button */}
          <Button disabled={isProcessing} onClick={handleCancel}>
            Cancel
            {isProcessing && <Spinner />}
          </Button>
        </Flex>
      </form>
    </div>
  );
};

export default IssueForm;
