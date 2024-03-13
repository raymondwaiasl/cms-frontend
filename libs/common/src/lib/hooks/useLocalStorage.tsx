const useLocalStorage = (key: string) => {
  const getParsed = (json: string | null) => {
    try {
      return typeof json === 'string' ? JSON.parse(json) : null;
    } catch (error) {
      console.warn(error);
      return null;
    }
  };
  return {
    value: getParsed(localStorage.getItem(key)),
    setValue: (data: any) => localStorage.setItem(key, JSON.stringify(data)),
    reset: localStorage.clear(),
    remove: () => localStorage.removeItem(key),
    removeKey: (givenKey: string) => localStorage.removeItem(givenKey),
  };
};

export default useLocalStorage;
