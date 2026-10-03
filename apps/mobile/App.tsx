import React, { useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  RecordCategory,
  AiIntentResponse,
  RequirementProfile,
  MatchedRequirementItem,
  MissingRequirementItem,
  AttentionNeededRequirementItem,
} from '@lifepass/shared';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LandingScreen } from './src/screens/LandingScreen';
import { PhoneEntryScreen } from './src/screens/PhoneEntryScreen';
import { OtpVerifyScreen } from './src/screens/OtpVerifyScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { MyRecordsScreen } from './src/screens/MyRecordsScreen';
import { UploadRecordScreen } from './src/screens/UploadRecordScreen';
import { RecordDetailScreen } from './src/screens/RecordDetailScreen';
import { AuthenticatedCitizenScreen } from './src/screens/AuthenticatedCitizenScreen';
import { AiTaskEntryScreen } from './src/screens/AiTaskEntryScreen';
import { InterpretedTaskScreen } from './src/screens/InterpretedTaskScreen';
import { RequirementProfileScreen } from './src/screens/RequirementProfileScreen';
import { MatchingResultsScreen } from './src/screens/MatchingResultsScreen';
import { ReviewShareScreen } from './src/screens/ReviewShareScreen';
import { ConsentScreen } from './src/screens/ConsentScreen';
import { RequestsScreen } from './src/screens/RequestsScreen';
import { RequestDetailScreen } from './src/screens/RequestDetailScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { RequestUiStatus } from './src/services/requestService';
import { EDUCATION_LOAN_REQUIREMENT_PROFILE_FIXTURE } from './src/services/fixtures/requirementFixtures';
import { EDUCATION_LOAN_MATCHING_FIXTURE } from './src/services/fixtures/matchingFixtures';

import { BottomNavBar, NavTab } from './src/components/BottomNavBar';

type AuthenticatedView =
  | 'home'
  | 'records'
  | 'upload'
  | 'record_detail'
  | 'profile'
  | 'ai_task_entry'
  | 'interpreted_task'
  | 'requirement_profile'
  | 'matching_results'
  | 'review_share'
  | 'consent'
  | 'requests'
  | 'request_detail'
  | 'notifications';

