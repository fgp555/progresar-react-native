import useAuthStore from "@/src/store/useAuthStore";
import { apiBaseURL } from "@/src/utils/varGlobal";
import { CameraView } from "expo-camera";
import { useRef, useState } from "react";

export function useCameraHandler() {
  const ref = useRef<CameraView>(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();

  const takePicture = async (): Promise<string | null> => {
    if (ref.current) {
      const photo = await ref.current.takePictureAsync();
      if (photo) {
        // Add a null check here
        return photo.uri;
      }
    }
    return null;
  };

  const uploadImage = async (formDataValues: any) => {
    if (!formDataValues.fileUri) return;

    const formData = new FormData();
    formData.append("file", { uri: formDataValues.fileUri, name: "image.jpg", type: "image/jpeg" } as any);

    Object.entries(formDataValues).forEach(([key, value]) => {
      if (key !== "fileUri") {
        formData.append(key, value as string);
      }
    });

    try {
      setLoading(true);
      const response = await fetch(`${apiBaseURL}/api/order/approve`, {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      console.log("Upload Response:", data);
    } catch (error) {
      console.error("Upload Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return { ref, loading, takePicture, uploadImage };
}
