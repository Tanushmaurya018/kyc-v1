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
  Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Separator } from '@/components/ui';
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
