import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterMultiSelectProps {
  label?: string;
  values: string[];
  onValuesChange: (values: string[]) => void;
  placeholder?: string;
  options: FilterOption[];
  className?: string;
}

const FilterMultiSelect = ({
  label,
  values,
  onValuesChange,
  placeholder = "Select options",
  options,
  className = "",
}: FilterMultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleToggle = (value: string) => {
    // If "all" is clicked
    if (value === "all") {
      if (values.includes("all")) {
        // If "all" is already selected, uncheck it
        onValuesChange([]);
      } else {
        // If "all" is not selected, select only "all" and remove others
        onValuesChange(["all"]);
      }
    } else {
      // If a non-"all" option is clicked
      let newValues: string[];

      if (values.includes(value)) {
        // Uncheck the clicked value
        newValues = values.filter((v) => v !== value);
      } else {
        // Check the clicked value and remove "all" if it exists
        newValues = [...values.filter(v => v !== "all"), value];
      }

      // If no values are selected, default to "all"
      if (newValues.length === 0) {
        newValues = ["all"];
      }

      onValuesChange(newValues);
    }
  };

  const display =
    values.length === 0
      ? placeholder
      : options
        .filter((opt) => values.includes(opt.value))
        .map((opt) => opt.label)
        .join(", ");

  return (
    <div className={className + " relative"} ref={dropdownRef}>
      <label className="text-sm lg:text-base font-medium mb-2 block">{label}</label>
      <Button
        type="button"
        variant="outline"
        className="w-full flex justify-between items-center"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="truncate text-left">{display}</span>
        <span className="ml-2"><ChevronDown className="text-gray-400" /></span>
      </Button>
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-background border rounded shadow p-2 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <label key={option.value} className="flex items-center gap-2 py-1 cursor-pointer">
              <Checkbox
                checked={values.includes(option.value)}
                onCheckedChange={() => handleToggle(option.value)}
                id={`multi-${option.value}`}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterMultiSelect;
