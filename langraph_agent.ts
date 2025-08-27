// agent.mts

// IMPORTANT - Add your API keys here. Be careful not to publish them.
process.env.TAVILY_API_KEY = "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";

console.log("🚀 开始初始化 LangGraph Agent...");

import { TavilySearch } from "@langchain/tavily";
import { ChatDeepSeek } from "@langchain/deepseek";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { writeFileSync } from "node:fs";
import terminalImage from "terminal-image";
console.log("✅ 模块导入完成");

// Define the tools for the agent to use
console.log("🔧 正在初始化工具...");
const tools = [new TavilySearch({ maxResults: 3 })];
console.log("✅ Tavily搜索工具创建完成");

const toolNode = new ToolNode(tools);
console.log("✅ 工具节点创建完成");

// Create a model and give it access to the tools
console.log("🤖 正在初始化模型...");
const model = new ChatDeepSeek({
  model: "deepseek-chat",
  temperature: 0,
}).bindTools(tools);
console.log("✅ DeepSeek模型初始化并绑定工具完成");

// Define the function that determines whether to continue or not
function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
  console.log("🔀 正在判断执行路径...");
  const lastMessage = messages[messages.length - 1] as AIMessage;

  // If the LLM makes a tool call, then we route to the "tools" node
  if (lastMessage.tool_calls?.length) {
    console.log("🛠️ 检测到工具调用，路由到工具节点");
    return "tools";
  }
  // Otherwise, we stop (reply to the user) using the special "__end__" node
  console.log("✅ 无工具调用，准备结束执行");
  return "__end__";
}

// Define the function that calls the model
async function callModel(state: typeof MessagesAnnotation.State) {
  console.log("🧠 正在调用模型...");
  console.log(`📝 当前消息数量: ${state.messages.length}`);

  const response = await model.invoke(state.messages);
  console.log("✅ 模型调用完成");

  if (response.tool_calls?.length) {
    console.log(`🔧 模型返回了 ${response.tool_calls.length} 个工具调用`);
  } else {
    console.log("💬 模型返回了文本响应");
  }

  // We return a list, because this will get added to the existing list
  return { messages: [response] };
}
// Define a new graph
console.log("📊 正在构建状态图...");
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge("__start__", "agent") // __start__ is a special name for the entrypoint
  .addNode("tools", toolNode)
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue);
console.log("✅ 状态图构建完成");

// Finally, we compile it into a LangChain Runnable.
console.log("⚙️ 正在编译工作流...");
const app = workflow.compile();
console.log("✅ 工作流编译完成");

// 可视化状态图
console.log("\n📊 状态图结构可视化:");
try {
  // 获取图的表示
  const graph = await app.getGraphAsync();

  // 获取Mermaid图表代码
  console.log("🎨 Mermaid图表代码 (可复制到 https://mermaid.live 查看):");
  // const mermaidCode = await graph.drawMermaid();
  // console.log(mermaidCode)
  // 尝试生成PNG并在控制台预览
  console.log("\n🖼️ 正在生成图表PNG并在控制台预览...");
  const image = await graph.drawMermaidPng();
  const arrayBuffer = await image.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 保存PNG图片到文件
  const filePath = "./image/graphState.png";
  writeFileSync(filePath, buffer);
  console.log(`💾 图表已保存到: ${filePath}`);

  // 在控制台显示图片预览
  console.log("📸 状态图预览 (如需查看清晰图表，请打开上述文件):");
  console.log(
    await terminalImage.buffer(buffer, { width: "50%", height: "50%" })
  );
  console.log("✅ 图表已在控制台显示");
} catch (error: any) {
  console.log("⚠️ 图表可视化功能:", error.message);
}

// Use the agent
console.log("\n🌟 开始第一次查询: 旧金山天气...");
try {
  const finalState = await app.invoke({
    messages: [new HumanMessage("what is the weather in sf")],
  });
  console.log("✅ 第一次查询执行完成");
  // 检查 finalState 和 messages 是否存在，并获取最后一条消息的内容
  console.log("📝 第一次查询结果:");
  console.log(finalState?.messages?.[finalState.messages?.length - 1]?.content);

  console.log("\n🌟 开始第二次查询: 纽约天气...");
  const nextState = await app.invoke({
    // Including the messages from the previous run gives the LLM context.
    // This way it knows we're asking about the weather in NY
    messages: [...finalState.messages, new HumanMessage("what about ny")],
  });
  console.log("✅ 第二次查询执行完成");

  // 检查 nextState 和 messages 是否存在，并获取最后一条消息的内容
  console.log("📝 第二次查询结果:");
  console.log(nextState?.messages?.[nextState.messages?.length - 1]?.content);

  console.log("\n🎉 所有查询完成!");
} catch (error: any) {
  console.error("❌ 执行过程中出现错误:", error);
  console.error("错误堆栈:", error.stack);
}
