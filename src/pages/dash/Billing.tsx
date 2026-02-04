import { Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { CurrentPlan, TopUpHistoryTable, UsageHistoryTable } from '@/components/billing';
import { getBillingDataByOrgId, currentOrganization } from '@/data';

export default function BillingPage() {
  const billingData = getBillingDataByOrgId(currentOrganization.id);

  if (!billingData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Billing information not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <CurrentPlan billingData={billingData} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Credits History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="usage">
            <TabsList className="mb-4">
              <TabsTrigger value="usage">Usage History</TabsTrigger>
              <TabsTrigger value="topups">Top-Up History</TabsTrigger>
            </TabsList>
            <TabsContent value="usage">
              <UsageHistoryTable transactions={billingData.usageHistory} />
            </TabsContent>
            <TabsContent value="topups">
              <TopUpHistoryTable transactions={billingData.topUpHistory} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
