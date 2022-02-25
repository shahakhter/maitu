import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ModalController } from '@ionic/angular';
import { UtilityService } from 'src/app/services/utility';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  private isLogin = false;
  private isEmailValid = true;

  item = {
    'email': ''
  };

  constructor(
    private modalCtrl: ModalController,
    private fireAuth: AngularFireAuth,
    private util: UtilityService,
  ) { }

  ngOnInit() {
  }

  onResetFunc(): void {
    if (this.validate()) {
      this.isLogin = true;
      this.fireAuth.sendPasswordResetEmail(this.item.email).then(() => {
        this.isLogin = false;
        this.util.successNotification('Reset link is sent please check your email.', 'success', 'top');
      }).catch(err => {
        if (err.code === 'auth/user-not-found') {
          this.isLogin = false;
          this.util.shoNotification('This email is not registered.', 'danger', 'top');
        }
      });
    }
  }

  validate(): boolean {
    this.isEmailValid = true;
    const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;

    if (!this.item.email || this.item.email.length === 0) {
      this.isEmailValid = false;
    }

    if (!emailfilter.test(this.item.email)) {
      this.isEmailValid = false;
    }

    return this.isEmailValid;
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

}
