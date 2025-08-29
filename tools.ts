import { CompiledStateGraph } from "@langchain/langgraph";
import { writeFileSync } from "fs";

export async function saveGraphImg(
  app: CompiledStateGraph<any, any, any>,
  filePath: string = "./image/graphState.png"
) {
  const graph = await app.getGraphAsync();
  const image = await graph.drawMermaidPng();
  const arrayBuffer = await image.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  writeFileSync(filePath, buffer);
  console.log(`💾 图表已保存到: ${filePath}`);
}
