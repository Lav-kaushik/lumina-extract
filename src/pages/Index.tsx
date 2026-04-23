import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Database, FileText } from 'lucide-react';
import { toast } from 'sonner';
import UploadStage from '@/components/UploadStage';
import LoadingSpinner from '@/components/LoadingSpinner';
import ResultsStage from '@/components/ResultsStage';
import ReviewStage from '@/components/ReviewStage';
import ExtractModal from '@/components/ExtractModal';
import DocumentViewer from '@/components/DocumentViewer';
import StageFooter from '@/components/StageFooter';

type Stage = 1 | 2 | 2.5 | 3;

interface ExtractionData {
  thread_id: string;
  file_name: string;
  extracted_data: Record<string, any>;
  suggested_additional_data: Record<string, any>;
  template: Record<string, string>;
  confidence: number;
}

interface PreviewData {
  extracted_additional_data: Record<string, any>;
  additonal_extracted_info: string | null;
  confidence: number;
}

const DEFAULT_PANEL_WIDTH = () => Math.round(window.innerWidth * 0.33);

const Index = () => {
  const [stage, setStage] = useState<Stage>(1);
  // Full-screen loading (stage transitions)
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Processing...');

  const [data, setData] = useState<ExtractionData | null>(null);

  // Stage 2.5 — current staged template + its live preview result
  const [stagedTemplate, setStagedTemplate] = useState<Record<string, string>>({});
  const [stagedPrompt, setStagedPrompt] = useState<string>('');
  // True while a re-preview call is in flight (inline, not full-screen)
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  // Stage 3 — final approved data
  const [additionalData, setAdditionalData] = useState<Record<string, any> | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // PDF preview panel
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [panelWidth, setPanelWidth] = useState<number>(DEFAULT_PANEL_WIDTH);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => { if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current); };
  }, []);

  const openPreview = useCallback((file: File) => {
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const url = URL.createObjectURL(file);
    blobUrlRef.current = url;
    setPdfUrl(url);
    setFileName(file.name);
    setPanelWidth(DEFAULT_PANEL_WIDTH());
  }, []);

  // ── Stage 1 → 2: upload + initial extraction ────────────────────────────────
  const handleFileUpload = useCallback(async (file: File) => {
    openPreview(file);
    setLoading(true);
    setLoadingMessage('Extracting Document Entities…');

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

  // ── Stage 2 / 2.5 → 2.5: preview (runs LLM, shows result inline) ───────────
  // First call: graph paused at human_node → runs extract_additional_data → pauses at human_review_node
  // Loop calls: graph paused at human_review_node → approved=False → re-runs extract_additional_data → pauses again
  const runPreview = useCallback(async (fields: Record<string, string>, prompt: string) => {
    setIsModalOpen(false);
    setStagedTemplate(fields);
    setStagedPrompt(prompt);

    // First invocation goes full-screen; subsequent loop runs are inline
    const isFirstPreview = stage !== 2.5;
    if (isFirstPreview) {
      setLoading(true);
      setLoadingMessage('Running Extraction Preview…');
    } else {
      setPreviewLoading(true);
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/extract/preview_extraction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thread_id: data?.thread_id,
          file_name: data?.file_name,
          requested_additional_data_template: fields,
          additional_prompt: prompt,
        }),
      });

      if (!res.ok) throw new Error('Preview extraction failed');
      const result = await res.json();

      setPreviewData({
        extracted_additional_data: result.extracted_additional_data,
        additonal_extracted_info: result.additonal_extracted_info ?? null,
        confidence: result.confidence,
      });
      setStage(2.5);
    } catch {
      toast.error('Preview failed. Please try again.');
    } finally {
      setLoading(false);
      setPreviewLoading(false);
    }
  }, [data, stage]);

  // ── Stage 2.5 → 2.5: open modal pre-filled with current staged template ─────
  const handleEditTemplate = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  // ── Stage 2.5 → 3: approve (no re-extraction, graph advances to END) ─────────
  const handleApproveExtraction = useCallback(async () => {
    setLoading(true);
    setLoadingMessage('Finalising Extraction…');

    try {
      const res = await fetch('http://127.0.0.1:8000/extract/approve_extraction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thread_id: data?.thread_id,
          file_name: data?.file_name,
        }),
      });

      if (!res.ok) throw new Error('Approve failed');
      const result = await res.json();
      // The approved result is whatever was last previewed (same data)
      setAdditionalData(result.extracted_additional_data);
      setAdditionalInfo(result.additonal_extracted_info ?? null);
      setStage(3);
    } catch {
      toast.error('Approval failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [data]);

  const handleStartOver = useCallback(() => {
    setStage(1);
    setData(null);
    setStagedTemplate({});
    setStagedPrompt('');
    setPreviewData(null);
    setAdditionalData(null);
    setAdditionalInfo(null);
    setFileName(null);
    if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }
    setPdfUrl(null);
  }, []);

  // Template to pre-fill in the modal:
  //   loop iteration → use staged template
  //   first open (stage 2) → use initial extraction template
  const modalTemplate = Object.keys(stagedTemplate).length > 0
    ? stagedTemplate
    : (data?.template ?? {});

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
            {/* Stage 1: upload */}
            {!loading && stage === 1 && (
              <UploadStage onFileSelected={handleFileUpload} />
            )}

            {/* Full-screen loading spinner */}
            {loading && (
              <LoadingSpinner message={loadingMessage} />
            )}

            {/* Stage 2: initial extraction results */}
            {!loading && stage === 2 && data && (
              <ResultsStage
                data={data}
                additionalData={null}
                additionalInfo={null}
                stage={2}
                onExtractMore={() => setIsModalOpen(true)}
                onStartOver={handleStartOver}
              />
            )}

            {/* Stage 2.5: LLM preview loop */}
            {!loading && stage === 2.5 && previewData && (
              <ReviewStage
                stagedTemplate={stagedTemplate}
                previewData={previewData}
                additionalPrompt={stagedPrompt}
                isLoading={previewLoading}
                onEdit={handleEditTemplate}
                onApprove={handleApproveExtraction}
              />
            )}

            {/* Stage 3: final approved results */}
            {!loading && stage === 3 && data && (
              <ResultsStage
                data={data}
                additionalData={additionalData}
                additionalInfo={additionalInfo}
                stage={3}
                onExtractMore={() => {}}
                onStartOver={handleStartOver}
              />
            )}
          </AnimatePresence>
        </div>

        <StageFooter stage={stage} />
      </main>

      {/* ── PDF Preview panel (right side, shown as soon as file is picked) */}
      <AnimatePresence>
        {pdfUrl !== null && (
          <DocumentViewer
            fileUrl={pdfUrl}
            fileName={fileName}
            width={panelWidth}
            onResize={setPanelWidth}
          />
        )}
      </AnimatePresence>

      {/* ── Template editor modal ────────────────────────────────────────── */}
      <ExtractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={runPreview}
        currentTemplate={modalTemplate}
      />
    </div>
  );
};

export default Index;
