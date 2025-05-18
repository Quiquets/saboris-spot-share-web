import React from "react";
import { Heart, Calendar } from "lucide-react";
import type { ExplorePlace } from "@/types/explore";

export default function InfoWindowContent({
  place,
  onToggleSave,
  onInvite,
}: {
  place: ExplorePlace;
  onToggleSave: (placeId: string) => void;
  onInvite: (placeId: string) => void;
}) {
  const maxScore = Math.max(
    place.avgOverall,
    place.avgValue ?? 0,
    place.avgAtmosphere ?? 0
  );
  const style = (val?: number) =>
    val === maxScore ? "font-bold text-saboris-primary" : "";

  return (
    <div className="p-2 w-64">
      <header className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{place.name}</h3>
          {place.category && (
            <small className="text-xs text-gray-600">{place.category}</small>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => onToggleSave(place.placeId)}>
            <Heart className="text-saboris-primary" />
          </button>
          <button onClick={() => onInvite(place.placeId)}>
            <Calendar className="text-gray-600" />
          </button>
        </div>
      </header>

      <div className="my-2 flex overflow-x-auto gap-1">
        {place.reviewers.flatMap((r, i) =>
          r.photoUrls.map((url, j) => (
            <img
              key={`${i}-${j}`}
              src={url}
              className="h-16 w-16 object-cover rounded"
            />
          ))
        )}
      </div>

      <div className="text-sm mb-2 space-y-1">
        <div>
          Overall:{" "}
          <span className={style(place.avgOverall)}>
            {place.avgOverall.toFixed(1)}
          </span>
        </div>
        {place.avgValue != null && (
          <div>
            Value:{" "}
            <span className={style(place.avgValue)}>
              {place.avgValue.toFixed(1)}
            </span>
          </div>
        )}
        {place.avgAtmosphere != null && (
          <div>
            Atmosphere:{" "}
            <span className={style(place.avgAtmosphere)}>
              {place.avgAtmosphere.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <hr />

      <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
        {place.reviewers.map((r) => (
          <li key={r.userId} className="flex justify-between">
            <span className="font-medium">{r.userName}</span>
            <span>{r.ratingOverall.toFixed(1)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
