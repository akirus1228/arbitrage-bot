import firebase from 'firebase';

const firebaseConfig = {
  apiKey: "AIzaSyC2rbFweWSELh-lClU5bZAnTTMUvyyOo3w",
  authDomain: "arbitrage-bot-1228.firebaseapp.com",
  databaseURL: "https://arbitrage-bot-1228-default-rtdb.firebaseio.com",
  projectId: "arbitrage-bot-1228",
  storageBucket: "arbitrage-bot-1228.appspot.com",
  messagingSenderId: "460648384512",
  appId: "1:460648384512:web:8831a43186575c6001b0e5",
  measurementId: "G-SPRBKKFTEB"
};

const app = firebase.initializeApp(firebaseConfig);
firebase.analytics();

export default firebase;

export const database = firebase.database(app);
export const auth = firebase.auth();
export const storage = firebase.storage();
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
