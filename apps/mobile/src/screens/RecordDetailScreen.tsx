import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';
import { RecordItem } from '@lifepass/shared';
import { getRecord, getSignedDocumentUrl, deleteRecord } from '../services/recordService';
import { StatusBadge } from '../components/StatusBadge';

interface RecordDetailScreenProps {
  recordId: string;
  onBackToRecords: () => void;
  onRecordDeleted: () => void;
}

export const RecordDetailScreen: React.FC<RecordDetailScreenProps> = ({
  recordId,
  onBackToRecords,
  onRecordDeleted,
}) => {
  const [record, setRecord] = useState<RecordItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isGeneratingUrl, setIsGeneratingUrl] = useState<boolean>(false);
  const [signedUrlInfo, setSignedUrlInfo] = useState<{
    url: string;
    expiresAt: Date;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchDetail = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await getRecord(recordId);

      if (mounted) {
        setIsLoading(false);
        if (res.data) {
          setRecord(res.data);
        } else {
          setErrorMessage(res.error || 'Record could not be found.');
        }
      }
    };

    fetchDetail();
    return () => {
      mounted = false;
    };
  }, [recordId]);

  // Request temporary signed URL (never permanent public URL)
  const handleViewDocument = async () => {
    if (!record) return;
    setIsGeneratingUrl(true);

    const res = await getSignedDocumentUrl(record.storage_path, 300); // 5 min expiry
    setIsGeneratingUrl(false);

    if (res.signedUrl) {
      const expiresAt = new Date(Date.now() + 300 * 1000);
      setSignedUrlInfo({ url: res.signedUrl, expiresAt });

      try {
        const canOpen = await Linking.canOpenURL(res.signedUrl);
        if (canOpen) {
          await Linking.openURL(res.signedUrl);
        } else {
          Alert.alert('Temporary Signed URL Generated', 'URL is ready for authorized viewing.');
        }
      } catch (err: any) {
        Alert.alert('View Document', 'Document signed URL generated successfully.');
      }
    } else {
      Alert.alert(
        'Document Access Unavailable',
        res.error || 'Could not generate signed access URL. Ensure private storage is configured.'
      );
    }
  };

  // Delete Record with confirmation
  const handleDelete = () => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to remove this record from your vault? This will permanently delete the metadata and private storage file.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!record) return;
            setIsDeleting(true);
            const res = await deleteRecord(record.id, record.storage_path);
            setIsDeleting(false);

            if (res.success) {
              Alert.alert('Record Deleted', 'The document has been removed from your vault.', [
                { text: 'OK', onPress: onRecordDeleted },
              ]);
            } else {
              Alert.alert('Delete Failed', res.error || 'Failed to remove record.');
            }
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return 'Not recorded';
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
        <TouchableOpacity style={styles.backBtn} onPress={onBackToRecords} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>← My Records</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Record Details</Text>
        <TouchableOpacity
          style={styles.deleteHeaderBtn}
          onPress={handleDelete}
          disabled={isDeleting || !record}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteHeaderBtnText}>{isDeleting ? 'Deleting...' : 'Delete'}</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#38BDF8" />
          <Text style={styles.loadingText}>Retrieving record details...</Text>
        </View>
      ) : errorMessage || !record ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{errorMessage || 'Record not found.'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={onBackToRecords}>
            <Text style={styles.backButtonText}>Return to Records</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          {/* Main Title Card */}
          <View style={styles.card}>
            <View style={styles.badgeRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {record.category.toUpperCase()}
                </Text>
              </View>
              {Boolean(record.metadata?.is_dev_fixture) && (
                <View style={styles.devBadge}>
                  <Text style={styles.devBadgeText}>DEV FIXTURE</Text>
                </View>
              )}

            </View>

            <Text style={styles.recordTitle}>{record.title}</Text>
            <Text style={styles.docType}>Type: {record.document_type}</Text>

            {/* Status Section */}
            <View style={styles.statusSection}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>LifePass Processing Status:</Text>
                <StatusBadge type="processing" status={record.status} />
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>External Verification Status:</Text>
                <StatusBadge
                  type="external_verification"
                  status={record.external_verification_status}
                />
              </View>
            </View>

            {/* Honest Verification Notice */}
            <View style={styles.noticeBox}>
              <Text style={styles.noticeTitle}>Verification Integrity Notice</Text>
              <Text style={styles.noticeText}>
                LifePass processing status indicates whether text and metadata have been parsed. It does NOT claim that the document is authentic or verified by an external authority.
              </Text>
            </View>
          </View>

          {/* Secure Document Access Action */}
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Private Storage Access</Text>
            <Text style={styles.sectionSubtitle}>
              Documents are stored in a private bucket. Access is granted exclusively through short-lived signed URLs.
            </Text>

            <TouchableOpacity
              style={[styles.viewDocBtn, isGeneratingUrl && styles.viewDocBtnDisabled]}
              onPress={handleViewDocument}
              disabled={isGeneratingUrl}
              activeOpacity={0.8}
            >
              {isGeneratingUrl ? (
                <ActivityIndicator color="#090D16" size="small" />
              ) : (
                <Text style={styles.viewDocBtnText}>Generate Signed Access & View Document</Text>
              )}
            </TouchableOpacity>

            {signedUrlInfo && (
              <View style={styles.signedUrlBox}>
                <Text style={styles.signedUrlTitle}>Signed Session Active</Text>
                <Text style={styles.signedUrlText}>
                  Valid until: {signedUrlInfo.expiresAt.toLocaleTimeString()} (5 minutes)
                </Text>
              </View>
            )}
          </View>

          {/* Metadata Table */}
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Document Metadata</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Issuer</Text>
              <Text style={styles.metaValue}>{record.issuer_name || 'Not specified'}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Issue Date</Text>
              <Text style={styles.metaValue}>{formatDate(record.issue_date)}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Expiry Date</Text>
              <Text style={styles.metaValue}>{formatDate(record.expiry_date)}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Source Type</Text>
              <Text style={styles.metaValue}>{record.source_type || 'upload'}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>MIME Type</Text>
              <Text style={styles.metaValueMono}>{record.mime_type}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>File Size</Text>
              <Text style={styles.metaValue}>{formatFileSize(record.file_size)}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Storage Path</Text>
              <Text style={styles.metaValueMono} numberOfLines={1} ellipsizeMode="middle">
                {record.storage_path}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Record ID</Text>
              <Text style={styles.metaValueMono} numberOfLines={1} ellipsizeMode="middle">
                {record.id}
              </Text>
            </View>

            <View style={[styles.metaRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.metaLabel}>Last Updated</Text>
              <Text style={styles.metaValue}>{formatDate(record.updated_at || record.created_at)}</Text>
            </View>
          </View>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  backBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  deleteHeaderBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteHeaderBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
  container: {
    padding: 16,
    paddingBottom: 36,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.5,
  },
  devBadge: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  devBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  recordTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  docType: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 16,
  },
  statusSection: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  statusLabel: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  noticeBox: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  noticeTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
    marginBottom: 2,
  },
  noticeText: {
    fontSize: 11,
    color: '#0369A1',
    lineHeight: 15,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 14,
    lineHeight: 15,
  },
  viewDocBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDocBtnDisabled: {
    opacity: 0.6,
  },
  viewDocBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  signedUrlBox: {
    marginTop: 10,
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
  },
  signedUrlTitle: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '700',
  },
  signedUrlText: {
    color: '#166534',
    fontSize: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  metaLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  metaValue: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '500',
  },
  metaValueMono: {
    fontSize: 11,
    color: '#0284C7',
    fontFamily: 'monospace',
    maxWidth: '55%',
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
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
