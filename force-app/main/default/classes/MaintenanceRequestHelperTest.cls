@isTest
public with sharing class MaintenanceRequestHelperTest {
 
    @TestSetup
    static void makeData(){
        Vehicle__c veiculo = new Vehicle__c();
        veiculo.Name = 'Civic';
        insert veiculo;
       
        Product2 equip = new Product2();
        equip.name = 'Generator 1000 kW';
        equip.Maintenance_Cycle__c = 100;
        equip.Replacement_Part__c = true;
        insert equip;

        Product2 equip2 = new Product2();
        equip2.name = 'Generator 2000 kW';
        equip2.Maintenance_Cycle__c = 20;
        equip2.Replacement_Part__c = true;
        insert equip2;

        Case caso1 = new Case();
        caso1.Type = 'Repair';
        caso1.Status = 'New';
        caso1.Vehicle__c = veiculo.Id;
        insert caso1;

        Case caso2 = new Case();
        caso2.Type = 'Electrical';
        caso2.Status = 'New';
        caso2.Vehicle__c = veiculo.Id;

        insert caso2;

        Equipment_Maintenance_Item__c manu = new Equipment_Maintenance_Item__c();
        manu.Equipment__c = equip.Id;
        manu.Maintenance_Request__c = caso1.Id;
        insert manu;

        Equipment_Maintenance_Item__c manu2 = new Equipment_Maintenance_Item__c();
        manu2.Equipment__c = equip2.Id;
        manu2.Maintenance_Request__c = caso1.Id;
        insert manu2;

    }

    @isTest static void cloneCase(){
        Case caso = [select id, type, status,Vehicle__c from case where type = 'Repair' limit 1];

        Test.startTest();
            caso.status = 'closed';
            update caso;
        Test.stopTest();

        List<Case> casoClone = [Select id, subject, Date_Due__c from case where Subject =: caso.Id];
        List<Equipment_Maintenance_Item__c> equip = [ select id,Maintenance_Request__c from Equipment_Maintenance_Item__c where Maintenance_Request__c =: casoClone[0].Id ];

        System.assertEquals(1, casoClone.size());
        System.assertEquals(casoClone[0].Id, equip[0].Maintenance_Request__c);
        System.assertEquals(casoClone[0].Id, equip[1].Maintenance_Request__c);
        System.assert(casoClone[0].Subject != null);
    }
}