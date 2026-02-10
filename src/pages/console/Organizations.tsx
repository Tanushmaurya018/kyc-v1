import { useState } from 'react';
import { Building2, Search, Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Button,
} from '@/components/ui';
import { useOrganizations } from '@/hooks';
import { format } from 'date-fns';

export default function OrganizationsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { orgs, isLoading } = useOrganizations();

  const filteredOrgs = orgs.filter(org =>
    org.company_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <p className="text-sm text-muted-foreground flex-1">
          {filteredOrgs.length} organizations
        </p>
        <Button onClick={() => navigate('/console/onboard-client')}>
          <Plus className="h-4 w-4 mr-2" />
          Onboard Client
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrgs.map(org => (
            <Card
              key={org.id}
              className="cursor-pointer hover:border-muted-foreground transition-colors"
              onClick={() => navigate(`/console/organizations/${org.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">{org.company_name}</CardTitle>
                      {org.org_type && (
                        <p className="text-xs text-muted-foreground capitalize">{org.org_type}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground space-y-1">
                  {org.city && org.country_name && (
                    <div className="flex justify-between">
                      <span>Location</span>
                      <span className="font-medium text-foreground">{org.city}, {org.country_name}</span>
                    </div>
                  )}
                  {org.created_at && (
                    <div className="flex justify-between">
                      <span>Joined</span>
                      <span>{format(new Date(org.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
