import { expect, test } from "bun:test";
// This test expects the generated solution to be in a file named `generated_solution.ts`
// in the same directory when `bun test` is run.
import { sumArray } from "./generated_solution";

test("sumArray function", () => {
  expect(sumArray([1, 2, 3])).toBe(6);
  expect(sumArray([-1, 0, 1])).toBe(0);
  expect(sumArray([])).toBe(0);
  expect(sumArray([10])).toBe(10);
});
