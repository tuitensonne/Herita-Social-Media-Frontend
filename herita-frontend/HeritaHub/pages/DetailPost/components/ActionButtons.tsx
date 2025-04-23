import React from 'react';
import { View, StyleSheet } from 'react-native';
import IconTextButton from './IconTextButton'; // Import nút tái sử dụng
import { colors } from '../../../constants/color';
import { dimens } from '../../../constants/dimens';

interface ActionButtonsProps {
  onLikePress: () => void;
  onSharePress: () => void;
  isLiked?: boolean; // Optional: để đổi màu nút Like nếu đã like
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onLikePress, onSharePress, isLiked }) => {
  return (
    <View style={styles.container}>
      <IconTextButton
        iconName={isLiked ? "thumb-up" : "thumb-up-outline"} // Thay icon nếu đã like
        text="Like"
        onPress={onLikePress}
        style={styles.button}
        iconColor={isLiked ? colors.primary : colors.iconGray} // Đổi màu icon/text nếu đã like
        textColor={isLiked ? colors.primary : colors.textSecondary}
      />
      <IconTextButton
        iconName="share-outline" // Hoặc 'export-variant'
        text="Share"
        onPress={onSharePress}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around', 
    alignItems: 'center',
    paddingVertical: dimens.paddingSmall,
    paddingHorizontal: dimens.paddingMedium,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white, 
    marginTop: dimens.paddingMedium,
  },
  button: {
    flex: 1, 
    marginHorizontal: dimens.paddingSmall, 
  },
});

export default ActionButtons;