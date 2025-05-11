
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Utensils, Wine, Coffee } from "lucide-react";

type PlaceType = "restaurant" | "bar" | "cafe";

interface PlaceTypeToggleProps {
  value: PlaceType;
  onChange: (type: PlaceType) => void;
}

export function PlaceTypeToggle({ value, onChange }: PlaceTypeToggleProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant={value === "restaurant" ? "default" : "outline"}
        className={`px-6 py-2 rounded-full transition-all ${
          value === "restaurant" 
            ? "bg-saboris-primary hover:bg-saboris-primary/90 text-white" 
            : "border-2 border-gray-200 hover:border-saboris-primary"
        }`}
        onClick={() => onChange("restaurant")}
      >
        <Utensils className="mr-2 h-4 w-4" />
        Restaurant
      </Button>
      <Button
        type="button"
        variant={value === "bar" ? "default" : "outline"}
        className={`px-6 py-2 rounded-full transition-all ${
          value === "bar" 
            ? "bg-saboris-primary hover:bg-saboris-primary/90 text-white" 
            : "border-2 border-gray-200 hover:border-saboris-primary"
        }`}
        onClick={() => onChange("bar")}
      >
        <Wine className="mr-2 h-4 w-4" />
        Bar
      </Button>
      <Button
        type="button"
        variant={value === "cafe" ? "default" : "outline"}
        className={`px-6 py-2 rounded-full transition-all ${
          value === "cafe" 
            ? "bg-saboris-primary hover:bg-saboris-primary/90 text-white" 
            : "border-2 border-gray-200 hover:border-saboris-primary"
        }`}
        onClick={() => onChange("cafe")}
      >
        <Coffee className="mr-2 h-4 w-4" />
        Café
      </Button>
    </div>
  );
}
