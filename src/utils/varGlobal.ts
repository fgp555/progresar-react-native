import Constants from "expo-constants";

export const androidVersion = Constants.expoConfig?.version;

export const apiDomain = process.env.EXPO_PUBLIC_API_DOMAIN || "dev.appsystered.com"; // back.fgp.one
export const apiBaseURL = process.env.EXPO_PUBLIC_API_BASE_URL || `https://${apiDomain}`;
export const IS_DEVELOPMENT = process.env.EXPO_PUBLIC_IS_DEVELOPMENT;

export const logoBusinessImg = "https://i.postimg.cc/Zn1WqNzG/Transpa-Servic-Logo.webp";
export const playStoreUrl = `https://play.google.com/store/apps/details?id=com.systered.progresar`;

console.log("apiBaseURL", apiBaseURL);
console.log("IS_DEVELOPMENT", IS_DEVELOPMENT);
console.log("playStoreUrl", playStoreUrl);
