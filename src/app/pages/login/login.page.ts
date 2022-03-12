import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { UtilityService } from 'src/app/services/utility';
import { SignupPage } from 'src/app/signup/signup.page';
import { ForgotPasswordPage } from '../forgot-password/forgot-password.page';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  private isLogin = false;
  private isEmailValid = true;
  private isPasswordValid = true;

  item = {
    'email': '',
    'password': ''
  };

  constructor(
    private router: Router,
    private modalController: ModalController,
    private authService: AuthService,
    private util: UtilityService,
    private fb: Facebook,
    public afAuth: AngularFireAuth,
  ) {
  }

  ngOnInit() {

  }

  onLoginFunc(): void {
    if (this.validate()) {
      this.isLogin = true;
      this.authService.login(this.item.email, this.item.password).then((user) => {
        this.authService.getUserProfile().on('value', snapshot => {
          let subscription = snapshot.val().subscription;
          this.isLogin = false;
          this.item.email = '';
          this.item.password = '';
          if (subscription === 'Expired') {
            this.router.navigate(['/payment']);
          }
          else {
            this.router.navigate(['/tabs/tab1']);
          }
        });
      }).catch(err => {
        console.log(JSON.stringify(err));
        if (err.code === 'auth/user-not-found') {
          this.util.shoNotification('This email is not registered.', 'danger', 'top');
        }
        else if (err.code === 'auth/wrong-password') {
          this.util.shoNotification('You have entered wrong password.', 'danger', 'top');
        }
      }).then(el => this.isLogin = false)
    }
  }

  async onRegisterFunc() {
    const modal = await this.modalController.create({
      component: SignupPage,
      cssClass: 'my-custom-class',
    });
    return await modal.present();
  }

  async FBRegister() {
    this.fb.login(['email'])
      .then((response: FacebookLoginResponse) => {
        this.onLoginSuccess(response);
        console.log(response.authResponse.accessToken);
      }).catch((error) => {
        console.log(error)
        alert('error:' + JSON.stringify(error))
      });
  }

  onLoginSuccess(res: FacebookLoginResponse) {
    // const { token, secret } = res;
    const credential = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
    this.afAuth.signInWithCredential(credential)
      .then((response) => {
        this.goFBlogin();
      });
  }

  goFBlogin() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        var name = user.displayName.trim().split(" ");
        firebase.database().ref('users').child(user.uid).update({
          firstName: name[0],
          lastName: name[1],
          displayName: user.displayName,
          photoURL: user.photoURL,
          uid: user.uid,
          email: user.email,
          gender: '',
          about: '',
          location: '',
          following: [],
          followingCount: 0,
          followers: [],
          followersCount: 0,
          nationality: '',
          dob: '',
          marital: '',
          education: '',
          status: 'pending',
          subscription: 'Expired',
          fcm_token: localStorage.getItem('fcm') ? localStorage.getItem('fcm') : '',
          phoneNumber: '',
        });
        this.router.navigate(['/tabs/tab1']);
      }
    });
  }

  async onForgotPasswordFunc() {
    const modal = await this.modalController.create({
      component: ForgotPasswordPage,
      cssClass: 'my-custom-class',
    });
    return await modal.present();
  }

  validate(): boolean {
    this.isEmailValid = true;
    this.isPasswordValid = true;
    const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;

    if (!this.item.email || this.item.email.length === 0) {
      this.isEmailValid = false;
    }

    if (!emailfilter.test(this.item.email)) {
      this.isEmailValid = false;
    }

    if (!this.item.password || this.item.password.length === 0) {
      this.isPasswordValid = false;
    }

    if (this.item.password.length < 7) {
      this.isPasswordValid = false;
    }

    return this.isPasswordValid && this.isEmailValid;
  }

}
