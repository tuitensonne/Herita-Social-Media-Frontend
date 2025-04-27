import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const dimens = {
  paddingSmall: 8,
  paddingMedium: 16,
  paddingLarge: 24,
  borderRadius: 8,
  avatarSize: 40,
  screenWidth: width,
  screenHeight: height,
};