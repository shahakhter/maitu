import { Component, OnInit } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { MapsAPILoader, AgmMap } from '@agm/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-user-location',
  templateUrl: './user-location.page.html',
  styleUrls: ['./user-location.page.scss'],
})
export class UserLocationPage implements OnInit {

  locationCoords: any;
  timetest: any;
  private geoCoder;
  zoom: number;
  address: string;
  city: string;

  constructor(
    private mapsAPILoader: MapsAPILoader,
    private androidPermissions: AndroidPermissions,
    private geolocation: Geolocation,
    private locationAccuracy: LocationAccuracy,
    private viewCtrl: ModalController,
  ) {
    this.locationCoords = {
      latitude: "",
      longitude: "",
      accuracy: "",
      timestamp: "",
      address: "",
      city: ""
    }
    this.timetest = Date.now();
  }

  ngOnInit() {
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder;
      this.checkGPSPermission();
    });
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  share() {
    this.viewCtrl.dismiss(this.locationCoords);
  }

  //Check if application having GPS access permission  
  checkGPSPermission() {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
      result => {
        if (result.hasPermission) {

          //If having permission show 'Turn On GPS' dialogue
          this.askToTurnOnGPS();
        } else {

          //If not having permission ask for permission
          this.requestGPSPermission();
        }
      },
      err => {
        alert(err);
      }
    );
  }

  requestGPSPermission() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        console.log("4");
      } else {
        //Show 'GPS Permission Request' dialogue
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
          .then(
            () => {
              // call method to turn on GPS
              this.askToTurnOnGPS();
            },
            error => {
              //Show alert if user click on 'No Thanks'
              console.log('requestPermission Error requesting location permissions ' + error)
            }
          );
      }
    });
  }

  askToTurnOnGPS() {
    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
      () => {
        // When GPS Turned ON call method to get Accurate location coordinates
        this.getLocationCoordinates()
      },
      error => console.log('Error requesting location permissions ' + JSON.stringify(error))
    );
  }

  // Methos to get device accurate coordinates using device GPS
  getLocationCoordinates() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.locationCoords.latitude = resp.coords.latitude;
      this.locationCoords.longitude = resp.coords.longitude;
      this.locationCoords.accuracy = resp.coords.accuracy;
      this.locationCoords.timestamp = resp.timestamp;
      console.log('locationCoordinates', JSON.stringify(this.locationCoords));
      this.getAddress(this.locationCoords.latitude, this.locationCoords.longitude);
    }).catch((error) => {
      console.log('Error getting location', JSON.stringify(error));
    });
  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode({ 'location': { lat: latitude, lng: longitude } }, (results, status) => {
      console.log(results);
      console.log(status);
      if (status === 'OK') {
        if (results[1]) {
          this.zoom = 12;
          this.address = results[1].formatted_address;
          this.city = results[1].address_components[2].short_name;
          this.locationCoords.address = this.address;
          this.locationCoords.city =  this.city;
          console.log('city', this.city)
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }

    });
  }

}
