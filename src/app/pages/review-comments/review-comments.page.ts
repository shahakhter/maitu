import { Component, OnInit } from '@angular/core';
import { ActionSheetController, NavController } from '@ionic/angular';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UtilityService } from 'src/app/services/utility';

@Component({
  selector: 'app-review-comments',
  templateUrl: './review-comments.page.html',
  styleUrls: ['./review-comments.page.scss'],
})
export class ReviewCommentsPage implements OnInit {

  fakeComments = [];
  postId;
  userId;
  message;
  photoURL;
  displayName;
  feedsComment = [];
  currentUserId;
  commentLength;
  commentNumber;
  fcm_token;

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private util: UtilityService,
  ) { 
    this.feedsComment = [];
    this.postId = this.route.snapshot.paramMap.get('postId');
    this.userId = this.route.snapshot.paramMap.get('userId');
    this.commentLength = this.route.snapshot.paramMap.get('commentLength');
    this.commentNumber = Number.parseInt(this.commentLength);
    this.authService.getUserDetails(this.userId).then((res: any) => {
      this.fcm_token = res.fcm_token;
      //this.photoURL = res.photoURL;
    })
    this.generateFakeComments();
    this.getComment();
  }

  deleteComment(id, item) {
    firebase.database().ref('/rate_review/' + this.postId + '/comments/' + id).remove().then(function () { })
    if (this.commentNumber === 0) {
      firebase.database().ref('/rate_review/' + this.postId).update({
        commentLength: 0
      })
    } else {
      firebase.database().ref('/rate_review/' + this.postId).update({
        commentLength: this.commentLength - 1
      })
    }
    let index = this.feedsComment.indexOf(item);
    if (index > -1) {
      this.feedsComment.splice(index, 1);
    }
    // })
  }


  async presentActionSheet(id, item) {
    const actionSheet = await this.actionSheetCtrl.create({
      //header: 'Albums',
      buttons: [{
        icon: 'flag-outline',
        text: 'Report comment',
        cssClass: 'ActionButton',
        handler: () => {
          console.log('Delete clicked');
          alert('Comment Report successfully')
        }
      }, {
        icon: 'trash-outline',
        text: 'Delete Comment',
        cssClass: 'ActionButton',
        handler: () => {
          this.deleteComment(id, item)
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

  send() {
    firebase.database().ref('/rate_review/' + this.postId).child('comments').push({
      message: this.message,
      date: firebase.database.ServerValue.TIMESTAMP,
      photoURL: this.photoURL,
      userId: firebase.auth().currentUser.uid,
      displayName: this.displayName,
    })
    this.message = ''
    firebase.database().ref('/rate_review/' + this.postId).update({
      commentLength: this.commentNumber + 1
    })
    if (firebase.auth().currentUser.uid != this.userId) {
      this.util.sendSimpleNotification(`${this.displayName} Comment on your review`, 'Maitu', this.fcm_token).subscribe((data) => {
        console.log('send notifications', data);
      }, error => {
        console.log(error);
      });
      firebase.database().ref('notices').push({
        read: false,
        senderId: firebase.auth().currentUser.uid,
        displayName: this.displayName,
        ownerId: this.userId,
        postId: this.postId,
        typer: 'comment',
        time: firebase.database.ServerValue.TIMESTAMP,
        photoURL: this.photoURL,
        type: 'review'
      })
    }
  }

  generateFakeComments() {
    for (var i = 0; i < 10; i++)
    {
      this.fakeComments.push({
        width: this.randomWidth(200, 250),
        height: this.randomHeight()
      })
    }
  }

  ngOnInit() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.currentUserId = user.uid
        this.loaduserdetails(user.uid);
      }
    })
  }

  loaduserdetails(id) {
    this.authService.getUserDetails(id).then((res: any) => {
      this.displayName = res.firstName;
      this.photoURL = res.photoURL;
    })
  }

  getComment() {
    firebase.database().ref('/rate_review/' + this.postId).child('comments').on('value', snapshot => {
      let feeds = [];
      snapshot.forEach(feed => {
        let item = feed.val();
        item.key = feed.key;
        item.userId = feed.val().userId;
        firebase.database().ref('users/' + item.userId).once('value', (snapshot) => {
          item.displayName = snapshot.val().firstName;
          item.photoURL = snapshot.val().photoURL;
        });
        feeds.push(item);
        this.feedsComment = feeds;
      });
      this.fakeComments = [];
    });
  }


  viewProfiles(userId) {
    if (this.currentUserId == userId) {
      this.router.navigate(['/my-profile'])
    } else {
      this.router.navigate(['/users-details', {
        id: userId
      }])
    }
  }

  goBack() {
    this.navCtrl.pop();
  }

  randomWidth(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);;
  }

  randomHeight() {
    let arr = [40, 50, 80]
    return arr[Math.floor(Math.random() * arr.length)]
  }
}
