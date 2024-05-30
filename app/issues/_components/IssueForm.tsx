"use client";
import ErrorMessage from "@/app/components/ErrorMessage";
import { issueSchema } from "@/app/lib/validationSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Issue } from "@prisma/client";
import {
  Button,
  Callout,
  Dialog,
  Flex,
  Spinner,
  TextField,
  Text,
} from "@radix-ui/themes";
import axios from "axios";
import "easymde/dist/easymde.min.css";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import SimpleMDE from "react-simplemde-editor";
import { Pencil2Icon, PlusIcon } from "@radix-ui/react-icons";

type IssueFormData = z.infer<typeof issueSchema>;

const IssueForm = ({ issue }: { issue?: Issue }) => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isProcessing, setProcessing] = useState(false);
  const [open, setOpen] = useState(false);
  const {
    register,
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setProcessing(true);
      let response;
      if (issue) {
        response = await axios.patch("/api/issues/" + issue.id, data);
      } else {
        response = await axios.post("/api/issues", data);
        issue = response.data;
      }
      if (response.status <= 201) {
        setError("");
        setProcessing(false);
        reset();
        setOpen(false);
        router.push("/issues/" + issue!.id);
        router.refresh();
      }
    } catch (error) {
      setProcessing(false);
      if (axios.isAxiosError(error)) {
        setError(error.response!.data);
      } else {
        setError("An unexpected error occured");
      }
    }
  });
  const handleCancel = async () => {
    setError("");
    reset();
    router.push(`/issues/${issue ? issue.id : ""}`);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button>
          {issue ? (
            <>
              <Pencil2Icon /> Edit Issue
            </>
          ) : (
            <>
              <PlusIcon /> New Issue
            </>
          )}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>{issue ? "Update Issue" : "Create Isssue"}</Dialog.Title>
        {/* Form Error */}
        {error && (
          <Callout.Root color="red" className="mb-5">
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}

        <form className="space-y-3" onSubmit={onSubmit}>
          {/* title input */}
          <Text as="div" size="2" mb="1" weight="bold">
            Title
          </Text>
          <TextField.Root
            defaultValue={issue?.title}
            placeholder="Title"
            {...register("title")}
          ></TextField.Root>
          <ErrorMessage>{errors.title?.message}</ErrorMessage>

          {/* description input */}
          <Text as="div" size="2" mb="1" weight="bold">
            Description
          </Text>
          <Controller
            defaultValue={issue?.description}
            name="description"
            control={control}
            render={({ field }) => (
              <SimpleMDE placeholder="Description" {...field} />
            )}
          />
          <ErrorMessage>{errors.description?.message}</ErrorMessage>

          <Flex gap="2" justify="end">
            {/* cancel button */}
            <Dialog.Close>
              <Button
                onClick={handleCancel}
                disabled={isProcessing}
                variant="soft"
                color="gray"
              >
                Cancel
              </Button>
            </Dialog.Close>

            {/* submit button */}
            <Button type="submit" disabled={isProcessing}>
              {issue ? "Update Issue" : "Submit New Issue"}{" "}
              {isProcessing && <Spinner />}
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default IssueForm;
