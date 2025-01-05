import { PrismaClient } from "@prisma/client";

// 扩展 globalThis 类型以包含自定义的 PrismaClient 属性
declare global {
  // 防止 globalThis.prisma 属性在多个模块中重复定义
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const db: PrismaClient = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

/**
 * 在开发环境中，使用 Next.js 时，每次保存代码都会触发热重载，导致重新初始化 PrismaClient 实例。
 * 如果每次重载都创建新的 PrismaClient 实例，可能会迅速耗尽数据库连接资源。
 * 为避免这种情况，建议在开发环境中将 PrismaClient 实例挂载到全局对象 globalThis 上，以确保只创建一个实例。
 * 在生产环境中，由于应用通常只启动一次，因此不需要这种处理。
 */
