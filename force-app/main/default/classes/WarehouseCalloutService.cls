public with sharing class WarehouseCalloutService  implements Queueable{
   
    public void execute(QueueableContext context) {
        executeCallout();
    }

    @Future(callout=true)
    public static void executeCallout() {

        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://th-superbadge-apex.herokuapp.com/equipment');
        request.setMethod('GET');
        HttpResponse response = http.send(request);
        
        if(response.getStatusCode() == 200) {
            List<Equipamento> results = (List<Equipamento>) JSON.deserialize(response.getBody(), List<Equipamento>.class);
            parseData(results);
        }

    }

    public static void parseData(List<Equipamento> response){
        List<Product2> equip = new List<Product2>();
        for(Equipamento result: response) {
            Product2 eq = new Product2();
            eq.Replacement_Part__c = result.replacement;
            eq.Name = result.name;
            eq.Maintenance_Cycle__c = result.maintenanceperiod;
            eq.Lifespan_Months__c = result.lifespan;
            eq.Cost__c = result.cost;
            eq.Warehouse_SKU__c = result.sku;
            equip.add(eq);
        }
        system.debug(equip);
       upsert equip;
    }


    public class Equipamento {
   
	public Boolean replacement {get;set;} 
	public String name {get;set;} 
	public Integer maintenanceperiod {get;set;} 
	public Integer lifespan {get;set;} 
	public Integer cost {get;set;} 
	public String sku {get;set;} 

    }
}