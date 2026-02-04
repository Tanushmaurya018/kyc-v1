import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { CurrentPlan, InvoicesTable } from '@/components/billing';
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
      <CurrentPlan 
        plan={billingData.plan} 
        currentPeriod={billingData.currentPeriod} 
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoicesTable invoices={billingData.invoices} />
        </CardContent>
      </Card>
    </div>
  );
}
