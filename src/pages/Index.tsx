import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Database, FileText } from 'lucide-react';
import { toast } from 'sonner';
import UploadStage from '@/components/UploadStage';
import LoadingSpinner from '@/components/LoadingSpinner';
import ResultsStage from '@/components/ResultsStage';
import ExtractModal from '@/components/ExtractModal';
import DocumentViewer from '@/components/DocumentViewer';
import StageFooter from '@/components/StageFooter';

type Stage = 1 | 2 | 3;

interface ExtractionData {
  thread_id: string;
  file_name: string;
  extracted_data: Record<string, any>;
  suggested_additional_data: Record<string, any>;
  template: Record<string, string>;
  confidence: number;
}

const DEFAULT_PANEL_WIDTH = () => Math.round(window.innerWidth * 0.33);

const Index = () => {
  const [stage, setStage] = useState<Stage>(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Processing...');
  const [data, setData] = useState<ExtractionData | null>(null);
  const [additionalData, setAdditionalData] = useState<Record<string, any> | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // PDF preview state
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [panelWidth, setPanelWidth] = useState<number>(DEFAULT_PANEL_WIDTH);
  const blobUrlRef = useRef<string | null>(null);

  // Revoke blob URL on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const openPreview = useCallback((file: File) => {
    // revoke previous blob if any
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    blobUrlRef.current = url;
    setPdfUrl(url);
    setFileName(file.name);
    setPanelWidth(DEFAULT_PANEL_WIDTH());
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    // Open preview immediately — don't wait for extraction
    openPreview(file);

    setLoading(true);
    setLoadingMessage('Extracting Document Entities...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://127.0.0.1:8000/extract/start_extraction', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Extraction failed');
      const result = await res.json();

      setData(result);
      setStage(2);
    } catch {
      toast.error('Backend unavailable. Please ensure the extraction service is running.');
    } finally {
      setLoading(false);
    }
  }, [openPreview]);

  const handleDeepExtraction = useCallback(async (requestedFields: Record<string, string>, additionalPrompt: string) => {
    setIsModalOpen(false);
    setLoading(true);
    setLoadingMessage('Running Deep Extraction...');

    try {
      const res = await fetch('http://127.0.0.1:8000/extract/resume_extraction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thread_id: data?.thread_id,
          file_name: data?.file_name,
          requested_additional_data_template: requestedFields,
          additional_prompt: additionalPrompt,
        }),
      });

      if (!res.ok) throw new Error('Deep extraction failed');
      const result = await res.json();
      setAdditionalData(result.extracted_additional_data);
      // note: backend field has a typo — "additonal_extracted_info"
      setAdditionalInfo(result.additonal_extracted_info ?? null);
      setStage(3);
    } catch {
      toast.error('Deep extraction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [data]);

  const handleStartOver = useCallback(() => {
    setStage(1);
    setData(null);
    setAdditionalData(null);
    setAdditionalInfo(null);
    setFileName(null);
    // Revoke and clear the PDF preview
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setPdfUrl(null);
  }, []);

  const showPreview = pdfUrl !== null;

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* ── Main content column ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        <header className="h-16 border-b border-border flex items-center px-8 justify-between glass z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center glow-indigo">
              <Database className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="font-bold tracking-tight text-lg text-foreground">
              Synapse <span className="text-muted-foreground font-medium">HITL</span>
            </h1>
          </div>
          {fileName && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full ring-surface text-xs text-muted-foreground">
              <FileText className="w-3.5 h-3.5" />
              {fileName}
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-8 pb-32">
          <AnimatePresence mode="wait">
            {!loading && stage === 1 && <UploadStage onFileSelected={handleFileUpload} />}
            {loading && <LoadingSpinner message={loadingMessage} />}
            {!loading && (stage === 2 || stage === 3) && data && (
              <ResultsStage
                data={data}
                additionalData={additionalData}
                additionalInfo={additionalInfo}
                stage={stage}
                onExtractMore={() => setIsModalOpen(true)}
                onStartOver={handleStartOver}
              />
            )}
          </AnimatePresence>
        </div>

        <StageFooter stage={stage} />
      </main>

      {/* ── PDF Preview panel (right side) ──────────────────────────────── */}
      <AnimatePresence>
        {showPreview && (
          <DocumentViewer
            fileUrl={pdfUrl}
            fileName={fileName}
            width={panelWidth}
            onResize={setPanelWidth}
          />
        )}
      </AnimatePresence>

      <ExtractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleDeepExtraction}
        currentTemplate={data?.template ?? {}}
      />
    </div>
  );
};

export default Index;
