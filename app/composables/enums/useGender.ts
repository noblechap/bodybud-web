import { Gender } from "~/types/gender";
import { useEnumHelper } from "./useEnumHelpers";

export function useGender() {
  const { getLabel, getOptions } = useEnumHelper<Gender>({
    [Gender.Male]: "Man",
    [Gender.Female]: "Woman",
    [Gender.Other]: "Other",
  });

  return {
    getGenderLabel: getLabel,
    getGenderOptions: getOptions,
  };
}
