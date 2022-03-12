import { Component, ViewChild, OnInit } from '@angular/core';
import { IonContent, NavController, PopoverController, Platform, ActionSheetController } from '@ionic/angular';
import { Message } from 'src/app/model/message.interface';
import { Observable } from 'rxjs';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth'
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { UtilityService } from 'src/app/services/utility';
import { AuthService } from 'src/app/services/auth.service';
import { EmailComposer } from '@ionic-native/email-composer/ngx';



@Component({
  selector: 'app-message-chat',
  templateUrl: './message-chat.page.html',
  styleUrls: ['./message-chat.page.scss'],
})

export class MessageChatPage implements OnInit {
  //profile: Profile;
  myuid: string;
  userId;  //peerID : string;
  displayName: string; //PerName
  isFirstText: boolean = false;
  msgList: Observable<any[]>;
  messageList: Message[];
  myName: string;
  subscription: any;
  msg: string = '';
  sub: any;
  unread: number;
  photoURL = './assets/imgs/avatar.png';;
  isFocus: boolean;
  status;
  myPhoto;
  @ViewChild(IonContent, { static: true }) content: IonContent;
  showEmojiPicker = false;
  chats = [];
  format;
  url;
  fileName;
  fileSize;
  task: AngularFireUploadTask;

  percentage: Observable<number>;

  downloadURL: string;

  snapshot: Observable<any>;

  // Uploaded File URL
  UploadedFileURL: Observable<string>;
  fcm_token;

  constructor(public route: ActivatedRoute, private actionSheetCtrl: ActionSheetController, private db: AngularFireDatabase, public popoverController: PopoverController,
    private afAuth: AngularFireAuth, public storage: AngularFireStorage, public platform: Platform,
    public util: UtilityService, private emailComposer: EmailComposer,
    public authService: AuthService, public nav: NavController, public socialSharing: SocialSharing) {

      this.myuid = firebase.auth().currentUser.uid;
      this.displayName = this.route.snapshot.paramMap.get('displayName');
      this.userId = this.route.snapshot.paramMap.get('userId');
      if (this.route.snapshot.paramMap.get('firstText')){
        this.isFirstText = true;
      }
      //this.profile = this.navParams.get('profile');
        this.authService.getUserDetails(this.myuid).then((res: any) => {
          this.myName = res.firstName;
          this.myPhoto  = res.photoURL;
         
        }) 
        this.authService.getUserDetails(this.userId).then((res: any) => {
          this.photoURL = res.photoURL;
          this.status = res.status; 
          this.fcm_token = res.fcm_token;
        }) 


    //this.db.object(`users/${this.myuid}`).valueChanges().subscribe((result : Profile) => this.myName = result.firstName + ' ' + result.lastName );
  }

  goBack() {
    this.nav.pop();
  }

  deleteMessage(msgkey) {
    //firebase.database().ref(`message-by-user/${this.myuid}/${this.userId}`).child(msgkey).remove()
    firebase.database().ref('messages').child(msgkey).remove()
  }

  /*getToken(){
    return this.fcm.getToken().then(token => {
      console.log(token);
      firebase.database().ref('users').child(firebase.auth().currentUser.uid).update({
        Usertoken: token
      });
    })
  }*/


  ngOnInit() {
    this.content.scrollToBottom();
    console.log('ionViewDidLoad MessagePage');
    this.msgList = this.db.list(`message-by-user/${this.myuid}/${this.userId}`)
    .valueChanges().pipe(map(changes => {
      changes.map(mkey =>{
        //@ts-ignore
        this.db.object(`/messages/${mkey.msgkey}`).valueChanges().subscribe(
          (x)=>{
            //@ts-ignore
            mkey.timeStamp = x.timeStamp
            //@ts-ignore
            mkey.msg = x.msg;
            //@ts-ignore
            mkey.fromID = x.fromID;
            //@ts-ignore
            mkey.toID = x.toID; 
            //@ts-ignore
            mkey.type = x.type; 
            //@ts-ignore


          }
        )
      });
      return changes;
    }));

    this.sub = this.db.list(`message-by-user/${this.userId}/${this.myuid}`).snapshotChanges().pipe(map(changes=>changes.map(c=>{
      this.db.object(`message-by-user/${this.userId}/${this.myuid}/${c.payload.key}`).update({unread:0});
      //if(this.ct) this.ct.scrollToBottom(10000);
      setTimeout(() => { this.content.scrollToBottom(); }, 200);
    })));
    this.sub = this.sub.subscribe();
  }

