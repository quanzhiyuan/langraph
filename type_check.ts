import { StateGraph, Annotation } from "@langchain/langgraph";

const StateAnnotation = Annotation.Root({
  topic: Annotation<string>,
  joke: Annotation<string>,
  improvedJoke: Annotation<string>,
  finalJoke: Annotation<string>,
});

const chain = new StateGraph(StateAnnotation);

// 输出类型信息
console.log("chain 的构造函数:", chain.constructor.name);
console.log("chain 的原型:", Object.getPrototypeOf(chain).constructor.name);
console.log("StateAnnotation 类型:", typeof StateAnnotation);
console.log("StateAnnotation.State 类型:", typeof StateAnnotation.State);
