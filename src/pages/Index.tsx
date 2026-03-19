import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Database, FileText } from 'lucide-react';
import { toast } from 'sonner';
import UploadStage from '@/components/UploadStage';
import LoadingSpinner from '@/components/LoadingSpinner';
import ResultsStage from '@/components/ResultsStage';
import ExtractModal from '@/components/ExtractModal';

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

const Index = () => {
  const [stage, setStage] = useState<Stage>(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Processing...');
  const [data, setData] = useState<ExtractionData | null>(null);
  const [additionalData, setAdditionalData] = useState<Record<string, any> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paneWidth, setPaneWidth] = useState(450);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    setFileName(file.name);
    setFileUrl(URL.createObjectURL(file));
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
  }, []);

  const handleDeepExtraction = useCallback(async (requestedFields: Record<string, string>) => {
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
        }),
      });

      if (!res.ok) throw new Error('Deep extraction failed');
      const result = await res.json();
      setAdditionalData(result.extracted_additional_data);
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
    setFileUrl(null);
    setFileName(null);
  }, []);

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <main className="flex-1 flex flex-col min-w-0 relative">
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
                stage={stage}
                onExtractMore={() => setIsModalOpen(true)}
                onStartOver={handleStartOver}
              />
            )}
          </AnimatePresence>
        </div>

        <StageFooter stage={stage} />
      </main>

      <DocumentViewer
        fileUrl={fileUrl}
        fileName={fileName}
        width={paneWidth}
        onResize={setPaneWidth}
      />

      <ExtractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleDeepExtraction}
      />
    </div>
  );
};

export default Index;
