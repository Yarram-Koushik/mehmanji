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
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#1F2E23] border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] shadow-sm group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <span className="font-serif text-3xl font-bold tracking-tight text-[#1F1E1C]">
            Mehman<span className="text-[#C5A059]">Ji</span>
          </span>
        </Link>
        <p className="text-xs uppercase tracking-widest text-[#6E6A63] font-semibold">
          Save ₹2-5 Lakhs on Indian wedding catering waste
        </p>
      </div>

      <Card className="border-[#EAE5DF] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)] bg-white rounded-2xl">
        <CardHeader className="space-y-1 p-6 pb-4">
          <CardTitle className="font-serif text-2xl font-bold tracking-tight text-[#1F1E1C]">
            Create wedding planner account
          </CardTitle>
          <CardDescription className="text-xs text-[#6E6A63] pt-0.5">
            Setup your guest list, ceremonies, and WhatsApp invitation links in minutes.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3.5 px-6 pb-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-[#6E6A63]">
                Your Full Name
              </Label>
              <Input
                id="name"
                placeholder="e.g. Vikram Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-10 border-[#EAE5DF] focus:border-[#C5A059]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[#6E6A63]">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="vikram@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-10 border-[#EAE5DF] focus:border-[#C5A059]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-[#6E6A63]">
                WhatsApp / Phone Number
              </Label>
              <Input
                id="phone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-10 border-[#EAE5DF] focus:border-[#C5A059]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[#6E6A63]">
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
                className="h-10 border-[#EAE5DF] focus:border-[#C5A059]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 p-6 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#1F2E23] hover:bg-[#152018] text-[#C5A059] border border-[#C5A059]/40 font-medium text-sm shadow-md cursor-pointer"
            >
              {loading ? "Creating Account..." : "Start Managing Your Wedding"}
              {!loading && <ArrowRight className="w-4 h-4 ml-2 text-[#C5A059]" />}
            </Button>

            <div className="text-center text-xs text-[#6E6A63] pt-2">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-[#C5A059] hover:underline">
                Sign In
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
