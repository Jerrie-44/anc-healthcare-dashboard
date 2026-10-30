// app/(auth)/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80",
    caption: "Empowering connected care & seamless triage",
  },
  {
    image:
      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1600&q=80",
    caption: "Coordinate clinical staffing & visits with confidence",
  },
  {
    image:
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1600&q=80",
    caption: "Real-time compliance monitoring & intake tracking",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("clinician@hospital.org");
  const [password, setPassword] = useState("••••••••••••");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance the carousel every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      router.push("/referrals");
    } catch {
      window.location.href = "/referrals";
    }
  };

  return (
    <div className="grid min-h-screen w-full grid-cols-1 bg-white lg:grid-cols-2">
      {/* Left Column: Form Column */}
      <div className="flex h-full w-full flex-col items-center justify-between p-8 sm:p-12 lg:p-16">
        {/* Brand Header */}
        <div className="w-full max-w-[400px] text-left">
          <span className="text-headline-semibold tracking-tight text-text-primary">
            ANC Healthcare
          </span>
        </div>

        {/* Centered Credential Content */}
        <div className="my-auto w-full max-w-[400px] py-8">
          <div className="text-left">
            <h1 className="text-display-4-medium tracking-tight text-text-primary">
              Welcome back
            </h1>
            <p className="mt-1.5 text-body-regular text-text-secondary">
              Enter your credentials to access the workspace
            </p>
          </div>

          <form onSubmit={handleSignIn} className="mt-8 flex flex-col gap-4 text-left">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-body-medium text-text-primary">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                disabled={loading}
                className="w-full"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-body-medium text-text-primary">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                className="w-full"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-body-2-regular text-text-primary">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 accent-[#007aff]"
                />
                Remember me
              </label>
              <Link
                href="#"
                className="text-body-2-medium text-[#007aff] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Action CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-[#007aff] py-2.5 text-headline-medium text-white transition-colors hover:bg-[#0062cc] disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Create an Account */}
          <div className="mt-8 text-center text-body-2-regular text-text-secondary">
            Don&apos;t have an account?{" "}
            <Link href="#" className="font-medium text-[#007aff] hover:underline">
              Create an account
            </Link>
          </div>
        </div>

        {/* Footer Legal Note */}
        <div className="w-full max-w-[400px] text-left">
          <p className="text-caption-1-regular text-text-tertiary">
            By clicking sign in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>

      {/* Right Column: Visual Carousel Inset */}
      <div className="hidden h-screen w-full py-[20px] pr-[20px] pl-[10px] lg:block">
        <div className="relative h-full w-full overflow-hidden rounded-[12px] shadow-sm">
          {SLIDES.map((slide, idx) => (
            <div
              key={slide.image}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                idx === currentSlide ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.caption}
                fill
                priority={idx === 0}
                sizes="50vw"
                className="object-cover"
              />
            </div>
          ))}

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Bottom Message & Indicators */}
          <div className="absolute bottom-10 left-8 right-8 z-10 flex flex-col items-center gap-3.5 text-center text-white">
            <p className="text-headline-medium drop-shadow-md transition-all duration-300">
              {SLIDES[currentSlide].caption}
            </p>

            <div className="flex items-center gap-2">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 transition-all duration-300 ${
                    idx === currentSlide
                      ? "w-7 rounded-full bg-white"
                      : "w-1.5 rounded-full bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}