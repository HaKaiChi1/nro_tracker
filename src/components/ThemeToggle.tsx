"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-9 w-9" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="btn-outline h-9 w-9 justify-center p-0"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Đổi giao diện sáng/tối"
      title="Đổi giao diện sáng/tối"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
