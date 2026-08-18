"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "./input";

export interface SearchBoxProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  value = "",
  onChange,
  onSearch,
  placeholder = "Search workspace, notes, documents...",
  className,
}) => {
  const [query, setQuery] = React.useState(value);

  React.useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange?.(val);
  };

  const handleClear = () => {
    setQuery("");
    onChange?.("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch?.(query);
    }
  };

  return (
    <div className={className}>
      <Input
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        leftIcon={<Search className="h-4 w-4" />}
        rightIcon={
          query ? (
            <button
              onClick={handleClear}
              className="hover:text-foreground transition-colors p-0.5 rounded"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : undefined
        }
      />
    </div>
  );
};
