import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, StyleProp, ViewStyle, TextStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Hoặc icon set khác
import { colors } from '../../../constants/color';
import { dimens } from '../../../constants/dimens';

interface IconTextButtonProps {
  iconName: string;
  text: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  iconColor?: string;
  textColor?: string;
  iconSize?: number;
}

const IconTextButton: React.FC<IconTextButtonProps> = ({
  iconName,
  text,
  onPress,
  style,
  iconColor = colors.iconGray,
  textColor = colors.textSecondary,
  iconSize = 20,
}) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress} activeOpacity={0.7}>
      <Icon name={iconName} size={iconSize} color={iconColor} style={styles.icon} />
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: dimens.paddingSmall,
    paddingHorizontal: dimens.paddingMedium,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: dimens.borderRadius * 3, 
    backgroundColor: colors.white,
  },
  icon: {
    marginRight: dimens.paddingSmall / 2,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default IconTextButton;