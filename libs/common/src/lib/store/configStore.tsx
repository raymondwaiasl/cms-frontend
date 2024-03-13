import type { WidgetDetail } from '../api/common';
import { atom } from 'recoil';

const configStore = atom<{ [key: string]: WidgetDetail }>({ key: 'config', default: {} });

export default configStore;
