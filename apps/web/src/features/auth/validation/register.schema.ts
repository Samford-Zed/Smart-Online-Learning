import { z } from "zod";

export const registerSchema = z.object({
  role: z.enum(["student", "teacher", "parent"], {
    errorMap: () => ({ message: "Please select a role" }),
  }),
  fullName: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[a-z]/, "Include at least one lowercase letter")
    .regex(/[0-9]/, "Include at least one number"),
  gradeLevel: z.string().optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the Terms and Conditions" }),
  }),
}).refine((data) => data.role !== "student" || (data.gradeLevel && data.gradeLevel.length > 0), {
  message: "Grade level is required for students",
  path: ["gradeLevel"],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const registerDefaultValues: Partial<RegisterFormValues> = {
  fullName: "",
  email: "",
  password: "",
  gradeLevel: "",
  acceptTerms: undefined as unknown as true,
};
