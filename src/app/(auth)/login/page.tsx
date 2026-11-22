"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles, UtensilsCrossed, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Sign in failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Namaste! Welcome back 🙏",
          description: "Signing into your wedding dashboard...",
        });
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail("priya@example.com");
    setPassword("password123");
  };

  return (
    <div className="w-full">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#1F2E23] border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] shadow-sm group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <span className="font-serif text-3xl font-bold tracking-tight text-[#1F1E1C]">
            Mehman<span className="text-[#C5A059]">Ji</span>
          </span>
        </Link>
        <p className="text-xs uppercase tracking-widest text-[#6E6A63] font-semibold">
          The Indian Wedding Guest Intelligence Platform
        </p>
      </div>

      <Card className="border-[#EAE5DF] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)] bg-white rounded-2xl">
        <CardHeader className="space-y-1 p-6 pb-4">
          <CardTitle className="font-serif text-2xl font-bold tracking-tight text-[#1F1E1C]">
            Sign in to your account
          </CardTitle>
          <CardDescription className="text-xs text-[#6E6A63] pt-0.5">
            Track guest attendance, calculate Halwai food plates, and send WhatsApp invites.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 px-6 pb-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[#6E6A63]">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="priya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 border-[#EAE5DF] focus:border-[#C5A059]"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[#6E6A63]">
                  Password
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 border-[#EAE5DF] focus:border-[#C5A059]"
              />
            </div>

            {/* Quick Demo Fill button */}
            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DF] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
                <span className="text-xs font-medium text-[#1F1E1C]">Sample Demo Account</span>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-xs font-semibold text-[#C5A059] hover:underline cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 p-6 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#1F2E23] hover:bg-[#152018] text-[#C5A059] border border-[#C5A059]/40 font-medium text-sm shadow-md cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign in to MehmanJi"}
              {!loading && <ArrowRight className="w-4 h-4 ml-2 text-[#C5A059]" />}
            </Button>

            <div className="text-center text-xs text-[#6E6A63] pt-2">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-[#C5A059] hover:underline">
                Create wedding account
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
