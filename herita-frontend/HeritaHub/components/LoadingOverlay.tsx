import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingOverlay = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#FF6F20" />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject, // phủ kín phần cha
    backgroundColor: 'rgba(255, 255, 255, 1)', // nền mờ
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // đảm bảo nằm trên các phần khác nếu cần
  },
});

export default LoadingOverlay;
