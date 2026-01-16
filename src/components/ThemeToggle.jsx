import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Moon, Sun } from "lucide-react";
import { toggleTheme } from "../redux/slices/themeSlice";

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="glass p-3 rounded-xl hover-lift hover-glow group relative overflow-hidden"
      aria-label="Toggle theme"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative">
        {theme === "dark" ? (
          <Sun className="w-5 h-5 text-warning transition-transform group-hover:rotate-180 duration-500" />
        ) : (
          <Moon className="w-5 h-5 text-secondary transition-transform group-hover:-rotate-12 duration-500" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
