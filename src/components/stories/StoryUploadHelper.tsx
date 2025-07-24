// Helper functions for story upload functionality
import { apiCall, API_BASE_URL } from "../../config/api";

export interface StoryUploadData {
  content: string;
  media_type: "text" | "photo" | "video" | "music" | null;
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
  console.log("🔥 Creating story with enhanced approach...");
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
    let mediaUrl: string | null = null;
    let mediaType: "text" | "photo" | "video" | "music" | null = "text";

    // If there's a media file, upload it first
    if (mediaFile) {
      console.log("📤 Uploading media file...");

      // Upload the media file first
      mediaUrl = await uploadStoryMedia(mediaFile, userToken);

      if (!mediaUrl) {
        console.error("❌ Failed to upload media file");
        throw new Error("Erro ao fazer upload da mídia. Tente novamente.");
      }

      // Determine media type based on file
      if (mediaFile.type.startsWith("image/")) {
        mediaType = "photo";
      } else if (mediaFile.type.startsWith("video/")) {
        mediaType = "video";
      } else if (mediaFile.type.startsWith("audio/")) {
        mediaType = "music";
      }

      console.log("✅ Media uploaded successfully:", mediaUrl);
    }

    // Validate required content
    if (!content.trim() && !mediaUrl) {
      console.error("❌ Story must have either content or media");
      console.log("📋 Validation failed:", { content: content.length, mediaUrl: !!mediaUrl });
      throw new Error("Story deve ter conteúdo ou mídia");
    }

    // Ensure background color is safe for database
    const safeBackgroundColor = backgroundColor.length > 255 
      ? backgroundColor.substring(0, 255) 
      : backgroundColor;

    // Create story payload
    const payload: StoryUploadData = {
      content: content || "",
      media_type: mediaType,
      media_url: mediaUrl,
      duration_hours: storyDuration,
      background_color: safeBackgroundColor,
      privacy,
      overlays: [],
    };

    console.log("📤 Creating story with payload:", {
      ...payload,
      media_url: payload.media_url ? `${payload.media_url.substring(0, 50)}...` : null // Truncate for logging
    });

    const response = await apiCall("/stories/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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
      } else {
        throw new Error("Erro ao criar story. Tente novamente.");
      }

      return false;
    }
  } catch (error) {
    console.error("❌ Story creation error:", error);
    throw error;
  }
};
