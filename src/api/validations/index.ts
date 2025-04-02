import { z } from "zod";


const transactionSchema = z.object({
  accountId: z.string().min(1, "Account ID is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  currency: z.enum(["USD", "NGN", "EUR"], { message: "Invalid currency type" }),
});

const transferSchema = z.object({
    fromAccountId: z.string(),
    toAccountId: z.string(),
    currency: z.enum(["USD", "NGN", "EUR"], { message: "Invalid currency type" }),
    amount: z.number()
});

const registerSchema = z.object({
    email: z.string().min(10).max(200),
    password: z.string().min(5),
    currency: z.string()
})

export { transactionSchema, transferSchema, registerSchema };