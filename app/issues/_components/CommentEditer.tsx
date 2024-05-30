"use client";
import { commentSchema } from "@/app/lib/validationSchemas";
import {
  Avatar,
  Box,
  Button,
  Callout,
  Flex,
  Popover,
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
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import { Session } from "next-auth";
import SessionAvatar from "@/app/components/SessionAvatar";
type CommentFormData = z.infer<typeof commentSchema>;
const CommentEditer = ({
  issue,
  session,
}: {
  issue: Issue;
  session: Session;
}) => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isProcessing, setProcessing] = useState(false);
  const [open, setOpen] = useState(false);

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
        setOpen(false);
        router.refresh();
      }
    } catch (error) {
      setProcessing(false);
      setError("An unexpected error occured.");
    }
  });

  return (
    <Flex justify="start" gap="2" align="center">
      {session && (
        <Popover.Root open={open} onOpenChange={setOpen}>
          {error && (
            <Callout.Root color="red" className="mb-5">
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          )}
          <Popover.Trigger>
            <Button size="1" variant="soft">
              <ChatBubbleIcon width="16" height="16" />
              Comment
            </Button>
          </Popover.Trigger>
          <Popover.Content width="360px">
            <Flex gap="3">
              <SessionAvatar session={session} />
              <Box flexGrow="1">
                <form onSubmit={onSubmit}>
                  <TextArea
                    {...register("detail")}
                    placeholder="Write a comment…"
                    style={{ height: 80 }}
                  />
                  <ErrorMessage>{errors.detail?.message}</ErrorMessage>
                  <Flex gap="3" mt="3" justify="end">
                    <Button disabled={isProcessing} size="1" type="submit">
                      Comment {isProcessing && <Spinner />}
                    </Button>
                  </Flex>
                </form>
              </Box>
            </Flex>
          </Popover.Content>
        </Popover.Root>
      )}
    </Flex>
  );
};

export default CommentEditer;
