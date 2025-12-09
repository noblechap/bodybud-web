export function useUrl() {
  const route = useRoute();
  const router = useRouter();

  function updateQueryParameterInURL(queryParamName: string, value: string) {
    router.replace({
      query: { ...route.query, [queryParamName]: value },
    });
  }

  function getQueryParameterFromURL<T extends string>(
    queryParamName: string,
    validValues: T[],
    defaultValue: T,
  ): T {
    const queryValue = route.query[queryParamName];
    if (typeof queryValue === "string" && validValues.includes(queryValue as T)) {
      return queryValue as T;
    }
    return defaultValue;
  }

  function createQueryParamComputed<T extends string>(
    queryParamName: string,
    validValues: T[],
    defaultValue: T,
  ) {
    return computed({
      get: () => getQueryParameterFromURL(queryParamName, validValues, defaultValue),
      set: (value: T) => updateQueryParameterInURL(queryParamName, value),
    });
  }

  return {
    updateQueryParameterInURL,
    getQueryParameterFromURL,
    createQueryParamComputed,
  };
}
