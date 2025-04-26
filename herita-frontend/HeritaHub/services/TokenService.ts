import { jwtDecode } from 'jwt-decode';

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