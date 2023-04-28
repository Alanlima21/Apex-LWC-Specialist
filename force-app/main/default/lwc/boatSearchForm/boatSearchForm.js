import { LightningElement,wire } from 'lwc';
import getBoatTypes from '@salesforce/apex/BoatDataService.getBoatTypes';

export default class BoatSearchForm extends LightningElement {

    selectedBoatTypeId = '';
    
    error = undefined;
    
    searchOptions;
    
    @wire(getBoatTypes)
    boatTypes({ error, data }) {
      if (data) {
        this.searchOptions = data.map(type => {
            return {
              label: type.Name,
              value: type.Id
            };
        });
        this.searchOptions.unshift({ label: 'All Types', value: '' });
      } else if (error) {
        this.searchOptions = undefined;
        this.error = error;
      }
    }
    
    handleSearchOptionChange(event) {
        this.selectedBoatTypeId = event.detail.value;
        this.dispatchEvent( new CustomEvent ('search', {detail : {boatTypeId:this.selectedBoatTypeId}}));
    }
  }