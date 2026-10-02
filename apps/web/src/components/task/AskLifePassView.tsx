import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  analyzeTaskRequirements,
  DEMO_TASK_SUGGESTIONS,
  TaskAnalysisResult,
  MissingRequirement,
} from '../../services/taskRequirementAdapter';
import { VaultRecord, RecordCategory } from '../../services/recordVaultRepository';
import { RequirementResults } from './RequirementResults';
import { RecordDetailsModal } from '../vault/RecordDetailsModal';
import { UploadRecordModal } from '../vault/UploadRecordModal';
import { theme } from '../../styles/theme';

export interface AskLifePassViewProps {
  initialTaskInput?: string;
  records: VaultRecord[];
  onAddRecord: (record: VaultRecord) => void;
  onNavigateVault?: () => void;
}

export const AskLifePassView: React.FC<AskLifePassViewProps> = ({
  initialTaskInput = 'I want to apply for university admission',
  records,
  onAddRecord,
  onNavigateVault,
}) => {
  const [taskInput, setTaskInput] = useState(initialTaskInput);
  const [submittedTask, setSubmittedTask] = useState<string>(initialTaskInput);
  const [selectedRecordForModal, setSelectedRecordForModal] = useState<VaultRecord | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [prefilledUploadCategory, setPrefilledUploadCategory] = useState<RecordCategory>('Education');
  const [prefilledUploadType, setPrefilledUploadType] = useState<string>('');

  // Re-run analysis whenever submittedTask or records change
  const analysisResult: TaskAnalysisResult | null = useMemo(() => {
    if (!submittedTask.trim()) return null;
    return analyzeTaskRequirements(submittedTask, records);
  }, [submittedTask, records]);

  // Keep internal taskInput in sync if initialTaskInput changes externally
  useEffect(() => {
    if (initialTaskInput && initialTaskInput !== submittedTask) {
      setTaskInput(initialTaskInput);
      setSubmittedTask(initialTaskInput);
    }
  }, [initialTaskInput]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmittedTask(taskInput.trim());
  };

  const handleSelectSuggestion = (prompt: string) => {
    setTaskInput(prompt);
    setSubmittedTask(prompt);
  };

  const handleViewRecord = (record: VaultRecord) => {
    setSelectedRecordForModal(record);
    setIsDetailsModalOpen(true);
  };

  const handleAddMissing = (missing: MissingRequirement) => {
    setPrefilledUploadCategory(missing.requirement.category);
    setPrefilledUploadType(missing.requirement.documentType);
    setIsUploadModalOpen(true);
  };

  return (
    <div style={styles.container}>
      {/* 1. HERO & TASK INPUT CARD */}
      <section style={styles.inputSection}>
        <div style={styles.heroText}>
          <div style={styles.titleRow}>
            <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>✨</span>
            <h1 style={styles.title}>What are you trying to accomplish?</h1>
          </div>
          <p style={styles.subtitle}>
            Tell LifePass what you're trying to do and we'll help organize the records you may need.
          </p>
        </div>

        <Card style={styles.inputCard}>
          <form onSubmit={handleSubmit} style={styles.inputForm}>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🎯</span>
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="e.g. I want to apply for university admission, educational loan, or employment..."
                style={styles.taskInput}
              />
              {taskInput && (
                <button
                  type="button"
                  onClick={() => setTaskInput('')}
                  style={styles.clearBtn}
                  title="Clear input"
                >
                  ✕
                </button>
              )}
            </div>

            <Button
              variant="primary"
              size="md"
              type="submit"
              style={styles.submitBtn}
            >
              Check Requirements
            </Button>
          </form>

          {/* Demo Task Suggestions */}
          <div style={styles.suggestionsContainer}>
            <span style={styles.suggestionsLabel}>Demo Scenarios:</span>
            <div style={styles.suggestionsList}>
              {DEMO_TASK_SUGGESTIONS.map((sug) => (
                <button
                  key={sug.label}
                  type="button"
                  onClick={() => handleSelectSuggestion(sug.prompt)}
                  style={
                    submittedTask.toLowerCase().includes(sug.label.toLowerCase())
                      ? styles.sugPillActive
                      : styles.sugPill
                  }
                >
                  <span>{sug.label}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* 2. RESULTS OR EMPTY / UNSUPPORTED STATE */}
      {analysisResult ? (
        analysisResult.profileFound ? (
          <RequirementResults
            analysis={analysisResult}
            onViewRecord={handleViewRecord}
            onAddMissing={handleAddMissing}
            onNavigateVault={onNavigateVault}
          />
        ) : (
          /* Unsupported Task State */
          <div style={styles.unsupportedCard}>
            <div style={styles.unsupportedIcon}>ℹ️</div>
            <h3 style={styles.unsupportedTitle}>No Demo Profile Found</h3>
            <p style={styles.unsupportedText}>
              We don't have a configured demo requirement profile for "{submittedTask}".
            </p>
            <p style={styles.unsupportedSub}>
              LifePass AI currently includes configured demo profiles for{' '}
              <strong>College Admission</strong>, <strong>Job Application</strong>,{' '}
              <strong>Educational Loan</strong>, and <strong>Hospital Inpatient</strong>.
            </p>
            <div style={styles.unsupportedActions}>
              <Button
                variant="primary"
                size="md"
                onClick={() => handleSelectSuggestion('I want to apply for university admission')}
              >
                Try College Admission Demo →
              </Button>
            </div>
          </div>
        )
      ) : (
        /* Empty Task State */
        <div style={styles.emptyPromptCard}>
          <div style={styles.emptyIcon}>💡</div>
          <h3 style={styles.emptyTitle}>Tell us what you're trying to accomplish</h3>
          <p style={styles.emptyText}>
            Enter your life goal above or pick one of the demo scenarios to view structured document requirements and match readiness.
          </p>
        </div>
      )}

      {/* 3. MODALS */}
      <RecordDetailsModal
        record={selectedRecordForModal}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedRecordForModal(null);
        }}
      />

      <UploadRecordModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        initialCategory={prefilledUploadCategory}
        initialRecordType={prefilledUploadType}
        initialName={prefilledUploadType ? `${prefilledUploadType}` : ''}
        onAddRecord={(newRecord) => {
          onAddRecord(newRecord);
          setIsUploadModalOpen(false);
        }}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  inputSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  heroText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: theme.colors.textPrimary,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.9375rem',
    color: theme.colors.textSecondary,
    margin: 0,
  },
  inputCard: {
    padding: '1.25rem 1.5rem',
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '0.75rem',
    boxShadow: theme.shadows.sm,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  inputForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: '1 1 360px',
  },
  inputIcon: {
    position: 'absolute',
    left: '0.875rem',
    fontSize: '1rem',
    color: theme.colors.textMuted,
    pointerEvents: 'none',
  },
  taskInput: {
    width: '100%',
    height: '2.75rem',
    padding: '0 2.25rem 0 2.5rem',
    backgroundColor: theme.colors.pageBg,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    color: theme.colors.textPrimary,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: theme.typography.fontFamily,
    transition: 'border-color 0.15s ease',
  },
  clearBtn: {
    position: 'absolute',
    right: '0.75rem',
    background: 'none',
    border: 'none',
    color: theme.colors.textMuted,
    cursor: 'pointer',
    padding: '0.25rem',
    fontSize: '0.875rem',
  },
  submitBtn: {
    height: '2.75rem',
    padding: '0 1.25rem',
    fontSize: '0.875rem',
    whiteSpace: 'nowrap',
    boxShadow: theme.shadows.xs,
  },
  suggestionsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
    paddingTop: '0.75rem',
    borderTop: `1px solid ${theme.colors.borderLight}`,
  },
  suggestionsLabel: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: theme.colors.textSecondary,
  },
  suggestionsList: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  sugPill: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.35rem 0.75rem',
    borderRadius: '9999px',
    backgroundColor: theme.colors.pageBg,
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.textSecondary,
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  sugPillActive: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.35rem 0.75rem',
    borderRadius: '9999px',
    backgroundColor: theme.colors.surfaceAccent,
    border: `1px solid ${theme.colors.primary}`,
    color: theme.colors.primary,
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  unsupportedCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '3rem 1.5rem',
    backgroundColor: theme.colors.surface,
    border: `1px dashed ${theme.colors.border}`,
    borderRadius: '0.75rem',
    gap: '0.5rem',
  },
  unsupportedIcon: {
    fontSize: '2.5rem',
    lineHeight: 1,
    marginBottom: '0.5rem',
  },
  unsupportedTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
    margin: 0,
  },
  unsupportedText: {
    fontSize: '0.9375rem',
    color: theme.colors.textSecondary,
    margin: 0,
    maxWidth: '500px',
  },
  unsupportedSub: {
    fontSize: '0.8125rem',
    color: theme.colors.textMuted,
    margin: '0.5rem 0 1rem 0',
    maxWidth: '520px',
  },
  unsupportedActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  emptyPromptCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '3.5rem 1.5rem',
    backgroundColor: theme.colors.surface,
    border: `1px dashed ${theme.colors.border}`,
    borderRadius: '0.75rem',
    gap: '0.5rem',
  },
  emptyIcon: {
    fontSize: '2.5rem',
    lineHeight: 1,
    marginBottom: '0.5rem',
  },
  emptyTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
    margin: 0,
  },
  emptyText: {
    fontSize: '0.875rem',
    color: theme.colors.textSecondary,
    maxWidth: '480px',
    margin: 0,
  },
};
