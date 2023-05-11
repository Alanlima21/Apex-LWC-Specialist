import { LightningElement, api, wire, track} from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import { publish, MessageContext } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT     = 'Ship it!';
const SUCCESS_VARIANT     = 'success';
const ERROR_TITLE   = 'Error';
const ERROR_VARIANT = 'error';

const columns = [
    { label: 'Name', fieldName: 'name', editable: true },
    { label: 'Length', fieldName: 'Length__c', editable: true },
    { label: 'Price', fieldName: 'Price__c', editable: true },
    { label: 'Description', fieldName: 'Description__c', editable: true }
];
export default class BoatSearchResults extends LightningElement {

    @wire(MessageContext)
    messageContext;

    selectedBoatId;
    boatTypeId = '';
    columns = columns;
    @track boats;
    @track draftValues = [];
    isLoading = false;

    sendMessageService(boatId) {
        publish(this.messageContext, BOATMC, { recordId : boatId });
    }

    @api
    searchBoats(boatTypeId) {
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        this.boatTypeId = boatTypeId;
    }

    @wire(getBoats , {boatTypeId: '$boatTypeId'})
    wiredBoats({data, error}) {
        if (data) {
            this.boats = data;
        } else if (error) {
            console.log('data.error');
            console.log(error);
        }
    }

    async refresh() { 
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        await refreshApex(this.boats);
        this.isLoading = false;
        this.notifyLoading(this.isLoading);
    }

    handleSave(event) {

        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        const updatedFields = event.detail.draftValues;

        updateBoatList({data: updatedFields})
        .then(() => {
            const evt = new ShowToastEvent({
                title: SUCCESS_TITLE,
                message: MESSAGE_SHIP_IT,
                variant: SUCCESS_VARIANT,
            });
            this.dispatchEvent(evt);
            this.refresh();
        })
        .catch(error => {
            const evt = new ShowToastEvent({
                title: ERROR_TITLE,
                message: error.message,
                variant: ERROR_VARIANT,
            });
            this.dispatchEvent(evt);
        })
        .finally(() => {
            this.isLoading = false;
            this.notifyLoading(this.isLoading);
        });
    }

    updateSelectedTile(event){
        this.selectedBoatId = event.detail.boatId;
        this.sendMessageService(this.selectedBoatId);
    }

    notifyLoading(isLoading) { 
        if(isLoading){
            this.dispatchEvent(new CustomEvent('loading'));
        }else{
            this.dispatchEvent(new CustomEvent('doneloading'));
        }
    }
}