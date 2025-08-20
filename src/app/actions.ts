
"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { addRequest, updateRequest, deleteRequest, makeOffer, acceptOffer, rejectOffer } from "@/lib/requests-store";
import type { UserDetails } from "@/lib/user-store";

// Schema for creating a request (no ID)
const createRequestFormSchema = z.object({
  amount: z.coerce.number(),
  type: z.enum(["cash", "digital"]),
  urgency: z.enum(["urgent", "flexible"]),
  duration: z.enum(["1", "3", "7"]),
});

// Schema for updating a request (requires ID)
const updateRequestFormSchema = z.object({
  id: z.string(),
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

const makeOfferSchema = z.object({
  requestId: z.string(),
  offerAmount: z.coerce.number().min(1, "Offer must be at least 1."),
});


type ActionResponse = {
  success: boolean;
  error?: string;
  reasoning?: string;
};

export async function createRequestAction(
  data: z.infer<typeof createRequestFormSchema>,
  userDetails: UserDetails | null,
): Promise<ActionResponse> {
  const validation = createRequestFormSchema.safeParse(data);
  if (!validation.success) {
    console.error("Form validation failed:", validation.error);
    return { success: false, error: "Invalid form data provided." };
  }
  
  if (!userDetails) {
    return { success: false, error: "Invalid user details provided. Please fill out your details first." };
  }
  const userValidation = userDetailsSchema.safeParse(userDetails);
   if (!userValidation.success) {
    console.error("User details validation failed:", userValidation.error);
    return { success: false, error: "Invalid user details provided." };
  }

  try {
    addRequest(validation.data, userDetails);
    revalidatePath("/");
    return { success: true, reasoning: `Your request has been successfully created.` };
  } catch (error) {
    console.error(`Error creating request:`, error);
    if (error instanceof Error) {
        return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

export async function updateRequestAction(
  data: z.infer<typeof updateRequestFormSchema>,
  userDetails: UserDetails | null,
): Promise<ActionResponse> {
  const validation = updateRequestFormSchema.safeParse(data);
  if (!validation.success) {
    console.error("Form validation failed:", validation.error);
    return { success: false, error: "Invalid form data provided." };
  }
  
  if (!userDetails) {
    return { success: false, error: "Invalid user details provided. Please fill out your details first." };
  }
  const userValidation = userDetailsSchema.safeParse(userDetails);
   if (!userValidation.success) {
    console.error("User details validation failed:", userValidation.error);
    return { success: false, error: "Invalid user details provided." };
  }

  const { id, ...requestData } = validation.data;

  try {
    updateRequest(id, requestData, userDetails.token);
    revalidatePath("/");
    return { success: true, reasoning: `Your request has been successfully updated.` };
  } catch (error) {
    console.error(`Error updating request:`, error);
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

    if (!userDetails) {
      return { success: false, error: "Invalid user details provided. Please fill out your details first." };
    }
    const userValidation = userDetailsSchema.safeParse(userDetails);
    if (!userValidation.success) {
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

export async function makeOfferAction(
    data: z.infer<typeof makeOfferSchema>,
    userDetails: UserDetails | null
): Promise<ActionResponse> {
    const validation = makeOfferSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: "Invalid offer data." };
    }
    if (!userDetails) {
        return { success: false, error: "User details not found." };
    }
    try {
        makeOffer(validation.data.requestId, validation.data.offerAmount, userDetails);
        revalidatePath("/");
        return { success: true, reasoning: "Your offer has been sent!" };
    } catch (error) {
        console.error("Error making offer:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "An unexpected error occurred." };
    }
}

export async function acceptOfferAction(
    requestId: string,
    offerId: string,
    userToken: string | undefined
): Promise<ActionResponse> {
    if (!userToken) {
        return { success: false, error: "User details not found." };
    }
    try {
        acceptOffer(requestId, offerId, userToken);
        revalidatePath("/");
        return { success: true, reasoning: "Offer accepted! Details revealed." };
    } catch (error) {
        console.error("Error accepting offer:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "An unexpected error occurred." };
    }
}

export async function rejectOfferAction(
    requestId: string,
    offerId: string,
    userToken: string | undefined
): Promise<ActionResponse> {
    if (!userToken) {
        return { success: false, error: "User details not found." };
    }
    try {
        rejectOffer(requestId, offerId, userToken);
        revalidatePath("/");
        return { success: true, reasoning: "Offer rejected." };
    } catch (error) {
        console.error("Error rejecting offer:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "An unexpected error occurred." };
    }
}
