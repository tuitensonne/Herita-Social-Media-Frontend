import { jwtDecode } from 'jwt-decode';

let access_token: string = ""

type DecodedToken = {
    sub: string;
    email: string;
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