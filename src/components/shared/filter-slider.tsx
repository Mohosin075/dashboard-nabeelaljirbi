import { Slider } from "../ui/slider";

interface FilterSliderProps {
  label: string;
  value: number[];
  onValueChange: (value: number[]) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  className?: string;
}

const FilterSlider = ({
  label,
  value,
  onValueChange,
  min,
  max,
  step,
  unit = "",
  className = "",
}: FilterSliderProps) => {
  return (
    <div className={className}>
      <label className="text-sm lg:text-base font-medium mb-3 block">{label}</label>
      <Slider
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
        className="mb-2"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{value[0]}{unit}</span>
        <span>{value[1]}{unit}</span>
      </div>
    </div>
  );
};

export default FilterSlider;
