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
        <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#B91C6C] to-[#D97706] flex items-center justify-center text-white shadow-md shadow-[#B91C6C]/20 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black tracking-tight text-[#1C1917]">
            Mehman<span className="text-[#B91C6C]">Ji</span>
          </span>
        </Link>
        <p className="text-sm text-[#78716C]">
          The Indian Wedding Guest Intelligence Platform
        </p>
      </div>

      <Card className="border-[#E8DDD3] shadow-lg shadow-stone-200/50 bg-white">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-bold tracking-tight text-[#1C1917]">
            Sign in to your account
          </CardTitle>
          <CardDescription className="text-xs text-[#78716C]">
            Track RSVPs, manage catering headcount, and message guests.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="priya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-[#E8DDD3] focus:border-[#B91C6C]"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
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
                className="h-11 border-[#E8DDD3] focus:border-[#B91C6C]"
              />
            </div>

            {/* Quick Demo Fill button */}
            <div className="p-3 bg-[#FFFBF5] rounded-lg border border-[#E8DDD3]/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D97706]" />
                <span className="text-xs font-medium text-[#1C1917]">Sample Demo Account</span>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-xs font-bold text-[#B91C6C] hover:underline cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#B91C6C] hover:bg-[#9D174D] text-white font-semibold text-sm shadow-md shadow-[#B91C6C]/20 cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign in to MehmanJi"}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>

            <div className="text-center text-xs text-[#78716C] pt-2">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-bold text-[#B91C6C] hover:underline">
                Create wedding account
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#78716C]">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>End-to-end encrypted guest privacy</span>
      </div>
    </div>
  );
}
