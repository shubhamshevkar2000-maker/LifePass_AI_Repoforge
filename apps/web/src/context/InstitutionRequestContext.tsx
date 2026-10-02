import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  InstitutionRequest,
  INITIAL_INSTITUTION_REQUESTS,
  computeInstitutionMetrics,
  InstitutionMetrics,
  RequestedRecord,
} from '../services/institutionDemoData';

export interface CreateRequestInput {
  applicantId: string;
  applicantName: string;
  applicantIdentifier: string;
  referenceLabel: string;
  purpose: string;
  requirementProfileId: string;
  requirementProfile: string;
  requestedRecords: RequestedRecord[];
  accessDurationHours: number;
  requestedExpiryLabel: string;
  notes?: string;
}

export interface InstitutionRequestContextType {
  requests: InstitutionRequest[];
  metrics: InstitutionMetrics;
  isCreateWizardOpen: boolean;
  openCreateWizard: () => void;
  closeCreateWizard: () => void;
  selectedRequestForDetails: InstitutionRequest | null;
  viewRequestDetails: (request: InstitutionRequest) => void;
  closeRequestDetails: () => void;
  lastCreatedRequest: InstitutionRequest | null;
  createRequest: (input: CreateRequestInput) => InstitutionRequest;
  resetLastCreatedRequest: () => void;
}

const InstitutionRequestContext = createContext<InstitutionRequestContextType | undefined>(undefined);

export const InstitutionRequestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<InstitutionRequest[]>(INITIAL_INSTITUTION_REQUESTS);
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState<boolean>(false);
  const [selectedRequestForDetails, setSelectedRequestForDetails] = useState<InstitutionRequest | null>(null);
  const [lastCreatedRequest, setLastCreatedRequest] = useState<InstitutionRequest | null>(null);

  // Dynamically derive summary metrics whenever requests change
  const metrics = useMemo(() => computeInstitutionMetrics(requests), [requests]);

  const openCreateWizard = () => setIsCreateWizardOpen(true);
  const closeCreateWizard = () => {
    setIsCreateWizardOpen(false);
  };

  const viewRequestDetails = (req: InstitutionRequest) => {
    setSelectedRequestForDetails(req);
  };

  const closeRequestDetails = () => {
    setSelectedRequestForDetails(null);
  };

  const resetLastCreatedRequest = () => {
    setLastCreatedRequest(null);
  };

  const createRequest = (input: CreateRequestInput): InstitutionRequest => {
    // Generate sequential demo ID
    const demoSeq = 1000 + requests.length + 1;
    const newId = `REQ-DEMO-${demoSeq}`;

    const newRequest: InstitutionRequest = {
      id: newId,
      applicantId: input.applicantId,
      applicantName: input.applicantName,
      applicantIdentifier: input.applicantIdentifier,
      referenceLabel: input.referenceLabel,
      purpose: input.purpose,
      requirementProfileId: input.requirementProfileId,
      requirementProfile: input.requirementProfile,
      requestedRecords: input.requestedRecords,
      requestedRecordsCount: input.requestedRecords.length,
      accessDurationHours: input.accessDurationHours,
      requestedExpiryLabel: input.requestedExpiryLabel,
      status: 'SENT',
      createdAt: new Date().toISOString(),
      updatedAt: 'Just now',
      notes: input.notes || 'Dispatched in this session (demo simulated dispatch; citizen notification simulated).',
      isDemo: true,
    };

    // Prepend to requests list so it appears at top of dashboard & request list
    setRequests((prev) => [newRequest, ...prev]);
    setLastCreatedRequest(newRequest);

    return newRequest;
  };

  const value: InstitutionRequestContextType = {
    requests,
    metrics,
    isCreateWizardOpen,
    openCreateWizard,
    closeCreateWizard,
    selectedRequestForDetails,
    viewRequestDetails,
    closeRequestDetails,
    lastCreatedRequest,
    createRequest,
    resetLastCreatedRequest,
  };

  return (
    <InstitutionRequestContext.Provider value={value}>
      {children}
    </InstitutionRequestContext.Provider>
  );
};

export function useInstitutionRequests(): InstitutionRequestContextType {
  const context = useContext(InstitutionRequestContext);
  if (!context) {
    throw new Error('useInstitutionRequests must be used within an InstitutionRequestProvider');
  }
  return context;
}
