import { z } from "zod";

const expenseSchema = z.object({
    category: z.string().min(1),
    amount: z.number().positive(),
    date: z.string().refine(d => !isNaN(Date.parse(d)), "Invalid date"),
    description: z.string().min(1),
    recurrence: z.enum(["daily", "weekly", "monthly"]).optional(),
});

const expenseUpdateSchema = expenseSchema.partial();

export function validateExpense(data) {
    const parsed = expenseSchema.safeParse(data);
    if (!parsed.success) {
        return parsed.error.errors;
    }
    return null;
}

export function validateExpenseUpdate(data) {
    const parsed = expenseUpdateSchema.safeParse(data);
    if (!parsed.success) return parsed.error.errors;
    return null;
}