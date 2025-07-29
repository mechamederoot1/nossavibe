// Helper functions for story upload functionality
import { apiCall, API_BASE_URL } from "../../config/api";

export interface StoryUploadData {
  content: string;
  media_type: "text" | "image" | "video" | "music" | null;
  media_url?: string;
  duration_hours: number;
  background_color?: string;
  privacy: string;
  overlays?: any[];
}

export const uploadStoryMedia = async (
  file: File,
  userToken: string,
): Promise<string | null> => {
  if (!file) return null;

  console.log("🔥 Uploading story media file:", {
    name: file.name,
    size: file.size,
    type: file.type
  });

  try {
    const formData = new FormData();
    formData.append("file", file);

    // Use the correct media upload endpoint
    const response = await fetch(`${API_BASE_URL}/upload/media`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Media upload successful:", data);
      // The upload endpoint returns file_path which is the URL we need
      return data.file_path || data.url || data.media_url || data.file_url;
    } else {
      const errorText = await response.text();
      console.error("❌ Media upload failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return null;
    }
  } catch (error) {
    console.error("❌ Media upload error:", error);
    return null;
  }
};

export const createStoryWithFile = async (
  content: string,
  mediaFile: File | null,
  storyDuration: number,
  backgroundColor: string,
  privacy: string,
  userToken: string,
): Promise<boolean> => {
  console.log("🔥 Creating story using direct FormData approach...");
  console.log("📋 Story params:", {
    hasContent: !!content,
    hasMediaFile: !!mediaFile,
    mediaFileName: mediaFile?.name,
    mediaFileType: mediaFile?.type,
    storyDuration,
    backgroundColor,
    privacy
  });

  try {
    // Validate required content
    if (!content.trim() && !mediaFile) {
      console.error("❌ Story must have either content or media");
      throw new Error("Story deve ter conteúdo ou mídia");
    }

    // Create FormData for multipart request
    const formData = new FormData();

    // Add text fields
    if (content.trim()) {
      formData.append("content", content.trim());
    }

    formData.append("duration_hours", storyDuration.toString());
    formData.append("background_color", backgroundColor);

    // Add media file if present
    if (mediaFile) {
      formData.append("file", mediaFile);

      // Determine media type based on file
      if (mediaFile.type.startsWith("image/")) {
        formData.append("media_type", "image");
      } else if (mediaFile.type.startsWith("video/")) {
        formData.append("media_type", "video");
      } else if (mediaFile.type.startsWith("audio/")) {
        formData.append("media_type", "audio");
      }
    } else {
      formData.append("media_type", "text");
    }

    console.log("📤 Creating story with FormData...");

    // Use fetch directly to properly handle FormData
    const response = await fetch(`${API_BASE_URL}/stories/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        // Don't set Content-Type - let browser set it with boundary for multipart
      },
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Story created successfully:", result);
      return true;
    } else {
      const errorData = await response.text();
      console.error("❌ Story creation failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });

      // Show user-friendly error message
      if (response.status === 413) {
        throw new Error("Arquivo muito grande! Tente com um arquivo menor.");
      } else if (response.status === 400) {
        throw new Error("Dados inválidos. Verifique se o arquivo é válido.");
      } else if (response.status === 404) {
        throw new Error("Endpoint de stories não encontrado. Verifique se o backend está rodando.");
      } else {
        throw new Error(`Erro ao criar story (${response.status}). Tente novamente.`);
      }
    }
  } catch (error) {
    console.error("❌ Story creation error:", error);
    throw error;
  }
};
