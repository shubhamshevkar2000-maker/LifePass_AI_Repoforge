import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { RecordCategory, RecordItem } from '@lifepass/shared';
import { listRecords } from '../services/recordService';
import { StatusBadge } from '../components/StatusBadge';

interface MyRecordsScreenProps {
  initialCategory?: RecordCategory;
  onSelectRecord: (recordId: string) => void;
  onNavigateToUpload: () => void;
  onBackToHome: () => void;
}

const CATEGORIES: { label: string; value: RecordCategory | 'all' }[] = [
  { label: 'All Records', value: 'all' },
  { label: 'Identity', value: 'identity' },
  { label: 'Education', value: 'education' },
  { label: 'Employment', value: 'employment' },
  { label: 'Finance', value: 'finance' },
  { label: 'Healthcare', value: 'healthcare' },
];

export const MyRecordsScreen: React.FC<MyRecordsScreenProps> = ({
  initialCategory,
  onSelectRecord,
  onNavigateToUpload,
  onBackToHome,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<RecordCategory | 'all'>(
    initialCategory || 'all'
  );
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean>(true);

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const catFilter = selectedCategory === 'all' ? undefined : selectedCategory;
    const res = await listRecords(catFilter);

    setIsLoading(false);
    setIsRefreshing(false);

    if (res.data) {
      setRecords(res.data);
    } else {
      setRecords([]);
    }

    if (res.error) {
      setErrorMessage(res.error);
    }
    if (res.isBackendAvailable !== undefined) {
      setIsBackendAvailable(res.isBackendAvailable);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchRecords();
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return 'Not specified';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBackToHome} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>← Home</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Records</Text>
        <TouchableOpacity
          style={styles.addHeaderBtn}
          onPress={onNavigateToUpload}
          activeOpacity={0.8}
        >
          <Text style={styles.addHeaderBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Backend Status Notice */}
      {!isBackendAvailable && (
        <View style={styles.backendNoticeBox}>
          <Text style={styles.backendNoticeTitle}>
            PHASE 2 BACKEND GATE PENDING (WORKSTREAM 1)
          </Text>
          <Text style={styles.backendNoticeText}>
            The PostgreSQL table `public.records` is not yet provisioned in this environment.
            Displaying development fixtures for UI verification.
          </Text>
        </View>
      )}

      {/* Category Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.value;
            return (
              <TouchableOpacity
                key={cat.value}
                style={[styles.tabItem, isSelected && styles.tabItemSelected]}
                onPress={() => setSelectedCategory(cat.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.tabItemText, isSelected && styles.tabItemTextSelected]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content Area */}
      {isLoading && !isRefreshing ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#38BDF8" />
          <Text style={styles.loadingText}>Loading personal records...</Text>
        </View>
      ) : errorMessage && records.length === 0 ? (
        <View style={styles.centerState}>
          <View style={styles.errorIconBox}>
            <Text style={styles.errorIconText}>!</Text>
          </View>
          <Text style={styles.stateTitle}>Unable to Load Records</Text>
          <Text style={styles.stateSubtitle}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchRecords} activeOpacity={0.8}>
            <Text style={styles.retryBtnText}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      ) : records.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.centerState}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#38BDF8"
            />
          }
        >
          <View style={styles.emptyIconBox}>
            <Text style={styles.emptyIconText}>📁</Text>
          </View>
          <Text style={styles.stateTitle}>No Records Found</Text>
          <Text style={styles.stateSubtitle}>
            {selectedCategory === 'all'
              ? 'Your personal vault is empty. Upload your first document to get started.'
              : `No records found in the ${selectedCategory.toUpperCase()} category.`}
          </Text>
          <TouchableOpacity
            style={styles.emptyActionBtn}
            onPress={onNavigateToUpload}
            activeOpacity={0.8}
          >
            <Text style={styles.emptyActionBtnText}>Upload Document</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#38BDF8"
            />
          }
        >
          <View style={styles.countSummary}>
            <Text style={styles.countText}>
              Showing {records.length} {records.length === 1 ? 'record' : 'records'}
            </Text>
          </View>

          {records.map((record) => (
            <TouchableOpacity
              key={record.id}
              style={styles.recordCard}
              onPress={() => onSelectRecord(record.id)}
              activeOpacity={0.7}
            >
              <View style={styles.cardTopRow}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {record.category.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.fileSizeText}>{formatFileSize(record.file_size)}</Text>
              </View>

              <Text style={styles.recordTitle}>{record.title}</Text>
              <Text style={styles.docType}>Type: {record.document_type}</Text>

              {record.issuer_name && (
                <Text style={styles.issuerText}>Issuer: {record.issuer_name}</Text>
              )}

              {/* Status Badges */}
              <View style={styles.badgeRow}>
                <StatusBadge type="processing" status={record.status} />
                <StatusBadge
                  type="external_verification"
                  status={record.external_verification_status}
                />
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.dateInfo}>
                  Updated: {formatDate(record.updated_at || record.created_at)}
                </Text>
                <Text style={styles.inspectText}>Inspect →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  addHeaderBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  backendNoticeBox: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backendNoticeTitle: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  backendNoticeText: {
    color: '#92400E',
    fontSize: 11,
    lineHeight: 15,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  tabScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tabItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabItemSelected: {
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
  },
  tabItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  tabItemTextSelected: {
    color: '#0284C7',
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  countSummary: {
    marginBottom: 12,
  },
  countText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.5,
  },
  fileSizeText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  docType: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 4,
  },
  issuerText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    marginTop: 6,
  },
  dateInfo: {
    fontSize: 11,
    color: '#94A3B8',
  },
  inspectText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 16,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 6,
  },
  stateSubtitle: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
    marginBottom: 20,
  },
  errorIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIconText: {
    color: '#DC2626',
    fontSize: 22,
    fontWeight: '700',
  },
  retryBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconText: {
    fontSize: 24,
  },
  emptyActionBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
