"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache"; //revalidatePath：用于在操作完成后重新验证指定路径的缓存（Next.js 的 ISR 功能）。

/** 序列化 */
const serializeTransaction = (obj) => {
  const serialized = { ...obj };

  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }

  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }

  return serialized;
};

/** 创建用户账户 */
export async function createAccount(data) {
  try {
    //验证用户身份
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) {
      throw new Error("User not found");
    }

    //创建账户时传入的账户余额，要转换为浮点数
    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance amount");
    }

    //如果当前创建的账户是第一个账户，则设为默认账户，否则根据传入的 idDefault 判断是否设置为默认账户
    const existingAccounts = await db.account.findMany({
      where: { userId: user.id },
    });
    const shouldBeDefault =
      existingAccounts.length === 0 ? true : data.isDefault;
    //if this account should be default, unset other default accounts
    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    //根据 data 创建账户
    const account = await db.account.create({
      data: {
        ...data,
        balance: balanceFloat,
        userId: user.id,
        isDefault: shouldBeDefault,
      },
    });

    //序列化
    const serializedAccount = serializeTransaction(account);
    revalidatePath("/dashboard");
    return { success: true, data: serializedAccount };
  } catch (error) {
    throw new Error(error.message);
  }
}

/** 获取用户账户 */
export async function getUserAccounts() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const accounts = await db.account.findMany({
    where: { userId: user.id }, //查询 userId 等于 user.id 的所有记录，确保只获取属于该用户的账户数据。
    orderBy: { createdAt: "desc" }, //表示按照 createdAt 字段的降序排序，即优先返回最新创建的账户。
    include: { _count: { select: { transactions: true } } }, //对每个账户，统计其关联的交易数量（transactions）
  });

  const serializedAccount = accounts.map((account) =>
    serializeTransaction(account)
  );
  return serializedAccount;
}
