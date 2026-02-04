import { format } from 'date-fns';
import { 
  FileText, 
  User, 
  Shield, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Copy,
  ArrowLeft,
  Building2,
  Download,
  Eye,
  FileCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Separator, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { StatusBadge } from './StatusBadge';
import { organizations } from '@/data';
import type { Contract, ContractEvent } from '@/types';
import { cn } from '@/lib/utils';

interface ContractDetailProps {
  contract: Contract;
  basePath?: string;
  showOrg?: boolean;
}

const eventIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  CREATED: Clock,
  KYC_STARTED: Shield,
  KYC_COMPLETED: CheckCircle2,
  KYC_FAILED: XCircle,
  SIGNATURE_POSITIONED: FileText,
  SIGNED: CheckCircle2,
  REJECTED: XCircle,
  ABANDONED: AlertCircle,
  EXPIRED: Clock,
};

const eventColors: Record<string, string> = {
  CREATED: 'text-gray-500',
  KYC_STARTED: 'text-amber-500',
  KYC_COMPLETED: 'text-green-500',
  KYC_FAILED: 'text-red-500',
  SIGNATURE_POSITIONED: 'text-blue-500',
  SIGNED: 'text-green-500',
  REJECTED: 'text-red-500',
  ABANDONED: 'text-gray-500',
  EXPIRED: 'text-gray-500',
};

function TimelineEvent({ event }: { event: ContractEvent }) {
  const Icon = eventIcons[event.type] || Clock;
  const color = eventColors[event.type] || 'text-gray-500';

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={cn("w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white", color, `border-current`)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 w-px bg-gray-200 my-2" />
      </div>
      <div className="pb-6">
        <p className="font-medium text-sm">{event.description}</p>
        <p className="text-xs text-gray-500 mt-1">
          {format(event.timestamp, 'MMM d, yyyy HH:mm:ss')}
        </p>
        {event.metadata && (
          <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
            {Object.entries(event.metadata).map(([key, value]) => (
              <div key={key}>
                <span className="font-medium">{key}:</span> {String(value)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Document preview placeholder component
function DocumentPreview({ documentName, isSigned }: { documentName: string; isSigned?: boolean }) {
  return (
    <div className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
      {/* Document header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">{documentName}</span>
        </div>
        {isSigned && (
          <Badge variant="signed" className="text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Signed
          </Badge>
        )}
      </div>
      
      {/* Document preview area - placeholder */}
      <div className="aspect-[8.5/11] max-h-[600px] bg-white m-4 rounded border border-gray-200 shadow-sm overflow-hidden">
        {/* Simulated PDF pages */}
        <div className="h-full flex flex-col p-6">
          {/* Header */}
          <div className="border-b pb-4 mb-4">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
          </div>
          
          {/* Content lines */}
          <div className="space-y-3 flex-1">
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-5/6" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-4/5" />
            <div className="h-6" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-3/4" />
            <div className="h-6" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-5/6" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
          </div>
          
          {/* Signature area */}
          {isSigned && (
            <div className="mt-auto pt-4 border-t">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Digitally Signed</p>
                  <div className="border-2 border-green-500 rounded px-4 py-2 bg-green-50">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Verified Signature</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">Face ID authenticated</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Date</p>
                  <p className="text-sm">Feb 4, 2026</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Page indicator */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 text-center">
        <span className="text-xs text-gray-500">Page 1 of 1 (Preview)</span>
      </div>
    </div>
  );
}

export function ContractDetail({ contract, basePath = '/dash', showOrg }: ContractDetailProps) {
  const navigate = useNavigate();
  const org = organizations.find(o => o.id === contract.orgId);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`${basePath}/contracts`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{contract.sessionId}</h1>
              <StatusBadge status={contract.status} />
            </div>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-gray-500">
                Created {format(contract.createdAt, 'MMMM d, yyyy \'at\' HH:mm')}
              </p>
              {showOrg && org && (
                <>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Building2 className="h-4 w-4" />
                    <span>{org.name}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Document Preview
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Original
                  </Button>
                  {contract.status === 'SIGNED' && (
                    <Button size="sm">
                      <FileCheck className="h-4 w-4 mr-2" />
                      Signed PDF
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contract.status === 'SIGNED' ? (
                <Tabs defaultValue="signed">
                  <TabsList className="mb-4">
                    <TabsTrigger value="signed">Signed Document</TabsTrigger>
                    <TabsTrigger value="original">Original Document</TabsTrigger>
                  </TabsList>
                  <TabsContent value="signed">
                    <DocumentPreview 
                      documentName={contract.documentName.replace('.pdf', '_signed.pdf')} 
                      isSigned 
                    />
                  </TabsContent>
                  <TabsContent value="original">
                    <DocumentPreview documentName={contract.documentName} />
                  </TabsContent>
                </Tabs>
              ) : (
                <DocumentPreview documentName={contract.documentName} />
              )}
            </CardContent>
          </Card>

          {/* Document Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5" />
                Document
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">File Name</p>
                  <p className="font-medium">{contract.documentName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pages</p>
                  <p className="font-medium">{contract.pageCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">File Size</p>
                  <p className="font-medium">{(contract.fileSizeKb / 1024).toFixed(2)} MB</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Document Hash</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs truncate max-w-[200px]">{contract.documentHash}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(contract.documentHash)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-5 w-5" />
                Signer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{contract.signerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ID Type</p>
                  <p className="font-medium">{contract.signerIdType.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ID Number</p>
                  <p className="font-mono">{contract.signerIdNumber}</p>
                </div>
                {contract.signerEmail && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{contract.signerEmail}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* KYC Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5" />
                KYC Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contract.kycJourneyId ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Journey ID</p>
                    <p className="font-mono text-sm">{contract.kycJourneyId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge 
                      variant={
                        contract.kycStatus === 'SUCCESS' ? 'signed' :
                        contract.kycStatus === 'FAILED' ? 'rejected' : 'created'
                      }
                    >
                      {contract.kycStatus}
                    </Badge>
                  </div>
                  {contract.kycCompletedAt && (
                    <div>
                      <p className="text-sm text-gray-500">Completed At</p>
                      <p className="font-medium">
                        {format(contract.kycCompletedAt, 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">KYC verification not started</p>
              )}
            </CardContent>
          </Card>

          {/* Termination Reason (if applicable) */}
          {contract.terminationReason && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  {contract.status === 'REJECTED' ? 'Rejection Reason' : 'Termination Reason'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{contract.terminationReason}</p>
              </CardContent>
            </Card>
          )}

          {/* Signature Positions */}
          {contract.signaturePositions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Signature Positions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contract.signaturePositions.map((pos, index) => (
                    <div key={index} className="flex items-center gap-4 text-sm p-2 bg-gray-50">
                      <span className="font-medium">Page {pos.page}</span>
                      <span className="text-gray-500">
                        Position: ({Math.round(pos.x)}, {Math.round(pos.y)})
                      </span>
                      <span className="text-gray-500">
                        Size: {pos.width}×{pos.height}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Timeline */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {contract.events.map((event) => (
                  <TimelineEvent key={event.id} event={event} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Organization</span>
                <span className="text-sm font-medium">{contract.orgName}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Created</span>
                <span className="text-sm">{format(contract.createdAt, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Expires</span>
                <span className="text-sm">{format(contract.expiresAt, 'MMM d, yyyy')}</span>
              </div>
              {contract.completedAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Completed</span>
                  <span className="text-sm text-green-600">
                    {format(contract.completedAt, 'MMM d, yyyy')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
