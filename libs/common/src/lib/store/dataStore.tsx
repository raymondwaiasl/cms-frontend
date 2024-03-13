import { atom } from 'recoil';

const dataStore = atom<{ [key: string]: any }>({
  key: 'textState', // unique ID (with respect to other atoms/selectors)
  default: {}, // default value (aka initial value)
});

export default dataStore;
