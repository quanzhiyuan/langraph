// agent.mts

// IMPORTANT - Add your API keys here. Be careful not to publish them.
process.env.TAVILY_API_KEY = "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"

console.log("🚀 开始初始化 Agent...")

import { TavilySearch } from "@langchain/tavily"
import { ChatDeepSeek } from "@langchain/deepseek"
import { MemorySaver } from "@langchain/langgraph"
import { HumanMessage } from "@langchain/core/messages"
import { createReactAgent } from "@langchain/langgraph/prebuilt"

console.log("✅ 导入模块完成")

// Define the tools for the agent to use
console.log("🔧 正在初始化工具和模型...")
const agentTools = [new TavilySearch({ maxResults: 5 })]
console.log("✅ Tavily搜索工具初始化完成")

const agentModel = new ChatDeepSeek({ model: "deepseek-chat", temperature: 0 })
console.log("✅ DeepSeek模型初始化完成")

// Initialize memory to persist state between graph runs
console.log("💾 正在初始化内存保存器...")
const agentCheckpointer = new MemorySaver()
console.log("✅ 内存保存器初始化完成")

console.log("🤖 正在创建React Agent...")
const agent = createReactAgent({
    llm: agentModel,
    tools: agentTools,
    checkpointSaver: agentCheckpointer,
})
console.log("✅ React Agent创建完成")

// Now it's time to use!
console.log("\n🌟 开始第一次查询: 旧金山天气...")
try {
    const agentFinalState = await agent.invoke(
        { messages: [new HumanMessage("what is the current weather in sf")] },
        { configurable: { thread_id: "42" } }
    )
    console.log("✅ 第一次查询完成")

    console.log("📝 第一次查询结果:")
    console.log(
        agentFinalState?.messages?.[agentFinalState?.messages?.length - 1]
            ?.content
    )

    console.log("\n🌟 开始第二次查询: 纽约天气...")
    const agentNextState = await agent.invoke(
        { messages: [new HumanMessage("what about ny")] },
        { configurable: { thread_id: "42" } }
    )
    console.log("✅ 第二次查询完成")

    console.log("📝 第二次查询结果:")
    console.log(
        agentNextState?.messages?.[agentNextState?.messages?.length - 1]
            ?.content
    )

    console.log("\n🎉 所有查询完成!")
} catch (error: any) {
    console.error("❌ 执行过程中出现错误:", error)
    console.error("错误堆栈:", error.stack)
}
