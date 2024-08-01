// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAg-P7rHjQiXs8a43I9TEXyIt6p_SpYX1M",
  authDomain: "inventory-mangment-d85d6.firebaseapp.com",
  projectId: "inventory-mangment-d85d6",
  storageBucket: "inventory-mangment-d85d6.appspot.com",
  messagingSenderId: "223013094269",
  appId: "1:223013094269:web:ad95cc79f3156e92398214",
  measurementId: "G-8682LBNY7Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);

export {firestore}
