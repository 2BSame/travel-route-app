import { Place } from "../types/place";

export function filterPlacesByMood(places: Place[], selectedMood: string) {
  return places.filter((place) => place.moodTags.includes(selectedMood));
}
