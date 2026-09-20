"use client";

export default function PennyLoader({ fullScreen = true }) {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 bg-[#FAF9FF] flex flex-col items-center justify-center p-6"
    : "w-full py-16 flex flex-col items-center justify-center p-6 relative";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center justify-center text-center">
        {/* Clean Centered Penguin Video */}
        <div className="w-36 h-36 sm:w-44 sm:h-44 mb-2">
          <video
            src="/loading.webm"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain"
          />
        </div>

        {/* 3 Animated Bouncing Dots */}
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2.5 h-2.5 rounded-full bg-[#5B3F91] animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-[#8064C8] animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-[#A98FE3] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
