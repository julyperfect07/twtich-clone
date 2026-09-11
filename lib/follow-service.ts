import { db } from "./db";
import { getSelf } from "@/lib/auth-service";

export const isFollowingUser = async (id: string) => {
  try {
    const self = await getSelf();
    const otherUsers = await db.user.findUnique({
      where: { id },
    });
    if (!otherUsers) {
      throw new Error("User not found");
    }
    if (otherUsers.id === self.id) {
      return true;
    }
    const existingFollow = await db.follow.findFirst({
      where: {
        followerId: self.id,
        followingId: otherUsers.id,
      },
    });

    return !!existingFollow;
  } catch {
    return false;
  }
};
