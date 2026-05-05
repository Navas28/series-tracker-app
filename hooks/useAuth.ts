import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithCredential, 
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  FirebaseAuthTypes
} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth } from '@/lib/firebase';

export function useAuth() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    // New Modular API: onAuthStateChanged(authInstance, callback)
    const subscriber = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    
    return subscriber; // unsubscribe on unmount
  }, [initializing]);

  const signInWithGoogle = async () => {
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Get the users ID token
      const { data } = await GoogleSignin.signIn();
      
      if (!data?.idToken) {
        throw new Error('No ID token found');
      }

      // Create a Google credential with the token
      const credential = GoogleAuthProvider.credential(data.idToken);

      // Sign-in the user with the credential
      return signInWithCredential(auth, credential);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign-Out Error:', error);
    }
  };

  return {
    user,
    initializing,
    signInWithGoogle,
    signOut,
  };
}
