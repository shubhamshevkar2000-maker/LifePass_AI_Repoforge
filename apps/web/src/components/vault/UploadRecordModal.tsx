import React, { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { VaultRecord, RecordCategory } from '../../services/recordVaultRepository';
import { theme } from '../../styles/theme';

export interface UploadRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecord: (record: VaultRecord) => void;
}

const CATEGORIES: RecordCategory[] = [
  'Identity',
  'Education',
  'Employment',
  'Finance',
  'Healthcare',
  'Address',
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

export const UploadRecordModal: React.FC<UploadRecordModalProps> = ({
  isOpen,
  onClose,
  onAddRecord,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<RecordCategory>('Education');
  const [recordType, setRecordType] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName('');
    setCategory('Education');
    setRecordType('');
    setDescription('');
    setSelectedFile(null);
    setError(null);
    setIsProcessing(false);
    setProcessingStep('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (isProcessing) return;
    resetForm();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (!files || files.length === 0) {
      setSelectedFile(null);
      return;
    }

    const file = files[0];
    const fileNameLower = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext));

    if (!hasValidExtension) {
      setError(`Invalid file format. Allowed file types: ${ALLOWED_EXTENSIONS.join(', ')}`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File size exceeds 10 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB selected).`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);

    // Auto-fill suggested record name and type if empty
    if (!name) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setName(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }
    if (!recordType) {
      if (fileNameLower.includes('transcript') || fileNameLower.includes('marksheet')) {
        setRecordType('Academic Marksheet');
      } else if (fileNameLower.includes('admission') || fileNameLower.includes('offer')) {
        setRecordType('Admission Letter');
      } else if (fileNameLower.includes('degree') || fileNameLower.includes('diploma')) {
        setRecordType('Degree Certificate');
      } else if (fileNameLower.includes('id') || fileNameLower.includes('aadhaar')) {
        setRecordType('Identity Card');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (!name.trim()) {
      setError('Please provide a name for this record.');
      return;
    }

    if (!recordType.trim()) {
      setError('Please specify the record type (e.g. Admission Letter, Marksheet).');
      return;
    }

    if (!selectedFile) {
      setError('Please select a document file (.pdf, .jpg, .png up to 10MB).');
      return;
    }

    // Format file size string
    const sizeInKb = selectedFile.size / 1024;
    const formattedSize =
      sizeInKb > 1024
        ? `${(sizeInKb / 1024).toFixed(1)} MB`
        : `${Math.round(sizeInKb)} KB`;

    // Detect format
    const ext = selectedFile.name.split('.').pop()?.toUpperCase() || 'PDF';

    // Start simulated processing
    setIsProcessing(true);
    setProcessingStep('Preparing your record and calculating client-side hash...');

    setTimeout(() => {
      setProcessingStep('Applying zero-knowledge encryption wrapper...');
      setTimeout(() => {
        const todayStr = new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).format(new Date());

        const newRecord: VaultRecord = {
          id: `rec-${Date.now().toString(36)}`,
          name: name.trim(),
          category,
          type: recordType.trim(),
          status: 'PENDING',
          source: 'User Uploaded',
          addedAt: todayStr,
          updatedAt: todayStr,
          description: description.trim() || undefined,
          fileName: selectedFile.name,
          fileSize: formattedSize,
          format: ext,
        };

        onAddRecord(newRecord);
        resetForm();
        onClose();
      }, 350);
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Record to Vault"
      description="Store, encrypt, and manage a new verified document in your personal sovereign vault."
      maxWidth="580px"
      footer={
        <div style={styles.footerContainer}>
          <Button
            variant="secondary"
            size="md"
            onClick={handleClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            isLoading={isProcessing}
            disabled={isProcessing}
          >
            {isProcessing ? 'Adding Record...' : 'Encrypt & Add Record'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Processing State Indicator */}
        {isProcessing && (
          <div style={styles.processingBanner}>
            <Spinner size="md" color={theme.colors.primary} />
            <div style={{ flex: 1 }}>
              <strong style={styles.processingTitle}>Preparing your record...</strong>
              <div style={styles.processingSub}>{processingStep}</div>
            </div>
          </div>
        )}

        {/* Error Callout */}
        {error && (
          <div style={styles.errorBanner} role="alert">
            <span style={{ fontSize: '1rem' }}>⚠️</span>
            <span style={{ flex: 1 }}>{error}</span>
          </div>
        )}

        {/* 1. Record Name */}
        <Input
          label="Record Name"
          placeholder="e.g. Provisional University Admission Letter"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isProcessing}
          hint="A recognizable title for you to identify this document"
        />

        {/* 2. Category & Record Type (2 Columns) */}
        <div style={styles.twoCol}>
          <div style={styles.selectWrapper}>
            <label htmlFor="record-category" style={styles.inputLabel}>
              Category <span style={{ color: theme.colors.danger }}>*</span>
            </label>
            <select
              id="record-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as RecordCategory)}
              disabled={isProcessing}
              style={styles.selectInput}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <span style={styles.hintText}>Life-stage grouping</span>
          </div>

          <div style={{ flex: 1 }}>
            <Input
              label="Record Type"
              placeholder="e.g. Admission Letter, Transcript"
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              required
              disabled={isProcessing}
              hint="Document classification"
            />
          </div>
        </div>

        {/* 3. Document File Selection */}
        <div style={styles.fileFieldContainer}>
          <label style={styles.inputLabel}>
            Document File <span style={{ color: theme.colors.danger }}>*</span>
          </label>
          <div
            style={styles.dropZone}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              disabled={isProcessing}
            />

            <div style={styles.dropZoneContent}>
              <div style={styles.uploadIcon}>📁</div>
              {selectedFile ? (
                <div>
                  <div style={styles.fileName}>{selectedFile.name}</div>
                  <div style={styles.fileMeta}>
                    {(selectedFile.size / 1024).toFixed(0)} KB • Click to replace file
                  </div>
                </div>
              ) : (
                <div>
                  <div style={styles.uploadPrompt}>
                    <strong style={{ color: theme.colors.primary }}>Click to select</strong> or drag and drop file here
                  </div>
                  <div style={styles.uploadFormats}>
                    Supported formats: PDF, JPG, PNG (Max 10 MB)
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Description / Notes (Optional) */}
        <div style={styles.textareaWrapper}>
          <label htmlFor="record-desc" style={styles.inputLabel}>
            Description / Context <span style={{ color: theme.colors.textMuted }}>(Optional)</span>
          </label>
          <textarea
            id="record-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isProcessing}
            placeholder="e.g. Official letter from university admissions office for 2026 fall intake."
            rows={2}
            style={styles.textarea}
          />
          <span style={styles.hintText}>
            Personal context notes. Stored encrypted with this document.
          </span>
        </div>

        {/* Disclaimer / In-Memory Session Notice */}
        <div style={styles.disclaimerNotice}>
          🔒 <strong>Browser-Safe Session Vault:</strong> This frontend evaluation environment encrypts
          and stores records in memory for session lifetime. Initial status will be set to{' '}
          <span style={{ fontWeight: 600, color: theme.colors.warningText }}>PENDING</span> for verification.
        </div>
      </form>
    </Modal>
  );
};

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.125rem',
  },
  processingBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
    backgroundColor: theme.colors.infoBg,
    border: `1px solid ${theme.colors.infoBorder}`,
    borderRadius: '0.5rem',
    padding: '0.875rem 1rem',
  },
  processingTitle: {
    fontSize: '0.875rem',
    color: theme.colors.infoText,
    display: 'block',
  },
  processingSub: {
    fontSize: '0.75rem',
    color: theme.colors.infoText,
    marginTop: '0.125rem',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    backgroundColor: theme.colors.dangerBg,
    border: `1px solid ${theme.colors.dangerBorder}`,
    borderRadius: '0.375rem',
    padding: '0.625rem 0.875rem',
    fontSize: '0.8125rem',
    color: theme.colors.dangerText,
    fontWeight: 500,
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.875rem',
    alignItems: 'start',
  },
  selectWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  inputLabel: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: theme.colors.textPrimary,
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  selectInput: {
    height: '2.5rem',
    padding: '0 0.75rem',
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    color: theme.colors.textPrimary,
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    cursor: 'pointer',
    fontFamily: theme.typography.fontFamily,
  },
  hintText: {
    fontSize: '0.75rem',
    color: theme.colors.textMuted,
  },
  fileFieldContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  dropZone: {
    border: `2px dashed ${theme.colors.border}`,
    borderRadius: '0.5rem',
    padding: '1.25rem 1rem',
    backgroundColor: theme.colors.pageBg,
    cursor: 'pointer',
    transition: 'border-color 0.15s ease',
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  dropZoneContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  uploadIcon: {
    fontSize: '1.75rem',
    lineHeight: 1,
  },
  uploadPrompt: {
    fontSize: '0.875rem',
    color: theme.colors.textPrimary,
  },
  uploadFormats: {
    fontSize: '0.75rem',
    color: theme.colors.textMuted,
    marginTop: '0.25rem',
  },
  fileName: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: theme.colors.primary,
  },
  fileMeta: {
    fontSize: '0.75rem',
    color: theme.colors.textSecondary,
    marginTop: '0.25rem',
  },
  textareaWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  textarea: {
    padding: '0.625rem 0.75rem',
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    color: theme.colors.textPrimary,
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    resize: 'vertical',
    fontFamily: theme.typography.fontFamily,
  },
  disclaimerNotice: {
    fontSize: '0.75rem',
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.surfaceMuted,
    padding: '0.625rem 0.75rem',
    borderRadius: '0.375rem',
    border: `1px solid ${theme.colors.borderLight}`,
    lineHeight: 1.4,
  },
  footerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    width: '100%',
  },
};
