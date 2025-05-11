
import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  label: string;
}

export function StarRating({ value, onChange, label }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  
  return (
    <div className="space-y-1">
      <label className="block font-medium text-sm">{label}</label>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-1"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => onChange(star)}
          >
            <Star 
              className={`h-6 w-6 ${
                (hoverRating ? hoverRating >= star : value >= star)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              } transition-colors`}
            />
          </button>
        ))}
        <span className="ml-2 text-gray-500 text-sm self-center">
          {value > 0 ? `${value}/5` : ""}
        </span>
      </div>
    </div>
  );
}
