import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors } from '../theme/theme';

interface LifePassBrandProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const LifePassBrand: React.FC<LifePassBrandProps> = ({
  size = 'md',
  showTagline = false,
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const markSize = isSm ? 18 : isLg ? 28 : 22;
  const textSize = isSm ? 16 : isLg ? 22 : 18;

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        {/* Stylized LifePass Leaf / Wings Emblem */}
        <View style={[styles.emblemContainer, { width: markSize, height: markSize }]}>
          <View style={[styles.leafPrimary, { width: markSize * 0.7, height: markSize }]} />
          <View style={[styles.leafAccent, { width: markSize * 0.7, height: markSize }]} />
        </View>

        {/* Brand Text */}
        <View style={styles.textRow}>
          <Text style={[styles.brandName, { fontSize: textSize }]}>LifePass</Text>
          <Text style={[styles.brandAi, { fontSize: textSize }]}> AI</Text>
        </View>
      </View>

      {showTagline && (
        <Text style={styles.tagline}>
          One Life. Verified Records. For Every Next Step.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emblemContainer: {
    position: 'relative',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leafPrimary: {
    position: 'absolute',
    left: 0,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 2,
    borderTopRightRadius: 4,
    opacity: 0.95,
  },
  leafAccent: {
    position: 'absolute',
    right: 0,
    backgroundColor: colors.accentGreen,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 2,
    borderTopLeftRadius: 4,
    opacity: 0.85,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandName: {
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  brandAi: {
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.4,
  },
  tagline: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
});
