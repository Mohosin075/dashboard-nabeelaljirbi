import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: FilterOption[];
  className?: string;
}

const FilterSelect = ({
  label,
  value,
  onValueChange,
  placeholder = "Select an option",
  options,
  className = "",
}: FilterSelectProps) => {
  return (
    <div className={className}>
      <label className="text-sm lg:text-base font-medium mb-2 block">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-background z-50">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterSelect;
