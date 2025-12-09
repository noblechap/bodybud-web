import { BodyPart } from "~/types/bodyPart";
import { useEnumHelper } from "./useEnumHelpers";

export function useBodyPart() {
  const { getLabel, getOptions } = useEnumHelper<BodyPart>({
    [BodyPart.Chest]: "Chest",
    [BodyPart.Back]: "Back",
    [BodyPart.Legs]: "Legs",
    [BodyPart.Arms]: "Arms",
    [BodyPart.Other]: "Other",
  });

  return {
    getBodyPartLabel: getLabel,
    getBodyPartOptions: getOptions,
  };
}
