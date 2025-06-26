import * as fs from "fs/promises";
import * as path from "path";
import { BenchmarkMetrics, AgentTool, LLMProvider } from "./src/types";

const RESULTS_DIR = path.join(process.cwd(), "results");
const RESULTS_MD_PATH = path.join(process.cwd(), "RESULTS.md");

async function collectMetrics(): Promise<BenchmarkMetrics[]> {
  const allMetrics: BenchmarkMetrics[] = [];
  try {
    const agentDirs = await fs.readdir(RESULTS_DIR, { withFileTypes: true });
    for (const agentDirent of agentDirs) {
      if (agentDirent.isDirectory()) {
        const agentPath = path.join(RESULTS_DIR, agentDirent.name);
        const testCaseLlmDirs = await fs.readdir(agentPath, {
          withFileTypes: true,
        });
        for (const tcLlmDirent of testCaseLlmDirs) {
          if (tcLlmDirent.isDirectory()) {
            const metricsFilePath = path.join(
              agentPath,
              tcLlmDirent.name,
              "metrics.json"
            );
            try {
              const metricsContent = await fs.readFile(
                metricsFilePath,
                "utf-8"
              );
              const metrics: BenchmarkMetrics = JSON.parse(metricsContent);
              allMetrics.push(metrics);
            } catch (error) {
              console.warn(
                `Could not read or parse metrics from ${metricsFilePath}:`,
                error
              );
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error collecting metrics:", error);
  }
  return allMetrics;
}

function generateMarkdownTable(headers: string[], rows: string[][]): string {
  let table = `| ${headers.join(" | ")} |\n`;
  table += `| ${headers.map(() => "---").join(" | ")} |\n`;
  for (const row of rows) {
    table += `| ${row.join(" | ")} |\n`;
  }
  return table;
}

function formatResults(metrics: BenchmarkMetrics[]): string {
  let content = "# Benchmark Results\n\n";
  content +=
    "This document summarizes the performance metrics of AI coding tools against various test cases.\n\n";

  if (metrics.length === 0) {
    content +=
      "No benchmark results available yet. Run `bun run ubench` to generate results.\n";
    return content;
  }

  const groupedByLlmProvider: {
    [llmProvider: string]: { [agent: string]: BenchmarkMetrics[] };
  } = {};

  for (const metric of metrics) {
    if (!groupedByLlmProvider[metric.llmProvider]) {
      groupedByLlmProvider[metric.llmProvider] = {};
    }
    if (!groupedByLlmProvider[metric.llmProvider][metric.agent]) {
      groupedByLlmProvider[metric.llmProvider][metric.agent] = [];
    }
    groupedByLlmProvider[metric.llmProvider][metric.agent].push(metric);
  }

  const agentAverages: {
    [agent: string]: {
      totalDuration: number;
      totalLineCount: number;
      count: number;
    };
  } = {};

  for (const llmProvider in groupedByLlmProvider) {
    content += `## LLM Provider: ${llmProvider}\n\n`;
    for (const agent in groupedByLlmProvider[llmProvider]) {
      content += `### Agent: ${agent}\n\n`;
      const headers = [
        "Test Case",
        "Line Count",
        "Duration (ms)",
        "Passed Unit Tests",
      ];

      const sortedMetrics = groupedByLlmProvider[llmProvider][agent].sort(
        (a, b) => a.testCaseId.localeCompare(b.testCaseId)
      );

      const rows = sortedMetrics.map((metric) => {
        if (!agentAverages[agent]) {
          agentAverages[agent] = {
            totalDuration: 0,
            totalLineCount: 0,
            count: 0,
          };
        }
        agentAverages[agent].totalDuration += metric.durationMs;
        agentAverages[agent].totalLineCount += metric.lineCount;
        agentAverages[agent].count++;

        return [
          metric.testCaseId,
          metric.lineCount.toString(),
          metric.durationMs.toString(),
          metric.passedUnitTests ? "✅ Yes" : "❌ No",
        ];
      });

      content += generateMarkdownTable(headers, rows);
      content += "\n";
    }
  }

  content += "## Summary\n\n";
  const summaryHeaders = ["Agent", "Avg. Line Count", "Avg. Duration (ms)"];
  const summaryRows = Object.entries(agentAverages).map(([agent, averages]) => {
    const avgLineCount = (averages.totalLineCount / averages.count).toFixed(2);
    const avgDuration = (averages.totalDuration / averages.count).toFixed(2);
    return [agent, avgLineCount, avgDuration];
  });
  content += generateMarkdownTable(summaryHeaders, summaryRows);

  return content;
}

async function main() {
  console.log("Collecting benchmark metrics...");
  const metrics = await collectMetrics();
  console.log(`Collected ${metrics.length} metric entries.`);

  const formattedContent = formatResults(metrics);
  await fs.writeFile(RESULTS_MD_PATH, formattedContent, "utf-8");
  console.log(`Updated ${RESULTS_MD_PATH}`);
}

main().catch(console.error);
