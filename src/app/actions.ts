
"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { addRequest, updateRequest, deleteRequest } from "@/lib/requests-store";
import type { UserDetails } from "@/lib/user-store";

const requestFormSchema = z.object({
  id: z.string().optional(),
  amount: z.coerce.number(),
  type: z.enum(["cash", "digital"]),
  urgency: z.enum(["urgent", "flexible"]),
  duration: z.enum(["1", "3", "7"]),
});

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

export async function createOrUpdateRequestAction(
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

  const { id, ...requestData } = validation.data;

  try {
    if (id) {
      // Update existing request
      updateRequest(id, requestData, userDetails.token);
    } else {
      // Create new request
      addRequest(requestData, userDetails);
    }

    revalidatePath("/");
    return { success: true, reasoning: `Your request has been successfully ${id ? 'updated' : 'created'}.` };

  } catch (error) {
    console.error(`Error ${id ? 'updating' : 'creating'} request:`, error);
    if (error instanceof Error) {
        return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

export async function deleteRequestAction(
    requestId: string,
    userDetails: UserDetails | null
): Promise<ActionResponse> {
    if (!requestId) {
        return { success: false, error: "Request ID is required." };
    }

    const userValidation = userDetailsSchema.safeParse(userDetails);
    if (!userValidation.success || !userDetails) {
        return { success: false, error: "Invalid user details provided." };
    }

    try {
        deleteRequest(requestId, userDetails.token);
        revalidatePath("/");
        return { success: true, reasoning: "Your request has been deleted." };
    } catch (error) {
        console.error("Error deleting request:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "An unexpected error occurred. Please try again." };
    }
}
