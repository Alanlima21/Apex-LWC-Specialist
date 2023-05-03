import { LightningElement, api,track, wire } from 'lwc';
import getlocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';

export default class BoatsNearMe extends LightningElement {

    @api botId;

    @track latitude;
    @track longitude;

    connectedCallback() {
        navigator.geolocation.getCurrentPosition((position) => {
            this.latitude = position.coords.latitude;
            this.longitude = position.coords.longitude;
        });
    }

    @wire(getlocation, {latitude: '$latitude', longitude: '$longitude', boatTypeId: '$botId'})
    getLocation(data, error){
        if(data){
            console.log('Data => '+ JSON.stringify(data));
        }else if(error){
            console.log('Error '+ error);
        }
    }
}