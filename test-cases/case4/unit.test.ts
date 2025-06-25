import { describe, it, expect } from "bun:test";
// @ts-ignore: This file is expected to be modified by the agent
import { add, subtract, multiply } from "./src/mathOperations";

describe("mathOperations", () => {
  describe("add (modified)", () => {
    it("should sum an array of positive numbers", () => {
      expect(add([1, 2, 3])).toBe(6);
    });

    it("should sum an array containing negative numbers", () => {
      expect(add([1, -2, 3])).toBe(2);
    });

    it("should return 0 for an empty array", () => {
      expect(add([])).toBe(0);
    });

    it("should handle an array with a single number", () => {
      expect(add([5])).toBe(5);
    });

    it("should handle an array with zeros", () => {
      expect(add([0, 0, 0])).toBe(0);
    });

    it("should handle an array with numbers and zeros", () => {
      expect(add([1, 0, 2, 0, 3])).toBe(6);
    });
  });

  describe("subtract (unmodified)", () => {
    it("should subtract two numbers correctly", () => {
      expect(subtract(5, 3)).toBe(2);
    });

    it("should handle negative results", () => {
      expect(subtract(3, 5)).toBe(-2);
    });

    it("should handle subtraction with zero", () => {
      expect(subtract(5, 0)).toBe(5);
      expect(subtract(0, 5)).toBe(-5);
    });
  });

  describe("multiply (new)", () => {
    it("should multiply two positive numbers", () => {
      expect(multiply(2, 3)).toBe(6);
    });

    it("should multiply a positive and a negative number", () => {
      expect(multiply(2, -3)).toBe(-6);
    });

    it("should multiply two negative numbers", () => {
      expect(multiply(-2, -3)).toBe(6);
    });

    it("should multiply by zero", () => {
      expect(multiply(5, 0)).toBe(0);
      expect(multiply(0, 5)).toBe(0);
    });

     it("should multiply by one", () => {
      expect(multiply(5, 1)).toBe(5);
      expect(multiply(1, 5)).toBe(5);
    });
  });
});
