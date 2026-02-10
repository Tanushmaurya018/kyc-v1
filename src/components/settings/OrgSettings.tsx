import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
} from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import {
  getOrgTypes,
  getCountries,
  updateOrg,
  FALLBACK_ORG_TYPES,
  FALLBACK_COUNTRIES,
  type OrgDetail,
  type OrgType,
  type Country,
  type UpdateOrgPayload,
} from '@/services/org-api';
import { toast } from 'sonner';

interface OrgSettingsFormProps {
  org: OrgDetail;
  editable?: boolean;
}

export function OrgSettingsForm({ org, editable = true }: OrgSettingsFormProps) {
  // Reference data
  const [orgTypes, setOrgTypes] = useState<OrgType[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [refLoading, setRefLoading] = useState(true);

  // Form fields
  const [companyName, setCompanyName] = useState(org.company_name);
  const [orgTypeId, setOrgTypeId] = useState('');
  const [email, setEmail] = useState(org.email);
  const [phone, setPhone] = useState(org.phone ?? '');
  const [address, setAddress] = useState(org.address ?? '');
  const [city, setCity] = useState(org.city ?? '');
  const [countryId, setCountryId] = useState('');
  const [primaryContactName, setPrimaryContactName] = useState(org.primary_contact_name ?? '');
  const [primaryContactEmail, setPrimaryContactEmail] = useState(org.primary_contact_email ?? '');
  const [additionalInfo, setAdditionalInfo] = useState(org.additional_information ?? '');

  const [saving, setSaving] = useState(false);

  // Fetch org types & countries, resolve initial IDs from names
  useEffect(() => {
    Promise.all([
      getOrgTypes().catch(() => FALLBACK_ORG_TYPES),
      getCountries().catch(() => FALLBACK_COUNTRIES),
    ]).then(([types, ctrs]) => {
      setOrgTypes(types);
      setCountries(ctrs);

      const matchedType = types.find(
        (t) => t.name.toLowerCase() === org.org_type?.toLowerCase()
      );
      if (matchedType) setOrgTypeId(matchedType.id);

      const matchedCountry = ctrs.find(
        (c) => c.name.toLowerCase() === org.country_name?.toLowerCase()
      );
      if (matchedCountry) setCountryId(matchedCountry.id);

      setRefLoading(false);
    });
  }, [org.org_type, org.country_name]);

  const formValid =
    companyName.trim() !== '' &&
    orgTypeId !== '' &&
    email.trim() !== '' &&
    primaryContactName.trim() !== '' &&
    primaryContactEmail.trim() !== '';

  const handleSave = async () => {
    if (!formValid) return;
    setSaving(true);
    try {
      const payload: UpdateOrgPayload = {
        companyName: companyName.trim(),
        orgTypeId,
        email: email.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        countryId: countryId || undefined,
        primaryContactName: primaryContactName.trim(),
        primaryContactEmail: primaryContactEmail.trim(),
        additionalInformation: additionalInfo.trim() || undefined,
        sandboxMode: org.sandbox_mode,
        digitization: org.digitization,
        continuousDigitization: org.continuous_digitization,
        nonVisitorOnboarding: org.non_visitor_onboarding,
        nfcVerification: org.nfc_verification,
        watermarkNoiseCompress: org.watermark_noise_compress,
        proactiveMonitoring: org.proactive_monitoring,
        generateCertificate: org.generate_certificate,
        eligibleForFinance: org.eligible_for_finance,
        enableGlobalOneToManySearch: org.enable_global_one_to_many_search,
        allowNonOnboardedVerification: org.allow_non_onboarded_verification,
        documentsAllowed: org.documents_allowed,
        enabled_transaction_types: org.enabled_transaction_types,
        responseTemplate: (org.response_template as Record<string, unknown>) ?? {},
      };
      await updateOrg(org.id, payload);
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (refLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organization</CardTitle>
          <CardDescription>Company details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="s-name">Company Name *</Label>
              <Input
                id="s-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={!editable}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="s-type">Organization Type *</Label>
              <Select value={orgTypeId} onValueChange={setOrgTypeId} disabled={!editable}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {orgTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="s-email">Email *</Label>
              <Input
                id="s-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!editable}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="s-phone">Phone</Label>
              <Input
                id="s-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!editable}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Address</CardTitle>
          <CardDescription>Organization location</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="s-address">Address</Label>
            <Input
              id="s-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!editable}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="s-city">City</Label>
              <Input
                id="s-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={!editable}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="s-country">Country</Label>
              <Select value={countryId} onValueChange={setCountryId} disabled={!editable}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Primary Contact</CardTitle>
          <CardDescription>Main point of contact</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="s-pc-name">Name *</Label>
              <Input
                id="s-pc-name"
                value={primaryContactName}
                onChange={(e) => setPrimaryContactName(e.target.value)}
                disabled={!editable}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="s-pc-email">Email *</Label>
              <Input
                id="s-pc-email"
                type="email"
                value={primaryContactEmail}
                onChange={(e) => setPrimaryContactEmail(e.target.value)}
                disabled={!editable}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="s-addl-info">Additional Information</Label>
            <Textarea
              id="s-addl-info"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              disabled={!editable}
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {editable && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!formValid || saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
