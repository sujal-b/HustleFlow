
'use server';

/**
 * @fileOverview Matches users based on their exchange requests using AI analysis.
 *
 * - matchRequestUsers - A function that matches users based on exchange requests.
 * - MatchRequestUsersInput - The input type for the matchRequestUsers function.
 * - MatchRequestUsersOutput - The return type for the matchRequestUsers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MatchRequestUsersInputSchema = z.object({
  requestId: z.string().describe('The ID of the exchange request.'),
  amount: z.number().describe('The amount to be exchanged.'),
  currency: z.string().describe('The currency to be exchanged.'),
  cashOrDigital: z.enum(['cash', 'digital']).describe('The type of exchange (cash or digital).'),
  urgency: z.enum(['urgent', 'flexible']).describe('The urgency of the request.'),
  duration: z.enum(['1', '3', '7']).describe('The duration the request is active for in days.'),
  userPreferences: z.string().optional().describe('Additional user preferences for the match.'),
  user: z.object({
    token: z.string().describe("The anonymous token of the user making the request.")
  }).describe("The user making the request.")
});
export type MatchRequestUsersInput = z.infer<typeof MatchRequestUsersInputSchema>;

const MatchRequestUsersOutputSchema = z.object({
  matchedUserIds: z.array(z.string()).describe('An array of user IDs that are a potential match.'),
  reasoning: z.string().describe('The AI reasoning behind the user matching.'),
});
export type MatchRequestUsersOutput = z.infer<typeof MatchRequestUsersOutputSchema>;

export async function matchRequestUsers(input: MatchRequestUsersInput): Promise<MatchRequestUsersOutput> {
  return matchRequestUsersFlow(input);
}

const matchRequestUsersPrompt = ai.definePrompt({
  name: 'matchRequestUsersPrompt',
  input: {schema: MatchRequestUsersInputSchema},
  output: {schema: MatchRequestUsersOutputSchema},
  prompt: `You are an AI assistant designed to match users for currency exchange requests.

  Given the following exchange request details, identify the best user matches from a database of users (not accessible to you directly).
  Consider the amount, currency, urgency, preferred exchange type (cash or digital), duration, and any user preferences specified.
  The user making the request has the token: {{{user.token}}}. Do not match them with themselves.
  Return a list of user IDs that represent the best possible matches and a brief explanation of why those users were selected.

  Request ID: {{{requestId}}}
  Amount: {{{amount}}} {{{currency}}}
  Urgency: {{{urgency}}}
  Exchange Type: {{{cashOrDigital}}}
  Active for: {{{duration}}} days
  User Preferences: {{{userPreferences}}}

  Return ONLY a JSON object that adheres to the following schema:
  ${JSON.stringify(MatchRequestUsersOutputSchema.shape, null, 2)}`,
});

const matchRequestUsersFlow = ai.defineFlow(
  {
    name: 'matchRequestUsersFlow',
    inputSchema: MatchRequestUsersInputSchema,
    outputSchema: MatchRequestUsersOutputSchema,
  },
  async input => {
    const {output} = await matchRequestUsersPrompt(input);
    return output!;
  }
);
