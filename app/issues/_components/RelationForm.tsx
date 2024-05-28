"use client";
import { patchIssueSchema } from "@/app/validationSchemas";
import {
  Button,
  Callout,
  Dialog,
  Flex,
  Spinner,
  TextField,
  Text,
} from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Issue } from "@prisma/client";
import ErrorMessage from "@/app/components/ErrorMessage";
type RelationFormData = z.infer<typeof patchIssueSchema>;
const RelationForm = ({ issue }: { issue: Issue }) => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isProcessing, setProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RelationFormData>({
    resolver: zodResolver(patchIssueSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setProcessing(true);
      const response = await axios.patch("/api/issues/" + issue.id, data);

      if (response.status === 200) {
        setProcessing(false);
        reset();
        router.refresh();
      }
    } catch (error) {
      setProcessing(false);
      setError("An unexpected error occured.");
    }
  });
  const handleCancel = () => {
    reset();
  };
  return (
    <Dialog.Root>
      {" "}
      {error && (
        <Callout.Root color="red" className="mb-5">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}
      <Dialog.Trigger>
        <Button size="1">+</Button>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="450px">
        <form onSubmit={onSubmit}>
          {" "}
          <Dialog.Title>Add Related Issues</Dialog.Title>{" "}
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Issue ID
            </Text>
            <TextField.Root
              placeholder="Enter the Issue ID"
              {...register("relatedIssueId")}
            />
            <ErrorMessage>{errors.relatedIssueId?.message}</ErrorMessage>
          </label>
          <Flex gap="3" mt="4" justify="end">
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
            <Button type="submit" disabled={isProcessing}>
              Save {isProcessing && <Spinner />}
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default RelationForm;
