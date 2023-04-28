public with sharing class MaintenanceRequestHelper {
    
    public static void afterUpdate(List<Case> newList){
        cloneCase(newList);
    }

    public static void cloneCase(List<Case> newList){

        Map<Id,Case> caseToClone = new Map<Id,Case>();
        Map<Id,List<id>> caseToEquipament = new Map<Id,List<id>>();
        List<Case> newCases = new List<Case>();
        Map<Id,Double> cicle = new Map<Id,Double>();
    

        for(Case caso : newList){
            if((caso.Type == 'Repair' || caso.Type == 'Routine Maintenance') && caso.IsClosed){
                caseToClone.put(caso.Id, caso);
            }
        }

        for(Equipment_Maintenance_Item__c request : [select id, Equipment__c,Maintenance_Request__c,Equipment__r.Maintenance_Cycle__c from Equipment_Maintenance_Item__c where Maintenance_Request__c in: caseToClone.keySet()]){
           if(caseToEquipament.containsKey(request.Maintenance_Request__c)){

                caseToEquipament.get(request.Maintenance_Request__c).add(request.Equipment__c);
               
                if(cicle.containsKey(request.Maintenance_Request__c)){
                    if(cicle.get(request.Maintenance_Request__c) > request.Equipment__r.Maintenance_Cycle__c){
                        cicle.put(request.Maintenance_Request__c, request.Equipment__r.Maintenance_Cycle__c);
                    }
                }

           } else{
                caseToEquipament.put(request.Maintenance_Request__c, new List<Id>{request.Equipment__c});
                cicle.put(request.Maintenance_Request__c, request.Equipment__r.Maintenance_Cycle__c);
           }
        }

        for(Id caso : caseToClone.keySet()){
            Case casoToClone = caseToClone.get(caso);
            Case newCase = casoToClone.clone();
            newCase.Status = 'New';
            newCase.Subject = caso;
            newCase.Date_Reported__c = System.today();
            newCase.Type = 'Routine Maintenance';
            if(cicle.containsKey(caso)){
                newCase.Date_Due__c = System.today() + Integer.valueOf(cicle.get(caso));
            }else{
                newCase.Date_Due__c = System.today();
            }
           
            newCases.add(newCase);
        }

        Database.SaveResult[] srList = Database.insert(newCases, false);
        reletedMaintenance(caseToEquipament,srList);
    }

    public static void reletedMaintenance(Map<Id,List<Id>> caseToEquipament, List<Database.SaveResult> newCases){
        List<Id> newCasesId = new List<Id>();
        List<Equipment_Maintenance_Item__c> newEquips = new List<Equipment_Maintenance_Item__c>();
        
        for (Database.SaveResult sr : newCases) {
            if (sr.isSuccess()) {
                newCasesId.add(sr.getId());
            }
        }

        for(Case caso: [Select id, Subject from case where id in:newCasesId]){
            if(caseToEquipament.containsKey(caso.Subject)){
                for(Id equipament : caseToEquipament.get(caso.Subject)){
                    Equipment_Maintenance_Item__c newEquipment = new Equipment_Maintenance_Item__c();
                    newEquipment.Equipment__c = equipament;
                    newEquipment.Maintenance_Request__c = caso.Id;
                    newEquips.add(newEquipment);
                }
            }
        }

        insert newEquips;
    }
}