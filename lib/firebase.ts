import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';

// Initialize instances using the modular API
export const auth = getAuth();
export const db = getFirestore();

export default {
  auth,
  db,
  app: getApp(),
};
