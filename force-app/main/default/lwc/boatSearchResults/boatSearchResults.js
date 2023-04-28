import { LightningElement, api, track, wire } from 'lwc';
import getBoat from '@salesforce/apex/BoatDataService.getBoats';
import { publish, MessageContext } from 'lightning/messageService';
import recordSelected from '@salesforce/messageChannel/BoatMessageChannel__c';

export default class BoatSearchResults extends LightningElement {

    @wire(MessageContext)
    messageContext;

    boatId;

    handleBoatSelect() {
        const payload = { boatId: this.boatId };

        publish(this.messageContext, recordSelected, payload);
    }

    @api
    searchBoats(boatTypeId){
        this.dispatchEvent(new CustomEvent('loading'));
        getBoat({ boatTypeId: boatTypeId }).then(result =>{     
            console.log('Result => '+ JSON.stringify(result));
            this.dispatchEvent(new CustomEvent('doneloading'));
        }).catch(erro =>{
            this.dispatchEvent(new CustomEvent('doneloading'));
        })
    }

    handleCustomEvent(event){
        this.boatId = event.detail.boatId;
        this.handleBoatSelect();
    }
}