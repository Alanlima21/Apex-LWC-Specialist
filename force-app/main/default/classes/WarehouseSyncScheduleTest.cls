@isTest
public class WarehouseSyncScheduleTest {

    public static String CRON_EXP = '0 0 0 15 3 ? 2024';
    @isTest static void testjob(){
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new WarehouseCalloutServiceMock());
        String jobId = WarehouseSyncSchedule.scheduleIt('ScheduledApexTest', CRON_EXP);
        Test.stopTest();
        System.assert(jobId != null);
    }
}