public class WarehouseSyncSchedule implements Schedulable{
    

    public static String scheduleIt( String nomeAgendamento,String sch) 
    {
        WarehouseSyncSchedule scheduleClassName 	= new WarehouseSyncSchedule();
        
        return System.schedule( nomeAgendamento, sch, scheduleClassName );        
    }


    public void execute(SchedulableContext SC) {
       System.enqueueJob(new WarehouseCalloutService());
    }

}