import React from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { useTheme } from "../../../state";
import { MenuItem } from "./MenuItem";

export const ToggleThemeButton: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div onClick={() => setTheme(theme === "default" ? "dark" : "default")} data-testid="toggle-theme-button">
      <MenuItem>
        {
          theme === "default" 
            ? <MoonIcon className="h-6 w-6" /> 
            : <SunIcon className="h-6 w-6"/>
        }
      </MenuItem>
    </div>
  );
};