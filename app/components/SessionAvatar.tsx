import { Avatar } from "@radix-ui/themes";
import { Session } from "next-auth";
import React from "react";

const SessionAvatar = ({
  session,
  className = undefined,
}: {
  session: Session;
  className?: string | undefined;
}) => {
  return (
    <Avatar
      src={session.user!.image!}
      fallback="?"
      size="2"
      radius="full"
      className={className}
      referrerPolicy="no-referrer"
    />
  );
};

export default SessionAvatar;
