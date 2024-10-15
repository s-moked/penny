import { initializeApp } from 'firebase/app';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCfotSrf3acFpx3rWTRnr8-zcBboEpoDG4",
  authDomain: "alfred-penny.firebaseapp.com",
  databaseURL: "https://alfred-penny-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "alfred-penny",
  storageBucket: "alfred-penny.appspot.com",
  messagingSenderId: "323674366687",
  appId: "1:323674366687:web:30abd12a33d7d2f028bf6a",
  measurementId: "G-3E2VYQV5GG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const sendPasswordCreationEmail = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('Password reset email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};