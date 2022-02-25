import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { IonNav, ModalController, NavController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { UtilityService } from '../services/utility';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  isRegister = false;
  private isFirstNameValid = true;
  private isLastNameValid = true;
  private isPhoneNumberValid = true;
  private isEmailValid = true;
  private isPasswordValid = true;
  private isConfirmPasswordValid = true;

  years = [];

  year = new Date().getFullYear();

  item = {
    'firstName': '',
    'lastName': '',
    'phoneNumber': '',
    'email': '',
    'password': '',
    'confirmPassword': '',
    'day': '01',
    'month': '01',
    'year': 1991
  };

  constructor(
    private router: Router,
    private nav: NavController,
    private modalController: ModalController,
    private authService: AuthService,
    private util: UtilityService,
    private fire: AngularFireAuth,
  ) { }

  ngOnInit() {

    for (let i = 1990; i < this.year; i++) {
      this.years.push({
        'year': i + 1
      });
    }

    console.log(this.years);

  }

  closeModal() {
    this.modalController.dismiss();
  }

  onRegisterFunc() {
    if (this.validate()) {
      this.isRegister = true;
      let dob = this.item.month + "-" + this.item.day + "-" + this.item.year;
      this.authService.register(this.item.email, this.item.password, this.item.firstName, this.item.lastName, this.item.phoneNumber, dob).then((userData) => {
        console.log(userData);
        this.nav.navigateForward(['/complete-profile']);
        this.closeModal();
        this.isRegister = false;
      }).catch(err => {
        console.log(err);
        if (err.code === 'auth/email-already-in-use') {
          this.util.shoNotification('This email is already in use.', 'danger', 'top');
        }
      }).then(el => this.isRegister = false);
    }
  }

  validate(): boolean {

    const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;

    this.isFirstNameValid = true;
    this.isLastNameValid = true;
    this.isPhoneNumberValid = true;
    this.isEmailValid = true;
    this.isPasswordValid = true;
    this.isConfirmPasswordValid = true;

    if (!this.item.firstName || this.item.firstName.length === 0) {
      this.isFirstNameValid = false;
    }

    if (!this.item.lastName || this.item.lastName.length === 0) {
      this.isLastNameValid = false;
    }

    if (!this.item.phoneNumber || this.item.phoneNumber.length === 0) {
      this.isPhoneNumberValid = false;
    }

    if (!this.item.email || this.item.email.length === 0) {
      this.isEmailValid = false;
    }

    if (!emailfilter.test(this.item.email)) {
      this.isEmailValid = false;
    }

    if (!this.item.password || this.item.password.length === 0) {
      this.isPasswordValid = false;
    }

    if (!this.item.confirmPassword || this.item.confirmPassword.length === 0) {
      this.isConfirmPasswordValid = false;
    }

    if (this.item.password.length < 7 || this.item.confirmPassword.length < 7) {
      this.util.shoNotification('Password should be at least 6 characters', 'danger', 'top');
      return false;
    }

    if (this.item.password !== this.item.confirmPassword) {
      this.util.shoNotification('Password does not match', 'danger', 'top');
      return false;
    }

    return this.isFirstNameValid && this.isLastNameValid && this.isPhoneNumberValid && this.isEmailValid && this.isPasswordValid && this.isConfirmPasswordValid;
  }

}
