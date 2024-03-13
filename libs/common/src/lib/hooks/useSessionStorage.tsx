const useSessionStorage = (key: string) => {
  const getParsed = (json: string | null) => {
    try {
      return typeof json === 'string' ? JSON.parse(json) : null;
    } catch (error) {
      console.warn(error);
      return json ?? null;
    }
  };
  return {
    value: getParsed(sessionStorage.getItem(key)),
    setValue: (data: any) => sessionStorage.setItem(key, JSON.stringify(data)),
    reset: sessionStorage.clear(),
    remove: () => sessionStorage.removeItem(key),
    removeKey: (givenKey: string) => sessionStorage.removeItem(givenKey),
  };
};

export default useSessionStorage;
