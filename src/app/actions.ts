
"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { matchRequestUsers, type MatchRequestUsersInput } from "@/ai/flows/match-request-users";
import { addRequest } from "@/lib/requests-store";

const requestFormSchema = z.object({
  amount: z.coerce.number(),
  type: z.enum(["cash", "digital"]),
  urgency: z.enum(["urgent", "flexible"]),
  duration: z.enum(["1", "3", "7"]),
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
  
  const { amount, type, urgency, duration } = validation.data;

  try {
    const newRequest = addRequest({
        amount,
        type,
        urgency,
        duration
    });

    const aiInput: MatchRequestUsersInput = {
        requestId: newRequest.id,
        amount: newRequest.amount,
        currency: newRequest.currency,
        cashOrDigital: newRequest.type,
        urgency: newRequest.urgency,
        duration: newRequest.duration,
        userPreferences: "Prefers users with quick response times.",
        user: {
            token: newRequest.user.token
        }
    };

    const aiResult = await matchRequestUsers(aiInput);

    revalidatePath("/");
    return { success: true, reasoning: aiResult.reasoning };

  } catch (error) {
    console.error("Error creating request:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
