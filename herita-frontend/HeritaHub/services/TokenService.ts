import { jwtDecode } from 'jwt-decode';
import * as SecureStore from 'expo-secure-store';

let access_token: string = ""

type DecodedToken = {
    sub: string;
    username: string;
    url: string;
    exp: number;
};
  
export const getToken = () => {
    return access_token
} 

export const setToken = (token: string) => {
    access_token = token
}

export const getUserId = () => {
    const decoded = jwtDecode<DecodedToken>(access_token);
    return decoded.sub
}

export const getUsername = () => {
    const decoded = jwtDecode<DecodedToken>(access_token);
    return decoded.username
}

export const getUserUrl = () => {
    const decoded = jwtDecode<DecodedToken>(access_token);
    return decoded.url
}

export const clearTokens = async (): Promise<void> => {
    try {
      // Danh sách các khóa cần xóa
      const keysToRemove = [
        'access_token',
        'refresh_token'
        // Thêm các khóa khác nếu có
      ];
      
      // Xóa từng khóa khỏi SecureStore
      const deletePromises = keysToRemove.map(key => 
        SecureStore.deleteItemAsync(key)
      );
      
      // Chờ tất cả các thao tác xóa hoàn thành
      await Promise.all(deletePromises);
      
      console.log('Đã xóa tất cả thông tin đăng nhập');
    } catch (error) {
      console.error('Lỗi khi xóa thông tin đăng nhập:', error);
      throw error;
    }
};