const MainNavigator: React.FC = () => {
  const { session, isLoading, isDemoMode, enterDemoMode, exitDemoMode } = useAuth();
  const [currentStep, setCurrentStep] = useState<'landing' | 'phone' | 'otp'>('landing');
  const [currentView, setCurrentView] = useState<AuthenticatedView>('home');
  const [selectedCategory, setSelectedCategory] = useState<RecordCategory | undefined>(undefined);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  // Phase 3 AI Intent & Requirement Knowledge state
  const [intentResult, setIntentResult] = useState<AiIntentResponse | null>(null);
  const [originalGoal, setOriginalGoal] = useState<string>('');
  const [aiGoalPrompt, setAiGoalPrompt] = useState<string>('I want to apply for an education loan');
  const [requirementProfile, setRequirementProfile] = useState<RequirementProfile | null>(null);

  // Review & Sharing + Consent state
  const [matchedForSharing, setMatchedForSharing] = useState<MatchedRequirementItem[]>([]);
  const [missingForSharing, setMissingForSharing] = useState<MissingRequirementItem[]>([]);
  const [attentionForSharing, setAttentionForSharing] = useState<AttentionNeededRequirementItem[]>([]);
  const [selectedRecordIdsForSharing, setSelectedRecordIdsForSharing] = useState<string[]>([]);

  // Requests and Notifications state
  const [selectedRequestId, setSelectedRequestId] = useState<string>('req-edu-001');
  const [requestsFilter, setRequestsFilter] = useState<RequestUiStatus>('pending');

  const getNavTab = (view: AuthenticatedView): NavTab => {
    switch (view) {
      case 'home':
        return 'home';
      case 'records':
      case 'upload':
      case 'record_detail':
        return 'records';
      case 'ai_task_entry':
      case 'interpreted_task':
      case 'requirement_profile':
        return 'ask';
      case 'requests':
      case 'request_detail':
      case 'matching_results':
      case 'review_share':
      case 'consent':
        return 'shared';
      case 'profile':
        return 'profile';
      case 'notifications':
        return 'home';
      default:
        return 'home';
    }
  };

  const handleNavSelect = (tab: NavTab) => {
    switch (tab) {
      case 'home':
        setCurrentView('home');
        break;
      case 'records':
        setCurrentView('records');
        break;
      case 'ask':
        setCurrentView('ai_task_entry');
        break;
      case 'shared':
        setCurrentView('requests');
        break;
      case 'profile':
        setCurrentView('profile');
        break;
    }
  };

  // Loading / Session Restoration State
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={styles.loadingText}>Restoring LifePass Security Session...</Text>
      </View>
    );
  }

  // Authenticated State: Citizen Record Vault & Knowledge Navigation
  if (session) {
    return (
      <View style={styles.appContainer}>
        <StatusBar style="dark" />
        {isDemoMode && (
          <View style={styles.demoBanner}>
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>DEMO MODE</Text>
            </View>
            <Text style={styles.demoBannerText}>
              Synthetic Citizen Records • No real documents
            </Text>
            <TouchableOpacity
              onPress={exitDemoMode}
              style={styles.demoExitBtn}
              activeOpacity={0.7}
              accessibilityLabel="Exit Demo"
            >
              <Text style={styles.demoExitBtnText}>Exit</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.screenContainer}>
          {currentView === 'home' && (
            <HomeScreen
              onNavigateToRecords={(cat) => {
                setSelectedCategory(cat);
                setCurrentView('records');
              }}
              onNavigateToUpload={() => setCurrentView('upload')}
              onNavigateToProfile={() => setCurrentView('profile')}
              onNavigateToAiTask={(goal) => {
                if (goal) setAiGoalPrompt(goal);
                setCurrentView('ai_task_entry');
              }}
              onNavigateToReviewShare={() => {
                if (requirementProfile) {
                  setCurrentView('matching_results');
                } else {
                  setRequirementProfile(EDUCATION_LOAN_REQUIREMENT_PROFILE_FIXTURE);
                  setMatchedForSharing(EDUCATION_LOAN_MATCHING_FIXTURE.matched);
                  setMissingForSharing(EDUCATION_LOAN_MATCHING_FIXTURE.missing);
                  setAttentionForSharing(EDUCATION_LOAN_MATCHING_FIXTURE.attention_needed);
                  setCurrentView('matching_results');
                }
              }}
              onNavigateToNotifications={() => setCurrentView('notifications')}
              onNavigateToRequests={() => {
                setRequestsFilter('pending');
                setCurrentView('requests');
              }}
              onNavigateToRequestDetail={(reqId) => {
                setSelectedRequestId(reqId);
                setCurrentView('request_detail');
              }}
            />
          )}

          {currentView === 'requests' && (
            <RequestsScreen
              initialStatus={requestsFilter}
              onSelectRequest={(id) => {
                setSelectedRequestId(id);
                setCurrentView('request_detail');
              }}
              onBackToHome={() => setCurrentView('home')}
            />
          )}

          {currentView === 'request_detail' && (
            <RequestDetailScreen
              requestId={selectedRequestId}
              onReviewAndShare={(_req) => {
                setRequirementProfile(EDUCATION_LOAN_REQUIREMENT_PROFILE_FIXTURE);
                setMatchedForSharing(EDUCATION_LOAN_MATCHING_FIXTURE.matched);
                setMissingForSharing(EDUCATION_LOAN_MATCHING_FIXTURE.missing);
                setAttentionForSharing(EDUCATION_LOAN_MATCHING_FIXTURE.attention_needed);
                setCurrentView('review_share');
              }}
              onBackToRequests={() => setCurrentView('requests')}
            />
          )}

          {currentView === 'notifications' && (
            <NotificationsScreen
              onSelectRequest={(reqId) => {
                setSelectedRequestId(reqId);
                setCurrentView('request_detail');
              }}
              onBackToHome={() => setCurrentView('home')}
            />
          )}

          {currentView === 'ai_task_entry' && (
            <AiTaskEntryScreen
              initialGoal={aiGoalPrompt}
              onTaskInterpreted={(result, goal) => {
                setIntentResult(result);
                setOriginalGoal(goal);
                setCurrentView('interpreted_task');
              }}
              onBackToHome={() => setCurrentView('home')}
            />
          )}

          {currentView === 'interpreted_task' && intentResult && (
            <InterpretedTaskScreen
              intentResult={intentResult}
              originalGoal={originalGoal}
              onViewRequirements={(profile) => {
                setRequirementProfile(profile);
                setCurrentView('requirement_profile');
              }}
              onEditGoal={() => setCurrentView('ai_task_entry')}
              onBackToHome={() => setCurrentView('home')}
            />
          )}

          {currentView === 'requirement_profile' && requirementProfile && (
            <RequirementProfileScreen
              profile={requirementProfile}
              onCheckReadiness={() => setCurrentView('matching_results')}
              onBackToTask={() => setCurrentView('interpreted_task')}
              onBackToHome={() => setCurrentView('home')}
              onStartNewGoal={() => setCurrentView('ai_task_entry')}
            />
          )}

          {currentView === 'matching_results' && requirementProfile && (
            <MatchingResultsScreen
              requirementProfile={requirementProfile}
              onNavigateToUpload={(category) => {
                setSelectedCategory(category);
                setCurrentView('upload');
              }}
              onNavigateToReviewShare={(matched, missing, attention) => {
                setMatchedForSharing(matched);
                setMissingForSharing(missing);
                setAttentionForSharing(attention);
                setCurrentView('review_share');
              }}
              onBackToRequirements={() => setCurrentView('requirement_profile')}
              onBackToHome={() => setCurrentView('home')}
            />
          )}

          {currentView === 'review_share' && requirementProfile && (
            <ReviewShareScreen
              requirementProfile={requirementProfile}
              matchedRecords={matchedForSharing}
              missingRequirements={missingForSharing}
              attentionNeeded={attentionForSharing}
              onProceedToConsent={(selectedIds) => {
                setSelectedRecordIdsForSharing(selectedIds);
                setCurrentView('consent');
              }}
              onBackToResults={() => {
                if (selectedRequestId) {
                  setCurrentView('request_detail');
                } else {
                  setCurrentView('matching_results');
                }
              }}
            />
          )}

          {currentView === 'consent' && requirementProfile && (
            <ConsentScreen
              requestId={selectedRequestId}
              selectedRecordIds={selectedRecordIdsForSharing}
              matchedRecords={matchedForSharing}
              purposeTitle={requirementProfile.name}
              onConsentCompleted={(_result) => {
                // Consent completed callback
              }}
              onBackToReview={() => setCurrentView('review_share')}
              onReturnToHome={() => setCurrentView('home')}
            />
          )}

          {currentView === 'records' && (
            <MyRecordsScreen
              initialCategory={selectedCategory}
              onSelectRecord={(id) => {
                setSelectedRecordId(id);
                setCurrentView('record_detail');
              }}
              onNavigateToUpload={() => setCurrentView('upload')}
              onBackToHome={() => setCurrentView('home')}
            />
          )}

          {currentView === 'upload' && (
            <UploadRecordScreen
              onUploadSuccess={(createdRecord) => {
                setSelectedRecordId(createdRecord.id);
                setCurrentView('record_detail');
              }}
              onCancel={() => {
                if (requirementProfile) {
                  setCurrentView('matching_results');
                } else {
                  setCurrentView('records');
                }
              }}
            />
          )}

          {currentView === 'record_detail' && selectedRecordId && (
            <RecordDetailScreen
              recordId={selectedRecordId}
              onBackToRecords={() => setCurrentView('records')}
              onRecordDeleted={() => setCurrentView('records')}
            />
          )}

          {currentView === 'profile' && (
            <AuthenticatedCitizenScreen onBackToHome={() => setCurrentView('home')} />
          )}
        </View>

        <BottomNavBar
          currentTab={getNavTab(currentView)}
          onSelectTab={handleNavSelect}
        />
      </View>
    );
  }

  // Unauthenticated: Landing, Phone Entry or OTP Verification
  return (
    <View style={styles.appContainer}>
      <StatusBar style="dark" />
      {currentStep === 'landing' ? (
        <LandingScreen
          onTryDemo={enterDemoMode}
          onLogin={() => setCurrentStep('phone')}
          onSignUp={() => setCurrentStep('phone')}
        />
      ) : currentStep === 'phone' ? (
        <PhoneEntryScreen
          onOtpSent={() => setCurrentStep('otp')}
          onBackToLanding={() => setCurrentStep('landing')}
          onTryDemo={enterDemoMode}
        />
      ) : (
        <OtpVerifyScreen onBackToPhone={() => setCurrentStep('phone')} />
      )}
    </View>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  screenContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: '#64748B',
    fontSize: 13,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  demoBadge: {
    backgroundColor: '#F59E0B',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 6,
  },
  demoBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  demoBannerText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
    color: '#92400E',
  },
  demoExitBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 4,
    marginLeft: 6,
  },
  demoExitBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
});