  async sendMessage() {
    let text = this.msg;
    let message = { read: false, type: 'text', fromID: this.myuid, toID: this.userId, msg: this.msg, fromPhoto: this.myPhoto, toPhoto: this.photoURL, fromName: this.myName, toName: this.displayName, timeStamp: Date.now() };
    let key = await this.db.list(`messages`).push(message).key;

    //await this.db.object(`messages/${key}`).set({chatKey: key, type: 'text', fromID: this.myuid, toID: this.userId, msg: this.msg, fromPhoto: this.myPhoto, toPhoto: this.photoURL, fromName: this.myName, toName: this.displayName, timeStamp: Date.now()});

    await this.db.list(`message-by-user/${this.myuid}/${this.userId}`).push({ msgkey: key, unread: 1 });
    await this.db.list(`message-by-user/${this.userId}/${this.myuid}`).push({ msgkey: key, unread: 0 });

    await this.db.object(`last-messages/${this.myuid}/${this.userId}`).set({ lastmsg: key });
    await this.db.object(`last-messages/${this.userId}/${this.myuid}`).set({ lastmsg: key });
    this.msg = "";
    this.content.scrollToBottom();

    this.util.sendMessageNotification(`${text}`, `${this.myName}`, this.fcm_token, `${this.myuid}`).subscribe((data) => {
      console.log('send notifications', data);
      console.log('tokens', this.fcm_token);
    }, error => {
      console.log(error);
    });
    if (this.isFirstText) {
      this.notifyUser();
    }
  }

  notifyUser() {
    firebase.database().ref('notices').push({
      read: false,
      senderId: this.myuid,
      displayName: this.myName,
      ownerId: this.userId,
      typer: 'chat',
      time: firebase.database.ServerValue.TIMESTAMP,
      photoURL: this.myPhoto,
      type: 'chat'
    })
  }

