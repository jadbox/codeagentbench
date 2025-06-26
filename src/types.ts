export enum LLMProvider {
  Gemini = "gemini",
  OpenAI = "openai",
  Claude = "claude",
}

export enum AgentTool {
  Aider = "aider",
  Opencode = "opencode",
}

export interface BenchmarkMetrics {
  agent: AgentTool;
  testCaseId: string;
  llmProvider: LLMProvider;
  lineCount: number;
  durationMs: number;
  passedUnitTests: boolean;
  unitTestOutput: string;
}

export interface BenchmarkResult extends BenchmarkMetrics {
  agent: AgentTool;
  testCase: string;
  llmProvider: LLMProvider;
  outputFilePath?: string;
  error?: string;
}

export interface TestCase {
  id: string;
  promptPath: string;
  referenceSolutionPath: string;
  unitTestPath: string;
}
