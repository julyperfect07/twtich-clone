import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const getSelf = async () => {
  const self = await currentUser();

  if (!self || !self?.username) {
    throw new Error("Unauthorized");
  }

  let user = await db.user.findUnique({
    where: { externalId: self.id },
  });

  if (!user) {
    throw new Error("not found");
  }

  if (user.username !== self.username || user.imageUrl !== self.imageUrl) {
    user = await db.user.update({
      where: { externalId: self.id },
      data: {
        username: self.username,
        imageUrl: self.imageUrl,
      },
    });
  }

  return user;
};
