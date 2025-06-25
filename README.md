# Code Agent Benchmark - !ALPHA!
========================

This repository contains a benchmark for evaluating code generation models, specifically designed to assess their performance in generating code that passes unit tests. 

This benchmark is made using Bun that the CLI returns results of Aider and Opencode using the same LLM model. The project should test the effectiveness of different coding tools while utilizing the same model. Key metrics are line count of solution, time duration, if it passed unit tests. The CLI should have parameter to use Gemini, OpenAI, or Claude Sonnet. When specified, the CLI uses standard ENV keys for each service. The project bench should create a folder for the results of each agent tool result. 

It was start with just making 2 simple tests.

## Installation
```bash
bun install
```
## Usage
```bash
 bun run index.ts --llm gemini
```

## WIP Results
See RESULTS.md# AI Coding Agent Benchmark

## Overview

This project provides a benchmark suite for evaluating the performance of various AI coding agent tools. The primary goal is to assess the capabilities of these agents in understanding prompts, generating code, and passing unit tests, rather than evaluating the underlying Large Language Models (LLMs) themselves.

The benchmark framework is designed to be extensible, allowing for the easy addition of new test cases, AI agents, and LLM providers.

## Goal

The main objective of this benchmark is to provide a standardized way to measure and compare the effectiveness of different AI coding agents (e.g., Aider, Opencode). We aim to understand how well these tools can:

*   Interpret complex coding prompts.
*   Generate functional and correct code.
*   Iterate on solutions based on feedback (if applicable to the agent's workflow).
*   Integrate with existing testing frameworks.

This benchmark focuses on the agent's ability to utilize LLMs to produce working code, not on the raw output quality of the LLMs in isolation.

## Features

*   Run benchmarks for different AI coding agents.
*   Support for multiple LLM providers (OpenAI, Gemini, Claude).
*   Automated execution of unit tests against generated code.
*   Metrics collection: duration, line count, test pass/fail.
*   Extensible test case system.

## Prerequisites

*   [Bun](https://bun.sh/) installed.
*   API keys for the desired LLM providers set as environment variables (e.g., `OPENAI_API_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`).

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/ai-coding-benchmark.git
    cd ai-coding-benchmark
    ```
2.  Install dependencies:
    ```bash
    bun install
    ```

## Usage

### Running Benchmarks

The main script `index.ts` is used to run benchmarks. It accepts command-line options to specify the agent, LLM provider, and optionally a specific test case.

To run all test cases with the default LLM provider (Gemini) and for all configured agents:
```bash
bun run start
```

To specify an LLM provider:
```bash
bun run start --llm openai
```
*(Note: The script currently iterates through predefined agents. You might want to add an `--agent` option if you want to run for a single agent.)*

Supported LLM providers: `openai`, `gemini`, `claude` (as defined in `src/types.ts`).

The `package.json` includes a `ubench` script as an example:
```bash
bun run ubench
```
This specific command runs benchmarks with Gemini and then (presumably) updates results using `update-results.ts`. You can customize or add more scripts for different scenarios.

### Viewing Results

Benchmark results, including generated code and metrics, are saved in the `results/` directory, organized by agent, test case, and LLM provider.

## Test Cases

Test cases are located in the `test-cases/` directory. Each test case is a subdirectory containing:

*   `prompt.txt`: The natural language prompt for the AI agent.
*   `reference_solution.ts` (optional): A reference implementation for the problem.
*   `unit.test.ts`: Unit tests to verify the correctness of the generated solution.

### Adding a New Test Case

1.  Create a new directory under `test-cases/`, e.g., `test-cases/caseN`.
2.  Inside `test-cases/caseN/`, add:
    *   `prompt.txt` with the problem description.
    *   `unit.test.ts` with the Bun test (or other testing framework) spec.
    *   Optionally, a `reference_solution.ts` file.
3.  The benchmark runner (`index.ts`) will automatically discover and execute new test cases.

## Project Structure

```
.
├── index.ts                # Main script to run benchmarks
├── src/
│   ├── benchmark.ts        # Core benchmarking logic
│   ├── config.ts           # Configuration management (e.g., API keys)
│   └── types.ts            # TypeScript interfaces and enums
├── test-cases/             # Directory containing all test cases
│   ├── case1/
│   │   ├── prompt.txt
│   │   ├── reference_solution.ts
│   │   └── unit.test.ts
│   └── ...                 # Other test cases
├── results/                # Directory where benchmark results are stored
├── temp_benchmark_run/     # Temporary directory for benchmark execution (can be .gitignored)
├── package.json
├── tsconfig.json
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs, feature requests, or new test cases.

When contributing:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes.
4.  Ensure your code lints and tests pass.
5.  Submit a pull request with a clear description of your changes.

## License

This project is licensed under the MIT License. You will need to create a `LICENSE` file containing the MIT License text.
(Example: https://opensource.org/licenses/MIT)
