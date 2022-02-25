import { Component, OnInit, NgZone } from '@angular/core';
import { ModalController } from '@ionic/angular';

declare var google: any;

@Component({
  selector: 'app-search-location',
  templateUrl: './search-location.page.html',
  styleUrls: ['./search-location.page.scss'],
})
export class SearchLocationPage implements OnInit {

  autocompleteItems: any;
  autocomplete: any;
  acService: any;
  placesService: any;
  latitude: number;
  longitude: number;
  latlong: any;
  location: any;
  service = new google.maps.places.AutocompleteService();

  constructor(public viewCtrl: ModalController, public zone: NgZone) {
  }

  ngOnInit() {
    this.acService = new google.maps.places.AutocompleteService();
    this.autocompleteItems = [];
    this.autocomplete = {
      query: ''
    };
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  chooseItem(item: any) {
    //convert Address to lat and long
    // let geocoder = new google.maps.Geocoder();
    // geocoder.geocode({ 'address': item }, (results, status) => {
    //   this.latitude = results[0].geometry.location.lat();
    //   this.longitude = results[0].geometry.location.lng();
    //   console.log("lat: " + this.latitude + ", long: " + this.longitude);
    //   this.location = { lat: this.latitude, long: this.longitude, address: item }
    // });
    this.viewCtrl.dismiss(item);
  }

  updateSearch() {
    // Autocomplete search, if autocomplete query is empty return list of items in an array
    if (this.autocomplete.query == '') {
      this.autocompleteItems = [];
      return;
    }
    // Places prediction, you can add more to it
    let me = this;
    this.service.getPlacePredictions({
      input: this.autocomplete.query,
      componentRestrictions: { country: 'KE' }
      //componentRestrictions: {country: ['NG', "DZ", "AR", "AU", 'US', "AT", "AZ", "BS", "BH", "BD", "CV", "BE", "BR", "BF", "CM", "CA", "CL", "CN", "CR", "HR", "CU", "CZ", "DK", "EC", "EG", "ET", "FI", "FR", "GA", "GM", "DE", "GH", "IN", "ID", "IR", "IQ", "IL", "IT", "JM", "JP", "JO", "KE", "LB", "LR", "LY", "MW", "MY", "ML", "MX", "MA", "MZ", "NA", "NR", "NP", "NL", "NZ", "NI", "NE", "NO", "PY", "PE", "PH", "PL", "PT", "QA", "RO", "RU", "SA", "SG", "ZA", "ES", "LK", "SE", "CH", "SI", "TW", "TH", "TN", "TR", "GB", "UA", "AE", "UY", "US", "VE", "ZM", "ZW" ]}
    }, (predictions, status) => {
      me.autocompleteItems = [];
      me.zone.run(() => {
        if (predictions != null) {
          predictions.forEach((prediction) => {
            me.autocompleteItems.push(prediction.description);
          });
        }
      });
    });
  }
}


