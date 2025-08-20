"use client";

import type { Dispatch, SetStateAction } from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createRequestAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { Confetti } from "./confetti";

const requestFormSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: "Please enter a valid number." })
    .min(1, { message: "Amount must be at least 1." })
    .max(100000, { message: "Amount must not exceed 100,000." }),
  currency: z.enum(["USD", "EUR", "GBP", "JPY"]),
  type: z.enum(["cash", "digital"]),
  location: z.string().optional(),
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

interface RequestFormProps {
  setSheetOpen: Dispatch<SetStateAction<boolean>>;
}

export function RequestForm({ setSheetOpen }: RequestFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      amount: 500,
      currency: "USD",
      type: "cash",
      location: "",
    },
  });

  const onSubmit = (data: RequestFormValues) => {
    startTransition(async () => {
      const result = await createRequestAction(data);
      if (result.success) {
        setShowConfetti(true);
        toast({
          title: "🚀 Request Matched!",
          description: (
            <div>
              <p className="font-bold">AI Matching Analysis:</p>
              <p className="text-sm text-muted-foreground">{result.reasoning}</p>
            </div>
          ),
        });
        form.reset();
        setSheetOpen(false);
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Oh no! Something went wrong.",
          description: result.error,
        });
      }
    });
  };
  
  const amountValue = form.watch("amount");

  return (
    <>
      {showConfetti && <Confetti />}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                 <FormControl>
                    <div className="flex items-center gap-4">
                        <Input
                            {...field}
                            type="number"
                            className="w-32"
                            onChange={e => field.onChange(Number(e.target.value))}
                            value={field.value}
                            disabled={isPending}
                        />
                        <Slider
                            value={[amountValue || 0]}
                            onValueChange={(value) => form.setValue('amount', value[0])}
                            max={5000}
                            step={50}
                            className="flex-1"
                            disabled={isPending}
                        />
                    </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Exchange Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                    disabled={isPending}
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="cash" />
                      </FormControl>
                      <FormLabel className="font-normal">Cash</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="digital" />
                      </FormControl>
                      <FormLabel className="font-normal">Digital</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exchange Spot (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Downtown Cafe" {...field} disabled={isPending} />
                </FormControl>
                <FormDescription>
                  Suggest a public place for cash exchanges.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Find My Match
          </Button>
        </form>
      </Form>
    </>
  );
}
