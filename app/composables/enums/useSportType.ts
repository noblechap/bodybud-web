import { SportType } from "~/types/sportType";
import { useEnumHelper } from "./useEnumHelpers";

export function useSportType() {
  const { getLabel, getOptions } = useEnumHelper<SportType>({
    [SportType.Musculation]: "Musculation",
    [SportType.Cardio]: "Cardio",
    [SportType.Crossfit]: "Crossfit",
    [SportType.Yoga]: "Yoga",
    [SportType.Pilates]: "Pilates",
    [SportType.Boxe]: "Boxe",
    [SportType.Natation]: "Natation",
    [SportType.Course]: "Course",
  });

  return {
    getSportTypeLabel: getLabel,
    getSportTypeOptions: getOptions,
  };
}
