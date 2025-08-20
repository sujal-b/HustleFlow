"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { matchRequestUsers, type MatchRequestUsersInput } from "@/ai/flows/match-request-users";
import { addRequest } from "@/lib/requests-store";
import type { Currency } from "@/lib/types";

const requestFormSchema = z.object({
  amount: z.coerce.number(),
  currency: z.enum(["USD", "EUR", "GBP", "JPY"]),
  type: z.enum(["cash", "digital"]),
  location: z.string().optional(),
});

type ActionResponse = {
  success: boolean;
  error?: string;
  reasoning?: string;
};

export async function createRequestAction(
  data: z.infer<typeof requestFormSchema>
): Promise<ActionResponse> {
  const validation = requestFormSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: "Invalid form data provided." };
  }
  
  const { amount, currency, type, location } = validation.data;

  try {
    const newRequest = addRequest({
        amount,
        currency: currency as Currency,
        type,
        location,
    });

    const aiInput: MatchRequestUsersInput = {
        requestId: newRequest.id,
        amount: newRequest.amount,
        currency: newRequest.currency,
        cashOrDigital: newRequest.type,
        location: newRequest.location,
        userPreferences: "Prefers users with high ratings and quick response times."
    };

    const aiResult = await matchRequestUsers(aiInput);

    revalidatePath("/");
    return { success: true, reasoning: aiResult.reasoning };

  } catch (error) {
    console.error("Error creating request:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
