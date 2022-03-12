import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
    private firestore: AngularFirestore
  ) { }

  addUser(uid, data) {
    return this.firestore.collection('users').doc(uid).set(data);
  }

  fetchGroups() {
    return this.firestore.collection('groups').snapshotChanges();
  }

  getUser(uid) {
    return this.firestore.collection('users').doc(uid).snapshotChanges();
  }


}
