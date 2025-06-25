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
See RESULTS.md