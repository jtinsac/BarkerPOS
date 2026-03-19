import { ref, push, set, onValue } from "firebase/database";
import { db } from "../lib/firebase";

export function addTestMessage() {
  const messageRef = ref(db, "test/message");

  set(messageRef, {
    text: "Hello from Mars!",
    createdAt: Date.now()
  });
}

export function listenToMessage(callback) {
  const messageRef = ref(db, "test/message");

  return onValue(messageRef, (snapshot) => {
    callback(snapshot.val());
  });
}