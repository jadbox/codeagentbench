import * as fs from "fs/promises";
import * as path from "path";
import { $ } from "bun";
import { AgentTool, BenchmarkMetrics, LLMProvider, TestCase } from "./types";

const RESULTS_DIR = path.join(process.cwd(), "results");
const TEMP_DIR = path.join(process.cwd(), "temp_benchmark_run");

async function ensureDir(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error: any) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
}

async function countLines(filePath: string): Promise<number> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return content.split("\n").length;
  } catch (error) {
    console.error(`Error reading file ${filePath} for line count:`, error);
    return 0;
  }
}

// Placeholder for actual agent interaction
async function runAgent(
  agent: AgentTool,
  promptContent: string,
  outputFilePath: string,
  llmProvider: LLMProvider,
  testCase: TestCase
): Promise<{ durationMs: number }> {
  const startTime = Date.now();
  console.log(
    `Simulating ${agent} run for test case ${testCase.id} with ${llmProvider}...`
  );

  // In a real scenario, you would invoke the agent's CLI here.
  // e.g., await $`aider --model <model_for_llmProvider> ${promptFilePath} -o ${outputFilePath}`;
  // For now, we'll copy the reference solution to simulate agent output.
  try {
    // Check if the reference solution exists
    await fs.access(testCase.referenceSolutionPath);
    await fs.copyFile(testCase.referenceSolutionPath, outputFilePath);
    console.log(`Copied reference solution to ${outputFilePath}`);
  } catch (error) {
    // If reference solution doesn't exist or other error, create a placeholder file
    console.warn(
      `Could not copy reference solution for ${testCase.id}. A placeholder file will be used.`
    );
    await fs.writeFile(
      outputFilePath,
      "// Agent to generate solution here",
      "utf-8"
    );
  }

  const durationMs = Date.now() - startTime;
  console.log(`${agent} simulation finished in ${durationMs}ms.`);
  return { durationMs };
}

async function runUnitTests(
  testCase: TestCase,
  generatedSolutionPath: string
): Promise<{ passed: boolean; output: string; durationMs: number }> {
  const testDir = path.dirname(testCase.unitTestPath);
  const testFileName = path.basename(testCase.unitTestPath);

  // Create a temporary directory for running this specific test
  const tempTestRunDir = path.join(
    TEMP_DIR,
    `test_run_${testCase.id}_${Date.now()}`
  );
  await ensureDir(tempTestRunDir);

  const tempUnitTestPath = path.join(tempTestRunDir, testFileName);
  const tempGeneratedSolutionPath = path.join(
    tempTestRunDir,
    "generated_solution.ts"
  ); // The file unit test will import

  let durationMs = 0;

  try {
    // Copy all files from the original test case directory to the temporary one
    const testCaseDir = path.dirname(testCase.unitTestPath);
    await fs.cp(testCaseDir, tempTestRunDir, { recursive: true });

    // Overwrite the generated solution file in the temporary directory
    await fs.copyFile(generatedSolutionPath, tempGeneratedSolutionPath);

    console.log(`Running unit tests for ${testCase.id} in ${tempTestRunDir}`);
    // The unit test file (e.g., unit.test.ts) should import from "./generated_solution.ts"
    const { stdout, stderr, exitCode } = await $`bun test`
      .cwd(tempTestRunDir)
      .nothrow();

    const output = `Stdout:\n${stdout.toString()}\nStderr:\n${stderr.toString()}`;
    console.log(`Unit test for ${testCase.id} exited with code ${exitCode}.`);

    // Extract duration from bun test output
    const durationMatch = output.match(
      /Ran \d+ tests across \d+ files\. \[(\d+\.\d+)ms\]/
    );
    if (durationMatch && durationMatch[1]) {
      durationMs = parseFloat(durationMatch[1]);
    }

    return { passed: exitCode === 0, output, durationMs };
  } catch (error: any) {
    console.error(`Error running unit tests for ${testCase.id}:`, error);
    return {
      passed: false,
      output: `Error during test execution: ${error.message}`,
      durationMs: 0,
    };
  } finally {
    // Clean up the temporary test run directory
    await fs.rm(tempTestRunDir, { recursive: true, force: true });
    console.log(`Cleaned up temporary test directory: ${tempTestRunDir}`);
  }
}

export async function runSingleBenchmark(
  testCase: TestCase,
  agent: AgentTool,
  llmProvider: LLMProvider
): Promise<BenchmarkMetrics> {
  console.log(
    `\nStarting benchmark for: ${agent}, Test Case: ${testCase.id}, LLM: ${llmProvider}`
  );

  const agentResultDir = path.join(
    RESULTS_DIR,
    agent.toString(),
    `${testCase.id}_${llmProvider}`
  );
  await ensureDir(agentResultDir);
  await ensureDir(TEMP_DIR);

  const generatedSolutionPath = path.join(
    TEMP_DIR,
    `${testCase.id}_${agent}_${llmProvider}_solution.ts`
  );
  const promptContent = await fs.readFile(testCase.promptPath, "utf-8");

  // Simulate agent running and generating the solution
  const agentRunDurationMs = await runAgent(
    agent,
    promptContent,
    generatedSolutionPath,
    llmProvider,
    testCase
  );

  // Calculate line count of the generated solution
  const lineCount = await countLines(generatedSolutionPath);

  // Run unit tests on the generated solution
  const {
    passed: passedUnitTests,
    output: unitTestOutput,
    durationMs: unitTestDurationMs,
  } = await runUnitTests(testCase, generatedSolutionPath);

  // Save the generated solution to the results directory
  const finalOutputFilePath = path.join(
    agentResultDir,
    "generated_solution.ts"
  );
  await fs.copyFile(generatedSolutionPath, finalOutputFilePath);

  const metrics: BenchmarkMetrics = {
    agent,
    testCaseId: testCase.id,
    llmProvider,
    lineCount,
    durationMs: unitTestDurationMs,
    passedUnitTests,
    unitTestOutput,
  };

  const metricsFilePath = path.join(agentResultDir, "metrics.json");
  await fs.writeFile(
    metricsFilePath,
    JSON.stringify(metrics, null, 2),
    "utf-8"
  );

  console.log(
    `Metrics for ${agent}, ${testCase.id}, ${llmProvider} saved to ${metricsFilePath}`
  );
  console.log(metrics);

  // Clean up temporary generated solution file
  await fs.rm(generatedSolutionPath, { force: true });
  console.log(
    `Cleaned up temporary generated solution file: ${generatedSolutionPath}`
  );

  return metrics;
}

export async function cleanupTempDir() {
  try {
    if (await fs.exists(TEMP_DIR)) {
      console.log(`Cleaning up temporary benchmark directory: ${TEMP_DIR}`);
      await fs.rm(TEMP_DIR, { recursive: true, force: true });
    }
  } catch (error) {
    console.error(`Error cleaning up temporary directory ${TEMP_DIR}:`, error);
  }
}
