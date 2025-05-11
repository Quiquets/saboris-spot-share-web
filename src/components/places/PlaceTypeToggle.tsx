
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
        className={value === "restaurant" ? "bg-saboris-primary hover:bg-saboris-primary/90" : ""}
        onClick={() => onChange("restaurant")}
      >
        <Utensils className="mr-2 h-4 w-4" />
        Restaurant
      </Button>
      <Button
        type="button"
        variant={value === "bar" ? "default" : "outline"}
        className={value === "bar" ? "bg-saboris-primary hover:bg-saboris-primary/90" : ""}
        onClick={() => onChange("bar")}
      >
        <Wine className="mr-2 h-4 w-4" />
        Bar
      </Button>
      <Button
        type="button"
        variant={value === "cafe" ? "default" : "outline"}
        className={value === "cafe" ? "bg-saboris-primary hover:bg-saboris-primary/90" : ""}
        onClick={() => onChange("cafe")}
      >
        <Coffee className="mr-2 h-4 w-4" />
        Café
      </Button>
    </div>
  );
}
