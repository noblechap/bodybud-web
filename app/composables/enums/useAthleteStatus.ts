import { AthleteStatus } from "~/types/athleteStatus";
import { useEnumHelper } from "./useEnumHelpers";

export function useAthleteStatus() {
  const { getLabel, getOptions } = useEnumHelper<AthleteStatus>({
    [AthleteStatus.Active]: "Active",
    [AthleteStatus.Inactive]: "Inactive",
    [AthleteStatus.Injured]: "Injured",
    [AthleteStatus.Paused]: "Paused",
  });

  const getAthleteStatusColor = (status: AthleteStatus) => {
    switch (status) {
      case AthleteStatus.Active:
        return "success";
      case AthleteStatus.Inactive:
        return "grey";
      case AthleteStatus.Paused:
        return "warning";
      case AthleteStatus.Injured:
        return "error";
      default:
        return "cyan";
    }
  };

  return {
    getAthleteStatusLabel: getLabel,
    getAthleteStatusOptions: getOptions,
    getAthleteStatusColor,
  };
}
