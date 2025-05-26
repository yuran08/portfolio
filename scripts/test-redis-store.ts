#!/usr/bin/env tsx

import {
  ConversationStore,
  MessageStore,
  DataMigration,
} from "../lib/redis-store";
import { testRedisConnection, closeRedisConnection } from "../lib/redis";

async function testRedisStore() {
  console.log("🧪 开始测试 Redis 存储功能...");

  try {
    // 测试 Redis 连接
    const isConnected = await testRedisConnection();
    if (!isConnected) {
      console.error("❌ Redis 连接失败，请确保 Redis 服务正在运行");
      process.exit(1);
    }

    // 清空测试数据
    console.log("🧹 清空测试数据...");
    await DataMigration.clearRedisData();

    // 测试创建对话
    console.log("📝 测试创建对话...");
    const conversation = await ConversationStore.create({
      title: "测试对话",
    });
    console.log("✅ 对话创建成功:", conversation);

    // 测试创建消息
    console.log("💬 测试创建消息...");
    const userMessage = await MessageStore.create({
      content: "你好，这是一条测试消息",
      role: "user",
      conversationId: conversation.id,
    });
    console.log("✅ 用户消息创建成功:", userMessage);

    const assistantMessage = await MessageStore.create({
      content: "你好！我是AI助手，很高兴为您服务。",
      role: "assistant",
      conversationId: conversation.id,
    });
    console.log("✅ 助手消息创建成功:", assistantMessage);

    // 测试获取对话
    console.log("🔍 测试获取对话...");
    const foundConversation = await ConversationStore.findById(conversation.id);
    console.log("✅ 对话获取成功:", foundConversation);

    // 测试获取消息列表
    console.log("📋 测试获取消息列表...");
    const messages = await MessageStore.findByConversationId(conversation.id);
    console.log("✅ 消息列表获取成功:", messages);

    // 测试获取所有对话
    console.log("📚 测试获取所有对话...");
    const allConversations = await ConversationStore.findMany();
    console.log("✅ 所有对话获取成功:", allConversations);

    // 测试更新对话
    console.log("✏️ 测试更新对话...");
    const updatedConversation = await ConversationStore.update(
      conversation.id,
      {
        title: "更新后的测试对话",
      }
    );
    console.log("✅ 对话更新成功:", updatedConversation);

    // 测试更新消息
    console.log("✏️ 测试更新消息...");
    const updatedMessage = await MessageStore.update(userMessage.id, {
      content: "这是更新后的测试消息",
    });
    console.log("✅ 消息更新成功:", updatedMessage);

    console.log("🎉 所有测试通过！Redis 存储功能正常工作。");
  } catch (error) {
    console.error("❌ 测试失败:", error);
    process.exit(1);
  } finally {
    // 关闭 Redis 连接
    await closeRedisConnection();
  }
}

// 运行测试
testRedisStore();
