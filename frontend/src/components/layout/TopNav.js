"use client";

import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { motion, AnimatePresence, LayoutGroup } from "@/components/motion";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { toast } from "@/components/ui/Toaster";

const CATEGORIES = ["Equities", "Forex", "Crypto", "Fixed Income"];

const PROFILE_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC0KIazcraWE4HYTtQC57Ry7JQtdS3cm8ICNtbk2IHYlGs882zeKtS64bhpWSpQ2FGtTwQCVY8R47hKfnaieHp7Yd56exlmgBe0lZtpHC3M2tVMTeqpExlSXQqeErML6lB7DTYuQf9wvHCOsk-vxGfhW3h7QO2qgD3xOOEXDrJ07kLGtfO_em7ISv5Km26jNW8hetAtGzKItTsb4k6cuKNZXIBtZB46aEw4KfEpwnqGW8FFZk6YI8jrcw";

export default function TopNav({
  activeView,
  searchPlaceholder,
  activeCategory = "Equities",
  onCategoryChange,
  onNavigate,
  showSearch = true,
  showProfile = false,
  categoryStyle = "underline",
}) {
  const handleRefresh = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(() => {
        window.location.reload();
        resolve();
      }, 500)),
      {
        loading: "Refreshing data...",
        success: "Data refreshed!",
        error: "Failed to refresh",
      }
    );
  };

  return (
    <motion.header
      className="fixed top-0 right-0 w-full md:w-[calc(100%-240px)] z-30 bg-surface border-b border-outline-variant h-12 flex justify-between items-center px-margin-mobile md:px-margin-desktop"
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center gap-6">
        <motion.button
          type="button"
          onClick={() => onNavigate?.("dashboard")}
          className="md:hidden text-on-surface-variant hover:text-primary"
          whileTap={{ scale: 0.9 }}
        >
          <MaterialIcon name="menu" size={24} />
        </motion.button>

        <AnimatePresence mode="wait">
          {showSearch ? (
            <motion.div
              key="search"
              className="hidden md:flex items-center gap-4 h-full"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CommandPalette />
            </motion.div>
          ) : (
            <motion.nav
              key="categories-left"
              className="hidden md:flex items-center gap-6 text-label-uppercase"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              {CATEGORIES.map((cat) => (
                <motion.button
                  key={cat}
                  type="button"
                  onClick={() => onCategoryChange?.(cat)}
                  className="text-on-surface-variant hover:text-primary transition-colors duration-200"
                  whileHover={{ y: -1 }}
                >
                  {cat}
                </motion.button>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      {!showSearch && (
        <div className="md:hidden flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-secondary flex items-center justify-center text-on-secondary font-black text-sm">
            A
          </span>
          <span className="text-headline-md font-black text-on-surface">AlphaEdge</span>
        </div>
      )}

      {showSearch && categoryStyle === "underline" && (
        <LayoutGroup>
          <nav className="hidden md:flex h-full gap-6 relative">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onCategoryChange?.(cat)}
                  className={`h-full flex items-center text-label-uppercase transition-colors duration-200 border-b-2 pb-1 relative ${
                    isActive
                      ? "text-primary border-primary"
                      : "text-on-surface-variant hover:text-primary border-transparent"
                  }`}
                >
                  {cat}
                  {isActive && (
                    <motion.span
                      layoutId="category-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </LayoutGroup>
      )}

      <div className="flex items-center gap-4 text-on-surface-variant">
        <ThemeSwitcher />
        {["account_balance", "grid_view", "refresh"].map((icon) => (
          <motion.button
            key={icon}
            type="button"
            onClick={() => {
              if (icon === "refresh") {
                handleRefresh();
                return;
              }

              onNavigate?.(icon === "grid_view" ? "portfolios" : "dashboard");
            }}
            className="hover:text-primary transition-colors duration-200"
            whileHover={{ scale: 1.1, rotate: icon === "refresh" ? 90 : 0 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <MaterialIcon name={icon} size={20} />
          </motion.button>
        ))}
        <AnimatePresence>
          {showProfile && (
            <motion.img
              key="profile"
              alt="Profile"
              className="w-8 h-8 rounded-full ml-2 border border-outline-variant object-cover cursor-pointer"
              src={PROFILE_IMG}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.08 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              onClick={() => toast.info("Profile menu coming soon!")}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
