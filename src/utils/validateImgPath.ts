// https://i.postimg.cc/6p1d4dC6/icon-operator.webp
// https://i.postimg.cc/T3PVPkLH/icon-user.webp

import { baseURL } from "../config/constants";


// Validar y obtener la imagen del operador o usuario
export const validateImgPath = (image: string, imgDefault: string) => {
  if (!image) {
    return imgDefault; // Imagen por defecto
  }
  if (image.startsWith("http") || image.startsWith("https")) {
    return image; // La ruta ya es absoluta
  }
  return `${baseURL}/${image}`;
};
