import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';
import { Router } from '@angular/router';
declare const braintree

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
})
export class PaymentPage implements OnInit {

  currentUserId;
  amount = "4.38";
  isProcessing: boolean = true;
  date;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.date = new Date();
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.currentUserId = user.uid;
      }
    });
  }

  ngOnInit() {
    this.initalizeBrainTree();
  }

  initalizeBrainTree() {
    const that = this;
    this.getClientTokenForPaypal().then((res: any) => {
      let checkout;
      if (res.clientToken) {
        setTimeout(() => {
          this.isProcessing = false;
        }, 500);
      }
      braintree.setup(res.clientToken, 'custom', {
        paypal: {
          container: 'paypal-container',
        },
        onReady: function (integration) {
          checkout = integration;
        },
        onCancelled: (obj) => {
          console.log('Cancelled', obj);
          checkout.teardown(() => { checkout = null });
        },
        onPaymentMethodReceived: (obj) => {
          checkout.teardown(() => {
            this.isProcessing = false;
            checkout = null;
            that.handleBraintreePayment(obj.nonce);
          });
        }
      })
    });
  }

  async getClientTokenForPaypal() {
    return await this.http.get('https://maitu-payment-api.herokuapp.com/brainTreeClientToken').toPromise();
  }

  async handleBraintreePayment(nonce) {
    this.makePaymentRequest(this.amount, nonce).then((transaction) => {
      if (transaction["success"] === true) {
        console.log("Transaction successfull !");
        if (this.amount === '4.38') {
          firebase.database().ref('users').child(this.currentUserId).update({
            subscription: '1 Month',
            expiry: this.date.setMonth(this.date.getMonth() + 1)
          }).then(() => {
            this.router.navigate(['/tabs/tab1']);
          });
        }
        else if (this.amount === '13.13') {
          firebase.database().ref('users').child(this.currentUserId).update({
            subscription: '6 Month',
            expiry: this.date.setMonth(this.date.getMonth() + 6)
          }).then(() => {
            this.router.navigate(['/tabs/tab1']);
          });
        }
      }
      else {
        console.log("Transaction failed !");
      }
      console.log('Transaction', transaction);
    })
  }

  async makePaymentRequest(amount, nonce) {
    const paymentDetails = {
      paymentAmount: amount,
      nonceFromTheClient: nonce
    }
    return await this.http.post('https://maitu-payment-api.herokuapp.com/checkoutWithPayment', paymentDetails).toPromise();
  }

}
