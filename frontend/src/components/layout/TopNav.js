"use client";

import { MaterialIcon } from "@/components/ui/MaterialIcon";

const CATEGORIES = ["Equities", "Forex", "Crypto", "Fixed Income"];

const PROFILE_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC0KIazcraWE4HYTtQC57Ry7JQtdS3cm8ICNtbk2IHYlGs882zeKtS64bhpWSpQ2FGtTwQCVY8R47hKfnaieHp7Yd56exlmgBe0lZtpHC3M2tVMTeqpExlSXQqeErML6lB7DTYuQf9wvHCOsk-vxGfhW3h7QO2qgD3xOOEXDrJ07kLGtfO_em7ISv5Km26jNW8hetAtGzKItTsb4k6cuKNZXIBtZB46aEw4KfEpwnqGW8FFZk6YI8jrcw";

export default function TopNav({
  searchPlaceholder,
  activeCategory = "Equities",
  onCategoryChange,
  showSearch = true,
  showProfile = false,
  categoryStyle = "underline",
}) {
  return (
    <header className="fixed top-0 right-0 w-full md:w-[calc(100%-240px)] z-30 bg-surface border-b border-outline-variant h-12 flex justify-between items-center px-margin-mobile md:px-margin-desktop">
      <div className="flex items-center gap-6">
        <button className="md:hidden text-on-surface-variant hover:text-primary">
          <MaterialIcon name="menu" size={24} />
        </button>

        {showSearch ? (
          <div className="hidden md:flex items-center gap-4 h-full">
            <div className="relative focus-within:ring-1 focus-within:ring-secondary rounded overflow-hidden flex items-center bg-surface-container h-8 px-3 border border-outline-variant w-64">
              <MaterialIcon name="search" size={16} className="text-on-surface-variant mr-2" />
              <input
                type="text"
                placeholder={searchPlaceholder || "Search Ticker, Asset, ISIN..."}
                className="bg-transparent border-none p-0 text-on-surface text-body-sm focus:ring-0 w-full placeholder:text-on-surface-variant outline-none"
              />
            </div>
          </div>
        ) : (
          <nav className="hidden md:flex items-center gap-6 text-label-uppercase">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange?.(cat)}
                className="text-on-surface-variant hover:text-primary transition-colors duration-200"
              >
                {cat}
              </button>
            ))}
          </nav>
        )}
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
        <nav className="hidden md:flex h-full gap-6">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange?.(cat)}
                className={`h-full flex items-center text-label-uppercase transition-colors duration-200 border-b-2 pb-1 ${
                  isActive
                    ? "text-primary border-primary"
                    : "text-on-surface-variant hover:text-primary border-transparent"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </nav>
      )}

      <div className="flex items-center gap-4 text-on-surface-variant">
        {["account_balance", "grid_view", "refresh"].map((icon) => (
          <button key={icon} className="hover:text-primary transition-colors duration-200">
            <MaterialIcon name={icon} size={20} />
          </button>
        ))}
        {showProfile && (
          <img
            alt="Profile"
            className="w-8 h-8 rounded-full ml-2 border border-outline-variant object-cover"
            src={PROFILE_IMG}
          />
        )}
      </div>
    </header>
  );
}
