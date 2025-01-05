import { currentUser, User } from "@clerk/nextjs/server";
import { User as PrismaUser } from "@prisma/client";
import { db } from "./prisma";

export const checkUser = async (): Promise<PrismaUser | null> => {
  const user: User | null = await currentUser(); //通过 clerk 获取当前登录用户

  //未登录
  if (!user) {
    return null;
  }

  //已登录，查数据库：存在->返回，不存在->创建用户并返回
  try {
    const loggedInUser: PrismaUser | null = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const name = `${user.firstName} ${user.lastName}`;

    const newUser: PrismaUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      },
    });

    return newUser;
  } catch (error) {
    console.log((error as Error).message);
    return null;
  }
};
