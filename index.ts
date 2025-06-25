import { Command } from 'commander';
import { LLMProvider, AgentTool, TestCase } from './src/types';
import { getApiKey } from './src/config';
import { runSingleBenchmark, cleanupTempDir } from './src/benchmark';
import * as fs from 'fs/promises';
import * as path from 'path';

const program = new Command();

program
  .name('ai-coding-benchmark')
  .description('CLI to benchmark AI coding tools')
  .requiredOption('--llm <provider>', `LLM provider to use: ${Object.values(LLMProvider).join(', ')}`)
  .parse(process.argv);

const options = program.opts();
const llmProvider = options.llm as LLMProvider;

if (!Object.values(LLMProvider).includes(llmProvider)) {
  console.error(`Invalid LLM provider: ${llmProvider}`);
  console.error(`Available providers: ${Object.values(LLMProvider).join(', ')}`);
  process.exit(1);
}

const apiKey = getApiKey(llmProvider);
if (!apiKey) {
  console.error(`API key for ${llmProvider} is not set. Please set the appropriate environment variable.`);
  // For Gemini: GEMINI_API_KEY
  // For OpenAI: OPENAI_API_KEY
  // For Claude: ANTHROPIC_API_KEY
  process.exit(1);
}
console.log(`Using LLM provider: ${llmProvider}`);

// Define test cases
// In a real app, you might scan a directory or use a config file
const TEST_CASES_DIR = path.join(process.cwd(), "test-cases");

async function loadTestCases(): Promise<TestCase[]> {
    const cases: TestCase[] = [];
    const caseDirs = await fs.readdir(TEST_CASES_DIR, { withFileTypes: true });
    for (const dirent of caseDirs) {
        if (dirent.isDirectory()) {
            const caseId = dirent.name;
            const casePath = path.join(TEST_CASES_DIR, caseId);
            cases.push({
                id: caseId,
                promptPath: path.join(casePath, "prompt.txt"),
                referenceSolutionPath: path.join(casePath, "reference_solution.ts"),
                unitTestPath: path.join(casePath, "unit.test.ts"),
            });
        }
    }
    return cases;
}


async function main() {
  const testCases = await loadTestCases();
  if (testCases.length === 0) {
    console.log("No test cases found.");
    return;
  }
  console.log(`Found ${testCases.length} test cases: ${testCases.map(tc => tc.id).join(', ')}`);

  const agentsToTest: AgentTool[] = [AgentTool.Aider, AgentTool.Opencode];

  for (const testCase of testCases) {
    for (const agent of agentsToTest) {
      try {
        await runSingleBenchmark(testCase, agent, llmProvider);
      } catch (error) {
        console.error(`Error running benchmark for ${agent}, ${testCase.id}, ${llmProvider}:`, error);
      }
    }
  }
  
  await cleanupTempDir();
  console.log("\nAll benchmarks completed.");
}

main().catch(error => {
  console.error("Unhandled error in main:", error);
  cleanupTempDir().finally(() => process.exit(1));
});