  async presentActionSheetReport(item) {
    const actionSheet = await this.actionSheetCtrl.create({
      //header: 'Albums',
      buttons: [{
        icon: 'flag-outline',
        text: 'Report',
        cssClass: 'ActionButton',
        handler: () => {
          let email = {
            to: 'feedback@maitu.com',
            subject: 'Report',
            body: 'Hello Maitu, I notice the following user <b>' + item + '</b> is violating the app Terms of Service.<br/><br/>Thank you',
            isHtml: true
          };

          this.emailComposer.open(email);
        }
      }, {
        icon: 'close-outline',
        text: 'Cancel',
        cssClass: 'ActionButton',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
  }

  ionViewDidLeave() {
    this.sub.unsubscribe();
  }

  toggleFocus(isFocus: boolean) {
    this.isFocus = isFocus;
    this.content.scrollToBottom();
    this.showEmojiPicker = false;
  }


  onFocus() {
    this.showEmojiPicker = false;
    this.content.scrollToBottom();
  }



  switchEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
    if (!this.showEmojiPicker) {
    } else {
      this.content.scrollToBottom();
    }
  }

  handleEmoji(e) {
    this.msg += e.char;
    console.log('Emoji Name', e.name);
  }

  handleCharDelete(e) {
    if (this.msg.length > 0) {
      this.msg = this.msg.substr(0, this.msg.length - 2);
    }
  }

  onTrigger() {
    document.getElementById('file').click();
  }

  onSelectFile(event) {
    const file = event.target.files && event.target.files[0];
    if (file) {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      if (file.type.indexOf('image') > -1) {
        this.format = 'image';
      } else if (file.type.indexOf('video') > -1) {
        this.format = 'video';
      }
      reader.onload = (event) => {
        this.url = (<FileReader>event.target).result;
        this.sendImage(this.url)
      }
    }
  }

  openImage(msg) {
    this.socialSharing.share(msg, "Maitu", null).then(() => {
      console.log("shareSheetShare: Success");
    }).catch(() => {
      console.error("shareSheetShare: failed");
    });
  }


  /*uploadImage(event) {
    var file: HTMLInputElement = event.target.files[0];
    this.fileName = file.name;
    this.fileSize = this.bytesToSize(file.size);
    this.upLoad(file)
  }
  
  bytesToSize(bytes){
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    for (var i = 0; i < sizes.length; i++){
      if(bytes <= 1024){
        return bytes + '' + sizes[i];
      } else {
        bytes = parseFloat(String(bytes / 1024)).toFixed(2)
      }
    }
  }*/



  /*upLoad(file){
  
    // Create a root reference
    var fileName = file.name;
    var metadata = { contentType: 'image/jpeg'};
    var storageRef = firebase.storage().ref('/images/' + fileName);
  
    var uploadTask = storageRef.put(file, metadata);
  
      this.localNotification.schedule({
        id: 1,
        title: "Uploading " + this.fileName + "...",
        text: "0/" + this.fileSize,
        progressBar: { value: 0 },
      })
  
      uploadTask.on('state_changed', (snapshot) => {
        console.log(snapshot);
  
      var bytesUploaded = this.bytesToSize(uploadTask.snapshot.bytesTransferred)
      var percent = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100;
  
      this.localNotification.update({
        id: 1,
        title: "Uploading " + this.fileName + "...",
        text: bytesUploaded+"/" + this.fileSize,
        progressBar: { value: percent },
      })
     
      switch (uploadTask.snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
          console.log('Upload is paused');
          break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
          console.log('Upload is running');
          break;
      }
  
    }, (error) => {
      // Handle unsuccessful uploads
    },() => {
      // Handle successful uploads on complete
      // For instance, get the download URL: https://firebasestorage.googleapis.com/...
     this.downloadURL = uploadTask.snapshot.downloadURL;
     console.log(this.downloadURL);
  
     let message = {type: 'images', fromID: this.myuid, toID: this.userId, msg: this.downloadURL, fromPhoto: this.myPhoto, toPhoto: this.photoURL, fromName: this.myName, toName: this.displayName, timeStamp: Date.now()};
      let key = this.db.list(`messages`).push(message).key;
  
      this.db.list(`message-by-user/${this.myuid}/${this.userId}`).push({msgkey: key, unread: 1});
      this.db.list(`message-by-user/${this.userId}/${this.myuid}`).push({msgkey: key, unread: 0});
  
      this.db.object(`last-messages/${this.myuid}/${this.userId}`).set({lastmsg: key});
      this.db.object(`last-messages/${this.userId}/${this.myuid}`).set({lastmsg: key});
        
      this.localNotification.clear(1);
      this.localNotification.schedule({
        title: "Upload Successful"
      })
   
    
      console.log("successful");
    });
  }*/




  /*upload(){
    var file = (<HTMLInputElement>document.getElementById("file")).files[0];
    const path = `images/${Date.now()}_${file.name}`;
    const ref = this.storage.ref(path);
    this.task = this.storage.upload(path, file);
    this.snapshot   = this.task.snapshotChanges().pipe(
      tap(console.log),
      // The file's download URL
      finalize( async() =>  {
        this.downloadURL = await ref.getDownloadURL().toPromise();
      let message = {type: 'images', fromID: this.myuid, toID: this.userId, msg: this.downloadURL, fromPhoto: this.myPhoto, toPhoto: this.photoURL, fromName: this.myName, toName: this.displayName, timeStamp: Date.now()};
      let key = await this.db.list(`messages`).push(message).key;
  
      await this.db.list(`message-by-user/${this.myuid}/${this.userId}`).push({msgkey: key, unread: 1});
      await this.db.list(`message-by-user/${this.userId}/${this.myuid}`).push({msgkey: key, unread: 0});
  
      await this.db.object(`last-messages/${this.myuid}/${this.userId}`).set({lastmsg: key});
      await this.db.object(`last-messages/${this.userId}/${this.myuid}`).set({lastmsg: key});
  
        //this.db.collection('files').add( { downloadURL: this.downloadURL, path });
      }),
    );
  }*/

  /*detectFiles(){
    var files =(<HTMLInputElement>document.getElementById("file")).files
    var selectedFiles = [];
    for(var i = 0; i < files.length; i++){
      var obj = {
        name: files[i].name,
        size: files[i].size,
        type: files[i].type,
      };
      selectedFiles.push(obj);
      sessionStorage.setItem("preview", JSON.stringify(selectedFiles));
      this.previewFiles()
    }
  }
  
    async previewFiles(){
      const popover = await this.popoverController.create({
        component: PreviewPage
      });
      popover.present();
      popover.onDidDismiss().then(() => {
        if(sessionStorage.getItem("send") == "true"){
          sessionStorage.setItem("send", "false");
          var files =(<HTMLInputElement>document.getElementById("file")).files
          for(var i = 0; i < files.length; i++){
            var fileId = Date.now();
  
            //this.msgList.subscribe
  
            this.msgList.push({
              fileId: fileId + files[i].name,
              isUploading: true,
              progress: 0,
              fileName: files[i].name,
              fileSize: files[i].size,
              fileType: files[i].type
            })
            
            this.uploadFiles(files[i], fileId, files[i].name, files[i].type);
  
           
          }
        }
      })
    }
  
  
    uploadFiles(file, fileId, fileName, fileType){
      var uploadTask = firebase.storage().ref(fileName).put(file);
  
      uploadTask.on("state_changed", snap => {
        var percentage = snap.bytesTransferred / snap.totalBytes;
        var index = this.chats.findIndex(x => x.fileId == fileId + fileName);
        this.chats[index]['progress'] = percentage * 100;
      }, (err) => {
        console.log(err)
      }, () => {
        var index = this.chats.findIndex(x => x.fileId == fileId + fileName);
        this.chats[index]['isUploading'] = false;
        this.chats[index]['msg'] = fileName;
        let message = {fileType: fileType, isUploading: false, fromID: this.myuid, toID: this.userId, msg: fileName, fromPhoto: this.myPhoto, toPhoto: this.photoURL, fromName: this.myName, toName: this.displayName, timeStamp: Date.now()};
        
            let key =  this.db.list(`messages`).push(message).key;
  
            this.db.list(`message-by-user/${this.myuid}/${this.userId}`).push({msgkey: key, unread: 1});
            this.db.list(`message-by-user/${this.userId}/${this.myuid}`).push({msgkey: key, unread: 0});
            this.db.object(`last-messages/${this.myuid}/${this.userId}`).set({lastmsg: key});
            this.db.object(`last-messages/${this.userId}/${this.myuid}`).set({lastmsg: key});
            this.content.scrollToBottom();
  
      })
    }*/


  /*upLoad(file) {
    

    this.fileName = file.name;

    // The storage path
    const path = `images/${new Date().getTime()}_${file.name}`;

    // Totally optional metadata
    const customMetadata = { app: 'Maitu Image Upload Demo' };

    //File reference
    const fileRef = this.storage.ref(path);

    // The main task
    this.task = this.storage.upload(path, file, { customMetadata });

    // Get file progress percentage
    this.percentage = this.task.percentageChanges();
    this.snapshot = this.task.snapshotChanges().pipe(
      
      finalize(() => {
        // Get uploaded file storage path
        this.UploadedFileURL = fileRef.getDownloadURL();
        
        this.UploadedFileURL.subscribe(resp=>{

           this.sendImage(resp)
          
         

        },error=>{
          console.error(error);
        })
      }),
      tap(snap => {
          this.fileSize = snap.totalBytes;
      })
    )
  }*/

  sendImage(resp) {
    let message = { read: false, type: 'images', fromID: this.myuid, toID: this.userId, msg: resp, fromPhoto: this.myPhoto, toPhoto: this.photoURL, fromName: this.myName, toName: this.displayName, timeStamp: Date.now() };
    let key = this.db.list(`messages`).push(message).key;

    this.db.list(`message-by-user/${this.myuid}/${this.userId}`).push({ msgkey: key, unread: 1 });
    this.db.list(`message-by-user/${this.userId}/${this.myuid}`).push({ msgkey: key, unread: 0 });

    this.db.object(`last-messages/${this.myuid}/${this.userId}`).set({ lastmsg: key });
    this.db.object(`last-messages/${this.userId}/${this.myuid}`).set({ lastmsg: key });
  }


}