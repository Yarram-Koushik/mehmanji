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
import { UtensilsCrossed, ArrowRight, ShieldCheck } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Registration failed",
          description: data.error || "Please check your inputs",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Account created! 🎊",
        description: "Signing you in to your dashboard...",
      });

      // Automatically sign in
      const loginRes = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (!loginRes?.error) {
        router.push("/dashboard");
        router.refresh();
      } else {
        router.push("/login");
      }
    } catch {
      toast({
        title: "Error",
        description: "Could not create account. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
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
          Save ₹2-5 Lakhs on Indian wedding catering waste
        </p>
      </div>

      <Card className="border-[#E8DDD3] shadow-lg shadow-stone-200/50 bg-white">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-bold tracking-tight text-[#1C1917]">
            Create wedding planner account
          </CardTitle>
          <CardDescription className="text-xs text-[#78716C]">
            Setup your guest list, events, and WhatsApp invitation links in minutes.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
                Your Full Name
              </Label>
              <Input
                id="name"
                placeholder="e.g. Vikram Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-10 border-[#E8DDD3] focus:border-[#B91C6C]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="vikram@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-10 border-[#E8DDD3] focus:border-[#B91C6C]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
                WhatsApp / Phone Number
              </Label>
              <Input
                id="phone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-10 border-[#E8DDD3] focus:border-[#B91C6C]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
                Password (min. 8 characters)
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                className="h-10 border-[#E8DDD3] focus:border-[#B91C6C]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#B91C6C] hover:bg-[#9D174D] text-white font-semibold text-sm shadow-md shadow-[#B91C6C]/20 cursor-pointer"
            >
              {loading ? "Creating account..." : "Start Managing Guests Free"}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>

            <div className="text-center text-xs text-[#78716C] pt-2">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-[#B91C6C] hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#78716C]">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>No credit card required. Free tier includes up to 50 guests.</span>
      </div>
    </div>
  );
}
