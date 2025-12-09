export interface EnumOption<T> {
  title: string;
  value: T;
}

export function useEnumHelper<T extends number>(labels: Record<T, string>) {
  const getLabel = (value: T): string => {
    return labels[value] ?? "N/A";
  };

  const getOptions = (): EnumOption<T>[] => {
    return (Object.entries(labels)).map(([value, title]) => ({
      value: Number(value) as T,
      title: title as string,
    }));
  };

  return { getLabel, getOptions };
}
