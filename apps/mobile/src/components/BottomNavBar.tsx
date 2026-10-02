import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../theme/theme';

export type NavTab = 'home' | 'records' | 'ask' | 'shared' | 'profile';

interface BottomNavBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentTab, onSelectTab }) => {
  return (
    <View style={styles.navBarContainer}>
      {/* Home Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onSelectTab('home')}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabIcon, currentTab === 'home' && styles.tabIconActive]}>🏠</Text>
        <Text style={[styles.tabLabel, currentTab === 'home' && styles.tabLabelActive]}>Home</Text>
      </TouchableOpacity>

      {/* My Records Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onSelectTab('records')}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabIcon, currentTab === 'records' && styles.tabIconActive]}>📁</Text>
        <Text style={[styles.tabLabel, currentTab === 'records' && styles.tabLabelActive]}>My Records</Text>
      </TouchableOpacity>

      {/* Ask LifePass Central Action Tab */}
      <TouchableOpacity
        style={styles.centerActionWrap}
        onPress={() => onSelectTab('ask')}
        activeOpacity={0.85}
        accessibilityLabel="Ask LifePass"
      >
        <View style={styles.centerActionButton}>
          <Text style={styles.centerActionIcon}>✨</Text>
        </View>
        <Text style={styles.centerActionLabel}>Ask LifePass</Text>
      </TouchableOpacity>

      {/* Shared / Requests Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onSelectTab('shared')}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabIcon, currentTab === 'shared' && styles.tabIconActive]}>👥</Text>
        <Text style={[styles.tabLabel, currentTab === 'shared' && styles.tabLabelActive]}>Requests</Text>
      </TouchableOpacity>

      {/* Profile Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onSelectTab('profile')}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabIcon, currentTab === 'profile' && styles.tabIconActive]}>👤</Text>
        <Text style={[styles.tabLabel, currentTab === 'profile' && styles.tabLabelActive]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navBarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.65,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabLabelActive: {
    fontWeight: '700',
    color: colors.primary,
  },
  centerActionWrap: {
    flex: 1.1,
    alignItems: 'center',
    marginTop: -22,
  },
  centerActionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 2,
  },
  centerActionIcon: {
    fontSize: 22,
    color: colors.textInverse,
  },
  centerActionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
});
