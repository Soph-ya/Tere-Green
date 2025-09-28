import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBevMxMq1MELT5lPTIkibMZe3YSRVtL5Ro",
  authDomain: "tere-green.firebaseapp.com",
  projectId: "tere-green",
  storageBucket: "tere-green.appspot.com", //"tere-green.firebasestorage.app",
  messagingSenderId: "746372290291",
  appId: "1:746372290291:web:6526e7d58cf6d446940986"
};

const app = initializeApp(firebaseConfig);

export const firebase = initializeApp(firebaseConfig);
export const auth = getAuth(firebase);
export const db = getFirestore(app);
export const storage = getStorage(app);