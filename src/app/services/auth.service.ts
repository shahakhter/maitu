import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;
 
const TOKEN_KEY = 'uid';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  firedata = firebase.database().ref('/users');

  constructor(
    private fireAuth: AngularFireAuth,
    private firestore: AngularFirestore,
  ) {
    this.loadToken();
  }

  async loadToken() {
    const token = await Storage.get({ key: TOKEN_KEY });    
    if (token && token.value) {
      console.log('set token: ' + token.value);
      this.isAuthenticated.next(true);
    } else {
      this.isAuthenticated.next(false);
    }
  }

  public login(email: string, password: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.signInWithEmailAndPassword(email, password)
        .then(res => {
          if (res.user) {
            firebase.database().ref('users').child(res.user.uid).update({
              fcm_token: localStorage.getItem('fcm') ? localStorage.getItem('fcm') : ''
            });
            Storage.set({key: TOKEN_KEY, value: res.user.uid})
            this.isAuthenticated.next(true);
            resolve(res.user);
          }
        })
        .catch(err => {
          this.isAuthenticated.next(false);
          reject(err);
        });
    });
  }

  public register(email: string, password: string, firstName: string, lastName: string, phone: string, dob: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.createUserWithEmailAndPassword(email, password)
        .then(res => {
          if (res.user) {
            firebase.database().ref('users').child(res.user.uid).set({
              firstName: firstName,
              lastName: lastName,
              displayName: firstName + " " + lastName,
              email: email,
              uid: res.user.uid,
              gender: '',
              about: '',
              location: '',
              following: [],
              followingCount: 0,
              followers: [],
              followersCount: 0,
              nationality: '',
              dob: dob,
              marital: '',
              education: '',
              status: 'pending',
              fcm_token: localStorage.getItem('fcm') ? localStorage.getItem('fcm') : '',
              phoneNumber: phone,
              photoURL: "https://firebasestorage.googleapis.com/v0/b/maitu-338812.appspot.com/o/avatar.png?alt=media&token=cc0b5cc3-239e-46fe-ada6-f7f5292801bf",
            });
            Storage.set({key: TOKEN_KEY, value: res.user.uid})
            this.isAuthenticated.next(true);
            resolve(res.user);
          }
        })
        .catch(err => {
          console.log(err)
          reject(err)
        });
    });
  }

  public checkAuth() {
    return new Promise((resolve, reject) => {
      this.fireAuth.onAuthStateChanged(user => {
        console.log(user);
        if (user) {
          localStorage.setItem('uid', user.uid);
          resolve(user);
        } else {
          this.logout();
          localStorage.clear();
          resolve(false);
        }
      });
    });
  }

  getUserDetails(id) {
    var promise = new Promise((resolve, reject) => {
      this.firedata.child(id).once('value', (snapshot) => {
        resolve(snapshot.val());
      }).catch((err) => {
        reject(err);
      })
    })
    return promise;
  }

  public logout(): Promise<void> {
    Storage.remove({key: TOKEN_KEY });
    this.isAuthenticated.next(false);
    return this.fireAuth.signOut();
  }
}
