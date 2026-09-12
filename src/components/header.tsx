'use client';

import { Button } from "@/components/ui/button";
import { useIsAuthenticated } from "@/hooks/use-user";
import { Menu, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const menuItems = [
  { label: "Home", href: "/" },
  { label: "View Shoes", href: "/shoes/all" },
  { label: "New Releases", href: "/shoes/new" },
  { label: "Compare", href: "/compare" },
  { label: "Archived Shoes", href: "/archived" }

];

// Unused for now - keeping for future dropdown feature
// const allShoesCategories = [
//   { label: "All Shoes", href: "/shoes/all" },
//   { label: "Super Shoes", href: "/shoes/super" },
//   // { label: "Super Trainer", href: "/shoes/super-trainer" },
//   // { label: "Trainers", href: "/shoes/trainers" },
// ];

// Unused for now - keeping for future use
// const menuItems2 = [
//   { label: "Compare", href: "/compare" },
//   // { label: "Archive", href: "/archived" }
// ];
// const compareItem = { label: "Compare", href: "/compare" };

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isLoggedIn = useIsAuthenticated(); // Instant access from Zustand
  // const [isMobileShoesOpen, setIsMobileShoesOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  // Unused for now - keeping for future use when dropdown is re-enabled
  // const isActiveCategory = (categories: typeof allShoesCategories) => {
  //   return categories.some(category => isActiveLink(category.href));
  // };
  // const isActiveCategory = (_categories: { label: string; href: string }[]) => {
  //   return _categories.some(category => isActiveLink(category.href));
  // };

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="app-container">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image src="/logo_with_text.svg" alt="Cadence Logo" width={150} height={32} className="max-w-44 md:max-w-56 w-full" />
            {/* <span className="text-xl font-bold text-gray-900 lg:text-2xl">CADENCE</span> */}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-4 lg:flex xl:gap-5 2xl:gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative lg:text-sm min-[1300px]:text-base font-medium transition-colors hover:text-primary ${isActiveLink(item.href)
                  ? "text-primary  border-b-2 border-primary pb-1"
                  : "text-gray-700"
                  }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Desktop All Shoes Dropdown */}
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex items-center gap-1 text-base font-medium transition-colors hover:text-primary relative outline-none ring-0 border-0 focus:ring-0 focus:outline-none focus:border-0 focus-visible:ring-0 focus-visible:outline-none focus-visible:border-0 ${isActiveCategory(allShoesCategories)
                  ? "text-primary border-b-2 border-primary pb-1"
                  : "text-gray-700"
                  }`}>
                  View Shoes
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48 w-white !border-none">
                {allShoesCategories.map((category) => (
                  <DropdownMenuItem key={category.href} asChild>
                    <Link
                      href={category.href}
                      className="w-full cursor-pointer !text-base"
                    >
                      {category.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu> */}

            {/* Compare Link */}
            {/* {
              menuItems2.map((compareItem) => (
                <Link
                  key={compareItem.href}
                  href={compareItem.href}
                  className={`relative text-base font-medium transition-colors hover:text-primary ${isActiveLink(compareItem.href)
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-gray-700"
                    }`}
                >
                  {compareItem.label}
                </Link>
              ))
            } */}

          </nav>

          {/* Desktop Search and User */}
          <div className="hidden items-center gap-4 lg:flex">
            {/* <div className="relative">
              <Input
                type="search"
                placeholder="Search shoes..."
                className="w-48 pr-10 xl:w-64 focus:ring-0 focus:outline-none bg-white border-gray-300 "
              />
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 " />
            </div> */}

            {isLoggedIn ? (
              <Button
                onClick={() => router.push("/profile/dashboard")}
                variant="ghost"
                size="icon"
                aria-label="User account"
                className="hover:text-primary"
              >
                <User className="h-5 w-5 scale-125" />
              </Button>
            ) : (
              <Button
                onClick={() => router.push("/auth/signin")}
                className="bg-primary text-white hover:bg-[#8A1829]"
              >
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            {isLoggedIn ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/profile/dashboard")}
                aria-label="User account"
                className="md:mr-2 hover:text-primary"
              >
                <User className="h-5 w-5 scale-125" />
              </Button>
            ) : (
              <Button
                onClick={() => router.push("/auth/signin")}
                size="sm"
                className="md:mr-2 bg-primary text-white hover:bg-[#8A1829]"
              >
                Login
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 scale-125" />
              ) : (
                <Menu className="h-6 w-6 scale-125" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t py-4 lg:hidden">
            {/* Mobile Search */}
            {/* <div className="relative mb-4">

              <Input
                type="search"
                placeholder="Search shoes..."
                className="w-full pr-10"
              />
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div> */}

            {/* Mobile Navigation */}
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 ${isActiveLink(item.href)
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-gray-700"
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* Mobile All Shoes Dropdown */}
              {/* <div>
                <button
                  onClick={() => setIsMobileShoesOpen(!isMobileShoesOpen)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 ${isActiveCategory(allShoesCategories)
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-gray-700"
                    }`}
                >
                  All Shoes
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isMobileShoesOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {isMobileShoesOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    {allShoesCategories.map((category) => (
                      <Link
                        key={category.href}
                        href={category.href}
                        className={`block rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-gray-50 hover:text-gray-900 ${isActiveLink(category.href)
                          ? "text-primary border-b-2 border-primary pb-1"
                          : "text-gray-600"
                          }`}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsMobileShoesOpen(false);
                        }}
                      >
                        {category.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div> */}

              {/* Mobile Compare Link */}
              {/* {
                menuItems2.map((compareItem) => (
                  <Link
                    key={compareItem.href}
                    href={compareItem.href}
                    className={`block rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 ${isActiveLink(compareItem.href)
                      ? "text-primary border-b-2 border-primary pb-1"
                      : "text-gray-700"
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {compareItem.label}
                  </Link>
                ))
              } */}

            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
