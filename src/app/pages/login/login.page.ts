import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { UtilityService } from 'src/app/services/utility';
import { SignupPage } from 'src/app/signup/signup.page';
import { ForgotPasswordPage } from '../forgot-password/forgot-password.page';

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
  ) { 
  }

  ngOnInit() {

  }

  onLoginFunc(): void {
    if (this.validate()) {
      this.isLogin = true;
      this.authService.login(this.item.email, this.item.password).then((user) => {
        this.item.email = '';
        this.item.password = '';
        this.isLogin = false;
        this.router.navigate(['/tabs/tab1']);
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
