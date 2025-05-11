
import { Button } from "@/components/ui/button";

interface PriceRangeSelectorProps {
  value: string;
  onChange: (price: string) => void;
}

export function PriceRangeSelector({ value, onChange }: PriceRangeSelectorProps) {
  const priceOptions = [
    { label: "$", value: "$" },
    { label: "$$", value: "$$" },
    { label: "$$$", value: "$$$" },
    { label: "$$$$", value: "$$$$" }
  ];

  return (
    <div className="space-y-2">
      <label className="block font-medium">Price Range</label>
      <div className="flex space-x-2">
        {priceOptions.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={value === option.value ? "default" : "outline"}
            className={`px-4 ${value === option.value ? "bg-saboris-primary hover:bg-saboris-primary/90" : ""}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
