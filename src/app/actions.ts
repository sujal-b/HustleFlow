"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { matchRequestUsers, type MatchRequestUsersInput } from "@/ai/flows/match-request-users";
import { addRequest } from "@/lib/requests-store";

const requestFormSchema = z.object({
  amount: z.coerce.number(),
  type: z.enum(["cash", "digital"]),
  urgency: z.enum(["urgent", "flexible"]),
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
  
  const { amount, type, urgency } = validation.data;

  try {
    const newRequest = addRequest({
        amount,
        type,
        urgency,
    });

    const aiInput: MatchRequestUsersInput = {
        requestId: newRequest.id,
        amount: newRequest.amount,
        currency: newRequest.currency,
        cashOrDigital: newRequest.type,
        urgency: newRequest.urgency,
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
