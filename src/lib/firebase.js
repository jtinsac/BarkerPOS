import {initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getDatabase} from "firebase/database";

export const firebaseConfig = {
  apiKey: "AIzaSyCpa2JrW-H52zY9dqvOovStpg9X_fJv878",
  authDomain: "barkerpos.firebaseapp.com",
  databaseURL: "https://barkerpos-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "barkerpos",
  storageBucket: "barkerpos.firebasestorage.app",
  messagingSenderId: "649147435958",
  appId: "1:649147435958:web:6fc4343673733c90658f17"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);