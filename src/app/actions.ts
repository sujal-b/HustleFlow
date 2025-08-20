
"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { addRequest } from "@/lib/requests-store";
import type { UserDetails } from "@/lib/user-store";

const requestFormSchema = z.object({
  amount: z.coerce.number(),
  type: z.enum(["cash", "digital"]),
  urgency: z.enum(["urgent", "flexible"]),
  duration: z.enum(["1", "3", "7"]),
});

// The userDetails object coming from the client will have all the fields from the UserDetails type
const userDetailsSchema = z.object({
    token: z.string(),
    name: z.string(),
    anonymousName: z.string(),
    room: z.string(),
    contact: z.string().optional(),
    expiresAt: z.number(),
});


type ActionResponse = {
  success: boolean;
  error?: string;
  reasoning?: string;
};

export async function createRequestAction(
  data: z.infer<typeof requestFormSchema>,
  userDetails: UserDetails | null,
): Promise<ActionResponse> {
  const validation = requestFormSchema.safeParse(data);
  if (!validation.success) {
    console.error("Form validation failed:", validation.error);
    return { success: false, error: "Invalid form data provided." };
  }
  
  const userValidation = userDetailsSchema.safeParse(userDetails);
   if (!userValidation.success || !userDetails) {
    console.error("User details validation failed:", userValidation.error);
    return { success: false, error: "Invalid user details provided." };
  }

  const { amount, type, urgency, duration } = validation.data;

  try {
    addRequest({
        amount,
        type,
        urgency,
        duration
    }, userDetails);

    revalidatePath("/");
    return { success: true, reasoning: "Your request has been successfully created and is now visible to others." };

  } catch (error) {
    console.error("Error creating request:", error);
    if (error instanceof Error) {
        return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
