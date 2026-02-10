import { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Separator, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { StatusBadge } from './StatusBadge';
import type { Contract, ContractEvent } from '@/types';
import { cn } from '@/lib/utils';
import { fetchDocumentBlob } from '@/services/sessions-api';

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
  CREATED: 'text-muted-foreground',
  KYC_STARTED: 'text-chart-3',
  KYC_COMPLETED: 'text-chart-2',
  KYC_FAILED: 'text-destructive',
  SIGNATURE_POSITIONED: 'text-primary',
  SIGNED: 'text-chart-2',
  REJECTED: 'text-destructive',
  ABANDONED: 'text-muted-foreground',
  EXPIRED: 'text-muted-foreground',
};

function TimelineEvent({ event }: { event: ContractEvent }) {
  const Icon = eventIcons[event.type] || Clock;
  const color = eventColors[event.type] || 'text-muted-foreground';

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={cn("w-8 h-8 rounded-full border-2 flex items-center justify-center bg-background", color, `border-current`)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 w-px bg-border my-2" />
      </div>
      <div className="pb-6">
        <p className="font-medium text-sm">{event.description}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {format(event.timestamp, 'MMM d, yyyy HH:mm:ss')}
        </p>
        {event.metadata && (
          <div className="mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-xl">
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

// Fallback PDF URL for when no real document URL is available
const SAMPLE_PDF_URL = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

// Document preview component with authenticated PDF fetch
function DocumentPreview({ documentName, sessionId, docType, isSigned, pageCount = 1 }: { documentName: string; sessionId?: string; docType?: 'original' | 'signed'; isSigned?: boolean; pageCount?: number }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!sessionId || !docType) return;
    let revoke: string | null = null;
    setLoading(true);
    setError(false);
    fetchDocumentBlob(sessionId, docType)
      .then((url) => {
        revoke = url;
        setBlobUrl(url);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    return () => { if (revoke) URL.revokeObjectURL(revoke); };
  }, [sessionId, docType]);

  const pdfUrl = blobUrl || (!sessionId ? SAMPLE_PDF_URL : null);

  return (
    <div className="border border-border rounded-xl bg-muted/30 overflow-hidden">
      {/* Document header */}
      <div className="bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{documentName}</span>
        </div>
        {isSigned && (
          <Badge variant="signed" className="text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Signed
          </Badge>
        )}
      </div>

      {/* PDF Embed */}
      <div className="relative bg-background">
        {loading ? (
          <div className="w-full h-[600px] flex items-center justify-center bg-muted/30">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error || !pdfUrl ? (
          <div className="w-full h-[600px] flex flex-col items-center justify-center bg-muted/30 p-8">
            <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-center">
              {error ? 'Failed to load document.' : 'No document available.'}
            </p>
          </div>
        ) : (
          <object
            data={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            type="application/pdf"
            className="w-full h-[600px]"
          >
            <div className="w-full h-[600px] flex flex-col items-center justify-center bg-muted/30 p-8">
              <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                PDF preview not available in this browser.
              </p>
            </div>
          </object>
        )}

        {/* Signed overlay indicator */}
        {isSigned && !loading && !error && pdfUrl && (
          <div className="absolute bottom-4 right-4 bg-green-50 border-2 border-green-500 rounded-xl px-4 py-3 shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-semibold text-green-700">Digitally Signed</p>
                <p className="text-xs text-green-600">Face ID Verified</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Page indicator */}
      <div className="bg-background border-t border-border px-4 py-2 flex items-center justify-between">
        {pageCount > 0 ? (
          <span className="text-xs text-muted-foreground">{pageCount} page{pageCount > 1 ? 's' : ''}</span>
        ) : (
          <span />
        )}
        {!sessionId && <span className="text-xs text-muted-foreground/70">Sample PDF for demonstration</span>}
      </div>
    </div>
  );
}

export function ContractDetail({ contract, basePath = '/dash', showOrg }: ContractDetailProps) {
  const navigate = useNavigate();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDownload = async (sessionId: string, type: 'original' | 'signed', filename: string) => {
    try {
      const blobUrl = await fetchDocumentBlob(sessionId, type);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      // silently fail
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`${basePath}/sessions`)}
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
              {showOrg && contract.orgName && contract.orgName !== '—' && (
                <>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Building2 className="h-4 w-4" />
                    <span>{contract.orgName}</span>
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
                  {contract.documentUrl && (
                    <Button variant="outline" size="sm" onClick={() => handleDownload(contract.sessionId, 'original', contract.documentName)}>
                      <Download className="h-4 w-4 mr-2" />
                      Original
                    </Button>
                  )}
                  {contract.status === 'SIGNED' && contract.signedDocumentUrl && (
                    <Button size="sm" onClick={() => handleDownload(contract.sessionId, 'signed', contract.documentName.replace('.pdf', '_signed.pdf'))}>
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
                      sessionId={contract.sessionId}
                      docType="signed"
                      isSigned
                      pageCount={contract.pageCount}
                    />
                  </TabsContent>
                  <TabsContent value="original">
                    <DocumentPreview
                      documentName={contract.documentName}
                      sessionId={contract.sessionId}
                      docType="original"
                      pageCount={contract.pageCount}
                    />
                  </TabsContent>
                </Tabs>
              ) : (
                <DocumentPreview
                  documentName={contract.documentName}
                  sessionId={contract.sessionId}
                  docType="original"
                  pageCount={contract.pageCount}
                />
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
                {contract.pageCount > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Pages</p>
                    <p className="font-medium">{contract.pageCount}</p>
                  </div>
                )}
                {contract.fileSizeKb > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">File Size</p>
                    <p className="font-medium">{(contract.fileSizeKb / 1024).toFixed(2)} MB</p>
                  </div>
                )}
                {contract.documentHash && (
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
                )}
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
                    <div key={index} className="flex items-center gap-4 text-sm p-2 bg-muted/50 rounded-md">
                      <span className="font-medium">Page {pos.page}</span>
                      <span className="text-muted-foreground">
                        Position: ({(pos.x * 100).toFixed(1)}%, {(pos.y * 100).toFixed(1)}%)
                      </span>
                      <span className="text-muted-foreground">
                        Size: {(pos.width * 100).toFixed(1)}% × {(pos.height * 100).toFixed(1)}%
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
              {contract.events.length > 0 ? (
                <div className="space-y-0">
                  {contract.events.map((event) => (
                    <TimelineEvent key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No events recorded</p>
              )}
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
