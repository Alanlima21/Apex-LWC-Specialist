// import BOATMC from the message channel
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import {
  subscribe,
  APPLICATION_SCOPE,
  MessageContext,
} from 'lightning/messageService';

const LONGITUDE_FIELD = "Boat__c.Geolocation__Longitude__s";
const LATITUDE_FIELD = "Boat__c.Geolocation__Latitude__s";

const BOAT_FIELDS = [LONGITUDE_FIELD,LATITUDE_FIELD];

export default class BoatMap extends LightningElement {
  // private
  subscription = null;
  boatId;

  @api
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.setAttribute('boatId', value);
    this.boatId = value;
  }

  error = undefined;
  mapMarkers = [];

  // Initialize messageContext for Message Service
  @wire(MessageContext)
  messageContext;

  // Getting record's location to construct map markers using recordId
  // Wire the getRecord method using ('$boatId')
  @wire(getRecord, {recordId: '$boatId', fields: BOAT_FIELDS})
  wiredRecord({ error, data }) {
    if (data) {
      this.error = undefined;
      const longitude = data.fields.Geolocation__Longitude__s.value;
      const latitude = data.fields.Geolocation__Latitude__s.value;
      this.updateMap(longitude, latitude);
    } else if (error) {
      this.error = error;
      this.boatId = undefined;
      this.mapMarkers = [];
    }
  }

  // Subscribes to the message channel
  subscribeMC() {
    if (this.subscription || this.recordId) {
      return;
    }
    this.subscription = subscribe(
        this.messageContext,
        BOATMC,
        (message) => this.handleMessage(message),
        { scope: APPLICATION_SCOPE }
      );
  }

  // Calls subscribeMC()
  connectedCallback() {
    this.subscribeMC();
  }

  handleMessage(message){
    this.boatId = message.boatId;
    console.log('id '+ this.boatId);
  }

  // Creates the map markers array with the current boat's location for the map.
  updateMap(Longitude, Latitude) {
    this.mapMarkers = [{location: { Latitude, Longitude }}];
  }

  // Getter method for displaying the map component, or a helper method.
  get showMap() {
    return this.mapMarkers.length > 0;
  }
}