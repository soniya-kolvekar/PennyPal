"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login submitted:", { email, password });
  };

  return (
    <div className="relative h-screen max-h-screen w-full bg-[#FAF9FF] text-[#5B3F91] flex flex-col justify-between overflow-hidden font-sans select-none">
      {/* Background Soft Lavender Patches */}
      <div className="absolute -top-16 -left-16 w-80 h-80 bg-[#EAE3FA] rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute top-1/4 -right-12 w-96 h-96 bg-[#C9B9F2] rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-[#EAE3FA] rounded-full blur-3xl opacity-35 pointer-events-none" />
      <div className="absolute -bottom-16 left-1/3 w-80 h-80 bg-[#C9B9F2] rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-72 h-72 bg-[#EAE3FA] rounded-full blur-3xl opacity-40 pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-12 py-3 sm:py-4 w-full max-w-7xl mx-auto shrink-0">
        {/* Brand Logo */}
        <div className="flex items-center">
          <Link href="/">
            <Image
              src="/logoo.png"
              alt="PennyPal Logo"
              width={190}
              height={70}
              style={{ width: "auto", height: "auto" }}
              className="h-12 sm:h-13 object-contain cursor-pointer"
              priority
            />
          </Link>
        </div>

        {/* Top Right Handwritten Tagline */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="font-handwritten text-lg sm:text-xl text-[#8064C8] -rotate-3 leading-tight">
            Better habits,
          </span>
          <span className="font-handwritten text-lg sm:text-xl text-[#8064C8] -rotate-3 leading-tight flex items-center gap-1">
            brighter futures
            <Image
              src="/heart.png"
              alt="Heart"
              width={20}
              height={20}
              style={{ width: "auto", height: "auto" }}
              className="inline-block h-4 sm:h-5 w-auto object-contain"
            />
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 sm:px-12 py-1 overflow-hidden min-h-0">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center max-h-full">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center max-w-md mx-auto w-full">
            {/* Title with decorative sparkle rays */}
            <div className="relative mb-1">
              <div className="flex items-center gap-3">
                {/* Left rays */}
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#A98FE3] shrink-0 transform -rotate-12" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M5 16H13" />
                  <path d="M8 7L15 13" />
                  <path d="M8 25L15 19" />
                </svg>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5B3F91] leading-tight">
                  Welcome back to PennyPal
                </h1>

                {/* Right rays */}
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#A98FE3] shrink-0 transform rotate-12" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M27 16H19" />
                  <path d="M24 7L17 13" />
                  <path d="M24 25L17 19" />
                </svg>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-[#5B3F91] mb-4 font-medium flex items-center gap-1">
              <span>Let&apos;s continue your money journey!</span>
              <Image
                src="/heart.png"
                alt="Heart"
                width={18}
                height={18}
                style={{ width: "auto", height: "auto" }}
                className="inline-block h-4 w-auto object-contain"
              />
            </p>

            {/* Sign in form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email Input */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#5B3F91]">
                  Email address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-[#A98FE3] pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-[#EAE3FA] text-[#5B3F91] placeholder-[#C9B9F2] focus:outline-none focus:ring-2 focus:ring-[#8064C8] shadow-sm transition-all text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#5B3F91]">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-[#A98FE3] pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-white rounded-2xl border border-[#EAE3FA] text-[#5B3F91] placeholder-[#C9B9F2] focus:outline-none focus:ring-2 focus:ring-[#8064C8] shadow-sm transition-all text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-[#A98FE3] hover:text-[#8064C8] transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-1 py-3 px-6 bg-[#8064C8] hover:bg-[#6F53B7] active:scale-[0.99] text-white font-semibold rounded-full shadow-md shadow-[#8064C8]/30 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* OR Divider */}
            <div className="relative flex items-center justify-center my-3 sm:my-4">
              <div className="border-t border-[#EAE3FA] w-full" />
              <span className="bg-[#FAF9FF] px-3 text-[11px] font-semibold text-[#A98FE3] tracking-widest uppercase">
                OR
              </span>
              <div className="border-t border-[#EAE3FA] w-full" />
            </div>

            {/* Don't have an account? Sign up */}
            <p className="text-center text-xs sm:text-sm text-[#5B3F91] font-medium">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-bold text-[#8064C8] hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          {/* Right Column: Animated Walking Penguin & Handwritten Annotations */}
          <div className="lg:col-span-6 xl:col-span-7 relative flex flex-col items-center justify-center max-h-full">
            
            {/* Handwritten Floating Annotation above Penguin */}
            <div className="relative mb-2 flex flex-col items-center">
              <div className="font-handwritten text-xl sm:text-2xl text-[#8064C8] -rotate-3 text-center leading-snug">
                <p>Small steps today,</p>
                <p className="flex items-center justify-center gap-1">
                  <span>big dreams tomorrow</span>
                  <Image
                    src="/heart.png"
                    alt="Heart"
                    width={22}
                    height={22}
                    style={{ width: "auto", height: "auto" }}
                    className="inline-block h-5 sm:h-6 w-auto object-contain"
                  />
                </p>
              </div>
              
              {/* Handwritten Swoop Arrow SVG */}
              <svg className="w-20 h-6 text-[#A98FE3] -mt-0.5 ml-4" viewBox="0 0 100 30" fill="none">
                <path d="M 10,5 Q 50,30 85,15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M 75,12 L 85,15 L 82,22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>

            {/* Ground Mound / Soft Lavender Wave */}
            <div className="relative w-full max-w-xl h-60 sm:h-72 flex items-end justify-center overflow-hidden">
              
              {/* Soft purple hill backdrop */}
              <div className="absolute bottom-0 w-[130%] h-4 bg-[#EAE3FA]/80 rounded-[50%] blur-sm translate-y-12 pointer-events-none" />

              {/* Floating Accent Hearts */}
              <div className="absolute top-2 right-10 animate-bounce">
                <Image
                  src="/heart.png"
                  alt="Heart"
                  width={29}
                  height={29}
                  style={{ width: "auto", height: "auto" }}
                  className="h-6 sm:h-9 w-auto object-contain"
                />
              </div>
              <div className="absolute top-12 right-2 opacity-80">
                <Image
                  src="/heart.png"
                  alt="Heart"
                  width={29}
                  height={29}
                  style={{ width: "auto", height: "auto" }}
                  className="h-6 sm:h-9 w-auto object-contain"
                />
              </div>
              <div className="absolute bottom-16 left-2 opacity-90">
                <Image
                  src="/heart.png"
                  alt="Heart"
                  width={29}
                  height={29}
                  style={{ width: "auto", height: "auto" }}
                  className="h-6 sm:h-9 w-auto object-contain"
                />
              </div>

              {/* Animated Walking Penguin Container */}
              <div className="relative w-full h-56 sm:h-64 overflow-hidden">
                {/* Horizontal Walk Loop Track */}
                <div className="absolute bottom-0 left-0 w-full h-full flex items-end animate-penguin-walk">
                  <div className="relative w-56 h-60 sm:w-98 sm:h-72 shrink-0">
                    <video
                      src="/login_penguin.webm"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-contain filter drop-shadow-md"
                    />
                  </div>
                </div>
              </div>

              {/* Corner ground accent detail */}
              <div className="absolute bottom-2 right-8 flex gap-1.5 opacity-70">
                <div className="w-2.5 h-5 bg-[#A98FE3] rounded-full transform -rotate-12" />
                <div className="w-3 h-8 bg-[#8064C8] rounded-full transform rotate-6" />
                <div className="w-2.5 h-5 bg-[#A98FE3] rounded-full transform rotate-45" />
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Decorative Corner Plants (Bottom Left & Bottom Right) */}
      <footer className="relative z-10 w-full flex justify-between items-end px-6 sm:px-12 py-2 shrink-0 pointer-events-none">
        {/* Bottom Left Lilac-Green Plant Sprouts */}
        <div className="flex items-end gap-1 text-[#D8E5D0]">
          <svg className="w-8 h-10 text-[#A98FE3]/40" viewBox="0 0 40 60" fill="currentColor">
            <path d="M 20 60 C 20 40, 5 30, 5 15 C 5 5, 20 5, 20 20 C 20 5, 35 5, 35 15 C 35 30, 20 40, 20 60 Z" />
          </svg>
          <svg className="w-6 h-8 text-[#D8E5D0]" viewBox="0 0 30 45" fill="currentColor">
            <path d="M 15 45 C 15 30, 3 22, 3 10 C 3 3, 15 3, 15 15 C 15 3, 27 3, 27 10 C 27 22, 15 30, 15 45 Z" />
          </svg>
        </div>

        {/* Bottom Right Decorative Plant */}
        <div className="flex items-end gap-1 text-[#D8E5D0] opacity-80">
          <svg className="w-7 h-9 text-[#D8E5D0]" viewBox="0 0 35 50" fill="currentColor">
            <path d="M 17 50 C 17 35, 4 25, 4 12 C 4 4, 17 4, 17 17 C 17 4, 30 4, 30 12 C 30 25, 17 35, 17 50 Z" />
          </svg>
        </div>
      </footer>
    </div>
  );
}
