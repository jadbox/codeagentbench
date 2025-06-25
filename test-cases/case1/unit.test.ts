import { expect, test } from "bun:test";
// This test expects the generated solution to be in a file named `generated_solution.ts`
// in the same directory when `bun test` is run.
import { greet } from "./generated_solution"; 

test("greet function", () => {
  expect(greet("World")).toBe("Hello, World!");
  expect(greet("Bun")).toBe("Hello, Bun!");
});
