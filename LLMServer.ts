import { ChatDeepSeek } from "@langchain/deepseek"
import type { BaseChatModel } from "@langchain/core/language_models/chat_models"

export class LLM {
    llm: BaseChatModel
    constructor() {
        this.llm = new ChatDeepSeek({
            model: "deepseek-chat",
            temperature: 0,
        })
    }
    getLLM() {
        return this.llm
    }
}
