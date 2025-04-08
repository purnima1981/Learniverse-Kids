import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ClockIcon, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navigation() {
  // Simplified approach without auth for now
  const user = { firstName: "Student" };
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    // Will implement logout later
    console.log("Logout clicked");
  };

  const navLinks = [
    { href: "/dashboard", label: "Home" },
    { href: "/stories", label: "My Stories" },
    { href: "/flashcards", label: "Flashcards" },
    { href: "/progress", label: "Progress" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <nav className="py-4 px-6 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <ClockIcon className="h-8 w-8 text-white" />
        <span className="font-bold text-2xl text-white">Learniverse</span>
      </div>

      <div className="hidden md:flex items-center space-x-6">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <span
              className={`font-semibold transition ${
                isActive(link.href)
                  ? "text-yellow-400"
                  : "text-white hover:text-yellow-400"
              }`}
            >
              {link.label}
            </span>
          </Link>
        ))}
      </div>

      <div className="flex items-center space-x-3">
        {user && (
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold text-white">
              {user.firstName.charAt(0)}
            </div>
          </div>
        )}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
              aria-label="Menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-primary-light/90 backdrop-blur-lg border-white/20">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-xl text-white">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <span
                      className={`font-semibold py-2 transition ${
                        isActive(link.href)
                          ? "text-yellow-400"
                          : "text-white hover:text-yellow-400"
                      }`}
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </span>
                  </Link>
                ))}

                <Button
                  variant="ghost"
                  className="justify-start p-0 text-white hover:text-yellow-400 hover:bg-transparent"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
