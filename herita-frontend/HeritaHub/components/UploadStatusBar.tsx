import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet
} from 'react-native';

interface UploadStatusBarProps {
  progress: number; 
  onCompleted: () => void;
}

const UploadStatusBar: React.FC<UploadStatusBarProps> = ({ progress, onCompleted }) => {
  const [status, setStatus] = useState<string>('Đang chuẩn bị...');
  const [percent, setPercent] = useState<number>(0);

  useEffect(() => {
    setPercent(progress);
    
    if (progress === 0) {
      setStatus('Đang chuẩn bị...');
    } else if (progress < 10) {
      setStatus('Đang tạo bài viết...');
    } else if (progress < 100) {
      setStatus('Đang tải lên hình ảnh...');
    } else if (progress === 100) {
      setStatus('Hoàn thành');
      setTimeout(() => {
        onCompleted();
      }, 1000); 
    }
  }, [progress, onCompleted]);

  return (
    <View style={styles.uploadStatusContainer}>
      <View style={styles.uploadStatusContent}>
        <View style={styles.uploadStatusInfo}>
          <Text style={styles.uploadStatusText}>{status}</Text>
          <Text style={styles.uploadProgressText}>{percent}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${percent}%` }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  uploadStatusContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
  },
  uploadStatusContent: {
    width: '100%',
  },
  uploadStatusInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  uploadStatusText: {
    color: 'white',
    fontSize: 14,
  },
  uploadProgressText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1877F2',
  }
});

export default UploadStatusBar;