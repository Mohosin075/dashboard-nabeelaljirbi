"use client"


import { ArrowUp } from "lucide-react"
import Image from "next/image"
import Link from "next/link"


export function Footer() {
  // const { data } = useCms();
  // Only show socials that look like URLs
  // const socials = useMemo(() => {
  //   const contact = data?.data?.contact || {};
  //   // Only keep keys with values that look like URLs (http/https)
  //   return Object.entries(contact)
  //     .filter(([_, value]) => typeof value === "string" && value.startsWith("http"))
  //     .map(([key, value]) => ({
  //       key: key.charAt(0).toUpperCase() + key.slice(1),
  //       value,
  //     }));
  // }, [data]);

  return (
    <footer className="bg-[#30080F] text-white">
      <div className="app-container py-16">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-10">
          {/* Logo */}
          <div>
            <h2 className="text-5xl xl:text-6xl font-bold">Cadence</h2>
          </div>

          <div className="flex justify-between gap-4 lg:gap-10 flex-wrap max-w-md w-full">
            {/* Quick Links */}
            <div>
              <h3 className="mb-6 text-xl font-semibold">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/shoes/all" className="text-gray-300 hover:text-white">
                    All Shoes
                  </Link>
                </li>
                <li>
                  <Link href="/compare" className="text-gray-300 hover:text-white">
                    Compare
                  </Link>
                </li>
                <li>
                  <Link href="/archived" className="text-gray-300 hover:text-white">
                    Archived
                  </Link>
                </li>
              </ul>
            </div>

            {/* Socials (Dynamic from CMS) */}
            {/* <div>
              <h3 className="mb-6 text-xl font-semibold">Socials</h3>
              {isLoading ? (
                <div className="text-gray-400">Loading...</div>
              ) : isError ? (
                <div className="text-red-400">Failed to load</div>
              ) : (
                <ul className="space-y-3">
                  {socials.length === 0 && (
                    <li className="text-gray-400">No socials found</li>
                  )}
                  {socials.map((item) => (
                    <li key={item.key}>
                      <a
                        href={item.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-white"
                      >
                        {item.key}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div> */}
          </div>
        </div>
      </div>
      <div>
        <Image
          src="/FooterBottomShadow.svg"
          alt="Footer Background"
          width={1920}
          height={200}
          className="h-10 w-full object-cover"
        />
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#0A020366]">
        <div className="app-container flex items-center justify-between py-6 flex-wrap gap-2">
          <p className="text-sm text-gray-400">Copyright 2025 © Cadence</p>
          <Link href="/privacy" className="text-sm text-gray-400 hover:text-white">
            Privacy
          </Link>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <ArrowUp className="h-4 w-4" />
            To Top
          </button>
        </div>
      </div>
    </footer>
  );
}
