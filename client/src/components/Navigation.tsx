import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ClockIcon, LogOut, Menu, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Navigation() {
  // Removed auth dependency and created temporary user
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Temporary user object
  const user = {
    firstName: "Demo",
    lastName: "User",
    email: "demo@learniverse.com"
  };

  const handleLogout = () => {
    // Simple redirect to auth page instead of using mutations
    setLocation('/auth');
  };
  
  const handleDeleteAccount = () => {
    setDeleteDialogOpen(false);
    // In a production environment this would delete the account
    // For now, just redirect to auth page
    setLocation('/auth');
  };

  const navLinks = [
    { href: "/dashboard", label: "Home" },
    { href: "/stories", label: "My Stories" },
    { href: "/flashcards", label: "Flashcards" },
    { href: "/progress", label: "Progress" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-primary-light/90 backdrop-blur-lg border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              This will permanently delete your account and all associated data. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 text-white hover:bg-white/20 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold text-white cursor-pointer hover:bg-white/30 transition">
                    {user.firstName.charAt(0)}
                  </div>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-56 bg-white/10 backdrop-blur-lg border-white/20 text-white">
                  <div className="px-2 py-2">
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-white/70">{user.email}</p>
                  </div>
                  
                  <DropdownMenuSeparator className="bg-white/10" />
                  
                  <DropdownMenuItem 
                    className="flex items-center cursor-pointer hover:bg-white/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="flex items-center cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete account</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                  
                  <Button
                    variant="ghost"
                    className="justify-start p-0 text-red-400 hover:text-red-300 hover:bg-transparent"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  );
}