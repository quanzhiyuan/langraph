import { LLM } from "./LLMServer"
import { tool } from "@langchain/core/tools"
import { z } from "zod"
import type { BaseChatModel } from "@langchain/core/language_models/chat_models"

const llm: BaseChatModel = new LLM().getLLM()

const searchQuerySchema = z.object({
    searchQuery: z.string().describe("Query that is optimized web search."),
    justification: z.string({
        description: "Why this query is relevant to the user's request.",
    }),
})

// Augment the LLM with schema for structured output
const structuredLlm = llm.withStructuredOutput(searchQuerySchema, {
    name: "searchQuery",
})

// Invoke the augmented LLM
const output = await structuredLlm.invoke(
    "How does Calcium CT score relate to high cholesterol?"
)

console.log("output", output)

const multiply = tool(
    async ({ a, b }) => {
        return a * b
    },
    {
        name: "multiply",
        description: "multiplies two numbers together",
        schema: z.object({
            a: z.number().describe("the first number"),
            b: z.number().describe("the second number"),
        }),
    }
)

// Augment the LLM with tools
// 确保 llm 对象存在且有 bindTools 方法
const llmWithTools = llm?.bindTools?.([multiply]) ?? llm

// Invoke the LLM with input that triggers the tool call
const message = await llmWithTools.invoke("What is 2 times 3?")

console.log(message.tool_calls)
