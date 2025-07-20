"use client";

import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2Icon, RotateCcwIcon } from "lucide-react";
import useSecondsTimer from "@/hooks/useSecondsTimer";
import { services } from "@/services";
import { useParams } from 'next/navigation'


const SignInFormSchema = z.object({
  email: z.string().email({
    message: "An email is required.",
  }),
})

const OTPFormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
})


export default function Access() {

  const [goToOtpForm, setGoToOtpForm] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [seconds, resetTimer, stopTimer] = useSecondsTimer(30);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const params = useParams<{ redirect: string; }>()
  const signInForm = useForm<z.infer<typeof SignInFormSchema>>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: {
      email: "",
    },
  })

  const otpForm = useForm<z.infer<typeof OTPFormSchema>>({
    resolver: zodResolver(OTPFormSchema),
    defaultValues: {
      pin: "",
    },
  })

  const onSubmitSignIn = async ({ email }: { email: string }) => {
    // send otp
    setSubmittedEmail(email);
    const otpSent = await sendOTP(email)
    // continue to otp form
    if (otpSent) setGoToOtpForm(true);


  }

  const onSubmitOTP = async ({ pin }: { pin: string }) => {
    // verify otp
    setVerifyingOTP(true)
    // probably backend send the cookie with the session id
    const verify = await services.user.verifyOTP(submittedEmail, pin)
    if (verify) {
      window.location.href = window.location.hostname + params.redirect;
    }
    setVerifyingOTP(false)
  }

  const sendOTP = async (email: string) => {
    const otpSent = await services.user.sendOTP(email);
    if (otpSent) resetTimer()
    return otpSent

  }



  return (
    <div className="flex justify-center min-h-screen gap-6 py-4">
      <Card className="h-fit my-16 p-10" >
        {!goToOtpForm && <>
          <h1 className="scroll-m-20 text-center text-3xl font-extrabold tracking-tight text-balance">
            Formagen
          </h1>
          <Form {...signInForm}>
            <form onSubmit={signInForm.handleSubmit(onSubmitSignIn)} className="space-y-4">
              <FormField
                control={signInForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" >
                Sign in
                {/* {buttonDisabled && <Loader2Icon className="animate-spin" />} */}

              </Button>
            </form>
          </Form>
        </>}
        {goToOtpForm &&
          <>
            <div className="flex justify-center items-center gap-2">
              <Button className="" onClick={() => setGoToOtpForm(false)} size="icon" variant="outline" >
                <ArrowLeft />
              </Button>
              <h1 className="scroll-m-20 text-center text-1xl font-extrabold tracking-tight text-balance">
                Check your email
              </h1>
            </div>
            <p className="text-center text-sm">to continue to Formagen</p>
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onSubmitOTP)} className="space-y-4">
                <FormField
                  control={otpForm.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem className="justify-items-center">
                      <FormControl>
                        <InputOTP maxLength={6} {...field} disabled={verifyingOTP}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!verifyingOTP && <Button disabled={seconds > 0} className="w-full" type="button" variant="link" onClick={() => sendOTP(submittedEmail)} >{`Resend code ${seconds > 0 ? `in ${seconds} secs` : ''}`} <RotateCcwIcon />
                </Button>}
                <Button disabled={verifyingOTP} type="submit" className="w-full" >
                  {verifyingOTP && <Loader2Icon className="animate-spin" />}
                  Continue
                  {!verifyingOTP && <ArrowRight />}
                </Button>
              </form>
            </Form>
          </>
        }
      </Card>
    </div>
  );
}



