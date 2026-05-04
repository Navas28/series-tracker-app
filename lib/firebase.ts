import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Initialize Firestore with long polling if needed for some environments, 
// but for native it usually works out of the box.
export const db = firestore();
export const firebaseAuth = auth();

export default {
  db,
  auth: firebaseAuth,
};
