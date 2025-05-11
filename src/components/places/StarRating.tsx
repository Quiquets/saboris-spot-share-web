
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
    <div className="space-y-2">
      <label className="block font-medium text-gray-700">{label}</label>
      <div className="flex items-center">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1 transition-transform hover:scale-110"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => onChange(star)}
            >
              <Star 
                className={`h-7 w-7 transition-all duration-200 ${
                  (hoverRating ? hoverRating >= star : value >= star)
                    ? "text-yellow-400 fill-yellow-400 drop-shadow-sm"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
        <span className={`ml-3 font-medium transition-opacity duration-300 ${
          value > 0 ? "opacity-100" : "opacity-0"
        }`}>
          {value > 0 ? `${value}/5` : ""}
        </span>
      </div>
    </div>
  );
}
