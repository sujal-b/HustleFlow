
"use client";

import type { Dispatch, SetStateAction } from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createRequestAction, updateRequestAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { Confetti } from "./confetti";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { getUserDetails } from "@/lib/user-store";
import type { ExchangeRequest } from "@/lib/types";

const formSchema = z.object({
  id: z.string().optional(),
  amount: z.coerce
    .number({ invalid_type_error: "Please enter a valid number." })
    .min(1, { message: "Amount must be at least 1." })
    .max(100000, { message: "Amount must not exceed 100,000." }),
  type: z.enum(["cash", "digital"]),
  urgency: z.enum(["urgent", "flexible"]),
  duration: z.enum(["1", "3", "7"]),
});

type RequestFormValues = z.infer<typeof formSchema>;

interface RequestFormProps {
  setSheetOpen: Dispatch<SetStateAction<boolean>>;
  request?: ExchangeRequest;
}

export function RequestForm({ setSheetOpen, request }: RequestFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();

  const isEditMode = !!request;

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditMode ? {
      id: request.id,
      amount: request.amount,
      type: request.type,
      urgency: request.urgency,
      duration: request.duration,
    } : {
      amount: 500,
      type: "cash",
      urgency: "flexible",
      duration: "3",
    },
  });

  const onSubmit = (data: RequestFormValues) => {
    startTransition(async () => {
      const userDetails = getUserDetails();
      const result = isEditMode
        ? await updateRequestAction(data as Required<RequestFormValues>, userDetails)
        : await createRequestAction(data, userDetails);
        
      if (result.success) {
        if (!isEditMode) {
          setShowConfetti(true);
        }
        toast({
          title: `🚀 Request ${isEditMode ? 'Updated' : 'Created'}!`,
          description: (
            <div>
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
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (INR)</FormLabel>
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
            name="urgency"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Urgency</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                    disabled={isPending}
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="flexible" />
                      </FormControl>
                      <FormLabel className="font-normal">Flexible</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="urgent" />
                      </FormControl>
                      <FormLabel className="font-normal">Urgent</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Request Duration</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="How long should this request be active?" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="3">3 Days</SelectItem>
                    <SelectItem value="7">7 Days</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Save Changes' : 'Create Request'}
          </Button>
        </form>
      </Form>
    </>
  );
}
