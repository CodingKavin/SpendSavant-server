import { describe, it, expect } from "vitest";
import { 
  validateExpense, 
  validateExpenseUpdate, 
  validateBudget 
} from "../utils/expenseValidation.js";

describe("Expense Validation Utilities", () => {
  
  describe("validateExpense", () => {
    const validExpense = {
      category: "Food",
      amount: 42.50,
      date: "2026-05-16",
      description: "Groceries",
      recurrence: "none"
    };

    it("should return null for a perfectly valid expense payload", () => {
      const result = validateExpense(validExpense);
      expect(result).toBeNull();
    });

    it("should return null when optional fields like recurrence are omitted", () => {
      const { recurrence, ...optionalOmitted } = validExpense;
      const result = validateExpense(optionalOmitted);
      expect(result).toBeNull();
    });

    it("should reject invalid enum values for category", () => {
      const invalidData = { ...validExpense, category: "Crypto Investments" };
      const result = validateExpense(invalidData);
      
      expect(result).not.toBeNull();
      expect(result![0].path).toContain("category");
    });

    it("should enforce strict positive numbers for amount", () => {
      const zeroAmount = validateExpense({ ...validExpense, amount: 0 });
      expect(zeroAmount).not.toBeNull();
      expect(zeroAmount![0].path).toContain("amount");

      const negativeAmount = validateExpense({ ...validExpense, amount: -10.50 });
      expect(negativeAmount).not.toBeNull();
    });

    it("should catch invalid date strings", () => {
      const invalidDate = validateExpense({ ...validExpense, date: "not-a-date" });
      expect(invalidDate).not.toBeNull();
      expect(invalidDate![0].message).toBe("Invalid date");
    });

    it("should reject empty strings or missing characters for description", () => {
      const emptyDesc = validateExpense({ ...validExpense, description: "" });
      expect(emptyDesc).not.toBeNull();
      expect(emptyDesc![0].path).toContain("description");
    });
  });

  describe("validateExpenseUpdate", () => {
    it("should allow a completely empty object since all fields are partial", () => {
      const result = validateExpenseUpdate({});
      expect(result).toBeNull();
    });

    it("should validate specific fields if they are explicitly passed during an update", () => {
      const validPartial = validateExpenseUpdate({ amount: 150.00 });
      expect(validPartial).toBeNull();

      const invalidPartial = validateExpenseUpdate({ amount: -5 });
      expect(invalidPartial).not.toBeNull();
      expect(invalidPartial![0].path).toContain("amount");
    });
  });

  describe("validateBudget", () => {
    const validBudget = {
      user_id: "user_123abc",
      month: 5,
      year: 2026,
      amount: 2500.00
    };

    it("should pass for a valid budget object", () => {
      const result = validateBudget(validBudget);
      expect(result).toBeNull();
    });

    it("should accept exactly zero for budget amounts", () => {
      const zeroBudget = validateBudget({ ...validBudget, amount: 0 });
      expect(zeroBudget).toBeNull();
    });

    it("should enforce month limits between 1 and 12 inclusively", () => {
      const monthTooLow = validateBudget({ ...validBudget, month: 0 });
      expect(monthTooLow).not.toBeNull();

      const monthTooHigh = validateBudget({ ...validBudget, month: 13 });
      expect(monthTooHigh).not.toBeNull();

      const monthFloat = validateBudget({ ...validBudget, month: 5.5 });
      expect(monthFloat).not.toBeNull();
    });

    it("should enforce year boundary conditions greater than or equal to 2000", () => {
      const year1999 = validateBudget({ ...validBudget, year: 1999 });
      expect(year1999).not.toBeNull();

      const year2000 = validateBudget({ ...validBudget, year: 2000 });
      expect(year2000).toBeNull();
    });

    it("should reject budgets with empty user IDs", () => {
      const missingUser = validateBudget({ ...validBudget, user_id: "" });
      expect(missingUser).not.toBeNull();
    });
  });
});