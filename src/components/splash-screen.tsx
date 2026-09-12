'use client';

import Image from 'next/image';

export default function SplashScreen() {
  return (
    <div
      className={`duration-600 fixed inset-0 z-50 flex items-center justify-center transition-opacity`}
      style={{
        background: 'linear-gradient(135deg, #30080F 0%, #1a0508 50%, #0a0203 100%)',
      }}
    >
      <div className="relative">
        {/* Animated rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="h-32 w-32 animate-ping rounded-full"
            style={{ border: '4px solid rgba(244, 63, 94, 0.2)' }}
          ></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="h-48 w-48 animate-pulse rounded-full"
            style={{ border: '4px solid rgba(244, 63, 94, 0.1)' }}
          ></div>
        </div>

        {/* Logo container */}
        <div className="relative z-10 flex flex-col items-center space-y-8">
          {/* Shoe Logo */}
          <div className="transform transition-transform duration-300 hover:scale-110">
            <Image src="/logo.svg" alt="Shoe Logo" width={200} height={200} />
          </div>

          {/* Brand name */}
          <div className="space-y-3 text-center">
            <h1 className="animate-pulse text-6xl font-bold tracking-wider text-white">SALAMA</h1>
            <div className="flex items-center justify-center space-x-2">
              <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-rose-500 to-transparent"></div>
              <p className="text-lg font-light uppercase tracking-widest text-rose-100">
                Your Health Partner
              </p>
              <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-rose-500 to-transparent"></div>
            </div>
          </div>

          {/* Loading indicator */}
          <div className="mt-8 flex space-x-2">
            <div
              className="h-3 w-3 animate-bounce rounded-full bg-rose-400"
              style={{ animationDelay: '0ms' }}
            ></div>
            <div
              className="h-3 w-3 animate-bounce rounded-full bg-purple-400"
              style={{ animationDelay: '150ms' }}
            ></div>
            <div
              className="h-3 w-3 animate-bounce rounded-full bg-pink-400"
              style={{ animationDelay: '300ms' }}
            ></div>
          </div>
        </div>

        {/* Floating particles effect */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-20 top-20 h-2 w-2 animate-ping rounded-full bg-rose-400"
            style={{ animationDelay: '0ms' }}
          ></div>
          <div
            className="absolute right-32 top-40 h-1 w-1 animate-ping rounded-full bg-purple-400"
            style={{ animationDelay: '500ms' }}
          ></div>
          <div
            className="absolute bottom-32 left-40 h-1.5 w-1.5 animate-ping rounded-full bg-pink-400"
            style={{ animationDelay: '1000ms' }}
          ></div>
          <div
            className="absolute bottom-20 right-20 h-2 w-2 animate-ping rounded-full bg-rose-300"
            style={{ animationDelay: '1500ms' }}
          ></div>
        </div>
      </div>
    </div>
  );
}
