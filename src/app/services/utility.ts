import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastController, LoadingController } from '@ionic/angular';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})

export class UtilityService {

 
  setting: any;
  isLoading = false;
  public packgeName = '';
 
  
  constructor(public http: HttpClient, 
    public toastCtrl: ToastController, public loadingCtrl: LoadingController) { }


  async showToast(msg, colors, positon) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: colors,
      position: positon
    });
    toast.present();
  }

  async createAlert() {
    const toast = await this.toastCtrl.create({
      message: 'No internet connection.',
      duration: 3000,
      color: 'dark',
      position: 'bottom',
      buttons: [{
        side: 'end',
        icon: 'close-outline',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    return toast;
  }

  async shoNotification(msg, colors, positon) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 4000,
      color: colors,
      position: positon,
      buttons: [
        {
          icon: 'close-outline',
          role: 'cancel',
          handler: () => {
            // console.log('Cancel clicked');
          }
        }
      ]
    });
    toast.present();
  }

  async successNotification(msg, colors, positon) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 4000,
      color: colors,
      position: positon,
    });
    toast.present();
  }

  async errorToast(msg) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: 'danger'
    });
    toast.present();
  }

  async show(title?) {
    this.isLoading = true;
    return await this.loadingCtrl.create({
      message: title,
      spinner: 'bubbles',
    }).then(a => {
      a.present().then(() => {
        // console.log('presented');
        if (!this.isLoading) {
          a.dismiss().then(() => console.log('abort presenting'));
        }
      });
    });
  }

  async hide() {
    this.isLoading = false;
    return await this.loadingCtrl.dismiss().then(() => console.log('dismissed'));
  }

  sendNotification(msg: string, title: string, id: string, uid: string) {
    const body = {
      app_id: environment.onesignal.appId,
      include_player_ids: [id],
      headings: { en: title },
      contents: { en: msg },
      data: { uid: uid }
    };
    const header = {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Basic ${environment.onesignal.restKey}`)
    };
    return this.http.post('https://onesignal.com/api/v1/notifications', body, header)
    /*.subscribe(new_data => {
      console.log(new_data)
    }, error => {
      console.log(error);
    });*/
  }

  sendSimpleNotification(msg: string, title: string, id: string) {
    const body = {
      app_id: environment.onesignal.appId,
      include_player_ids: [id],
      headings: { en: title },
      contents: { en: msg },
      data: { task: msg }
    };
    const header = {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Basic ${environment.onesignal.restKey}`)
    };
    return this.http.post('https://onesignal.com/api/v1/notifications', body, header)
    /*.subscribe(new_data => {
      console.log(new_data)
    }, error => {
      console.log(error);
    });*/
  }

  sendMessageNotification(msg: string, title: string, id: string, uid: string) {
    const body = {
      app_id: environment.onesignal.appId,
      include_player_ids: [id],
      headings: { en: title },
      contents: { en: msg },
      data: { name: title, id: uid }
    };
    const header = {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Basic ${environment.onesignal.restKey}`)
    };
    return this.http.post('https://onesignal.com/api/v1/notifications', body, header)
    /*.subscribe(new_data => {
      console.log(new_data)
    }, error => {
      console.log(error);
    });*/
  }
  
  makeid(length: any) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}