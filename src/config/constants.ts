import Constants from "expo-constants";

export const androidVersion = Constants.expoConfig?.version;

export const backendDomain = process.env.EXPO_PUBLIC_API_DOMAIN || "frankgp.com"; // back.fgp.one
export const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL || `https://${backendDomain}`;
export const IS_DEVELOPMENT = process.env.EXPO_PUBLIC_IS_DEVELOPMENT;

export const logoBusinessImg = "@/src/assets/images/logo-business.png";
export const playStoreUrl = `https://play.google.com/store/apps/details?id=com.systered.progresar`;
export const iconUserUrl = "https://i.postimg.cc/T3PVPkLH/icon-user.webp";

console.log("🟢 apiBaseURL", baseURL);
console.log("🟢 playStoreUrl", playStoreUrl);
console.log("🟢 IS_DEVELOPMENT", IS_DEVELOPMENT);
