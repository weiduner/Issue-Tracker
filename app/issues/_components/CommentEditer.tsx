"use client";
import { commentSchema } from "@/app/validationSchemas";
import {
  Box,
  Button,
  Callout,
  Flex,
  Spinner,
  TextArea,
} from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Issue } from "@prisma/client";
import ErrorMessage from "@/app/components/ErrorMessage";
type CommentFormData = z.infer<typeof commentSchema>;
const CommentEditer = ({ issue }: { issue: Issue }) => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isProcessing, setProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setProcessing(true);
      const response = await axios.post(
        "/api/issues/" + issue.id + "/comments",
        data
      );

      if (response.status === 201) {
        setProcessing(false);
        reset();
        router.refresh();
      }
    } catch (error) {
      setProcessing(false);
      setError("An unexpected error occured.");
    }
  });

  return (
    <Box>
      {" "}
      {error && (
        <Callout.Root color="red" className="mb-5">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}
      <form onSubmit={onSubmit}>
        <TextArea
          {...register("detail")}
          placeholder="Write your comment here..."
        />
        <ErrorMessage>{errors.detail?.message}</ErrorMessage>

        <Button mt="2" disabled={isProcessing}>
          Submit {isProcessing && <Spinner />}
        </Button>
      </form>
    </Box>
  );
};

export default CommentEditer;
