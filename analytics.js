// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDVhYCuZQfVohWhM1saYXAcHXYdvaAON28",
  authDomain: "quizzone-7231f.firebaseapp.com",
  projectId: "quizzone-7231f",
  storageBucket: "quizzone-7231f.firebasestorage.app",
  messagingSenderId: "414905597537",
  appId: "1:414905597537:web:f33558d6f4ec648a8f7420",
  measurementId: "G-E40HWE9G2K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
