import { useState, useRef } from "react";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../lib/firebase";

const ImageUpload = ({ onImageUpload, currentImageUrl = null, disabled = false }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `products/${timestamp}_${file.name}`;
      const storageRef = ref(storage, filename);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update preview
      setPreviewUrl(downloadURL);
      
      // Call parent callback
      onImageUpload(downloadURL);

    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (previewUrl && previewUrl !== currentImageUrl) {
      try {
        // Delete from storage if it's a new upload
        const imageRef = ref(storage, previewUrl);
        await deleteObject(imageRef);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    
    setPreviewUrl(null);
    onImageUpload(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: "0.5rem",
          fontSize: "0.9rem",
          fontWeight: 600,
          color: "#374151",
        }}
      >
        Product Image
      </label>
      
      <div
        style={{
          border: "2px dashed rgba(226, 232, 240, 0.8)",
          borderRadius: "12px",
          padding: "1rem",
          textAlign: "center",
          background: "rgba(248, 250, 252, 0.5)",
          transition: "all 120ms ease",
          position: "relative"
        }}
      >
        {previewUrl ? (
          <div style={{ position: "relative" }}>
            <img
              src={previewUrl}
              alt="Product preview"
              style={{
                maxWidth: "100%",
                maxHeight: "200px",
                borderRadius: "8px",
                objectFit: "cover",
              }}
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={disabled || uploading}
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: "none",
                background: "rgba(239, 68, 68, 0.9)",
                color: "white",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>
        ) : (
          <div
            onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
            style={{
              cursor: disabled || uploading ? "not-allowed" : "pointer",
              padding: "1rem"
            }}
          >
            <div
              style={{
                fontSize: "2rem",
                color: "#cbd5e1",
                marginBottom: "0.5rem",
              }}
            >
              📷
            </div>
            <p
              style={{
                margin: "0 0 1rem 0",
                fontSize: "0.9rem",
                color: "#64748b",
              }}
            >
              {uploading ? "Uploading..." : "Click to upload product image"}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "0.8rem",
                color: "#9ca3af",
              }}
            >
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          style={{
            display: "none"
          }}
        />
      </div>
      
      {!previewUrl && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          style={{
            width: "100%",
            marginTop: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            background: "rgba(255, 255, 255, 0.9)",
            color: "#64748b",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: disabled || uploading ? "not-allowed" : "pointer",
            opacity: disabled || uploading ? 0.6 : 1,
          }}
        >
          {uploading ? "Uploading..." : "Choose Image"}
        </button>
      )}
    </div>
  );
};

export default ImageUpload;