import { StateGraph, Annotation } from "@langchain/langgraph";

const StateAnnotation = Annotation.Root({
  topic: Annotation<string>,
});

const chain = new StateGraph(StateAnnotation)
  .addNode("test", (state) => ({ topic: "test" }))
  .addEdge("__start__", "test")
  .addEdge("test", "__end__")
  .compile();

console.log("=== 检查绘图相关方法 ===");
console.log("drawMermaidPng:", typeof chain.drawMermaidPng);
console.log("drawMermaid:", typeof chain.drawMermaid);
console.log("getGraph:", typeof chain.getGraph);
console.log("getGraphAsync:", typeof chain.getGraphAsync);

// 尝试调用 getGraph 方法
try {
  const graph = chain.getGraph();
  console.log("\n=== Graph 对象信息 ===");
  console.log("Graph 类型:", typeof graph);
  console.log("Graph 构造函数:", graph.constructor.name);
  console.log("Graph 方法:", Object.getOwnPropertyNames(Object.getPrototypeOf(graph)).filter(name => typeof graph[name] === 'function'));
  
  // 检查 graph 对象是否有绘图方法
  console.log("\n=== Graph 绘图方法 ===");
  console.log("graph.drawMermaidPng:", typeof graph.drawMermaidPng);
  console.log("graph.drawMermaid:", typeof graph.drawMermaid);
} catch (error) {
  console.log("获取 graph 时出错:", error.message);
}
