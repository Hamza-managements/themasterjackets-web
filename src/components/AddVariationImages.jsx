import React, { useState } from "react";
import axios from "axios";
import { Trash } from "lucide-react";

function VariationImageUploader({ currentVariation, setCurrentVariation }) {
    const [uploading, setUploading] = useState(false);

    const handleMultipleUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setUploading(true);

        try {
            const uploadPromises = files.map(async (file) => {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("upload_preset", "ThemasterjacketsFrontend");

                const res = await axios.post(
                    "https://api.cloudinary.com/v1_1/dekf5dyng/upload", 
                    formData
                );
                return res.data.secure_url;
            });

            const uploadedUrls = await Promise.all(uploadPromises);

            setCurrentVariation((prev) => ({
                ...prev,
                productImages: [...prev.productImages, ...uploadedUrls],
            }));
        } catch (error) {
            console.error("Upload error:", error);
            alert("Some images failed to upload.");
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index) => {
        setCurrentVariation((prev) => ({
            ...prev,
            productImages: prev.productImages.filter((_, i) => i !== index),
        }));
    };

    return (
        <div className="form-group mt-4">
            <label className="block font-medium mb-2 text-gray-800">
                Variation Images *
            </label>

            {/* Upload input */}
            <div className="border-2 border-dashed border-blue-400 p-6 rounded-lg text-center cursor-pointer hover:bg-gray-50 transition">
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleMultipleUpload}
                    className="hidden"
                    id="variationImageUpload"
                />
                <label htmlFor="variationImageUpload" className="cursor-pointer">
                    <span className="text-blue-600 font-medium">Click to upload</span>
                </label>
                {uploading && <p className="text-sm text-blue-500 mt-2">Uploading...</p>}
            </div>

            {/* Previews */}
            {currentVariation.productImages?.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                    {currentVariation.productImages.map((url, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={url}
                                alt={`Variation ${index}`}
                                className="w-full h-32 object-cover rounded-lg border"
                            />
                            <button
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-white p-1 rounded-full shadow opacity-0 
                group-hover:opacity-100 transition z-20 hover:scale-110"
                            >
                                <Trash size={14} color="red" />
                            </button>

                            {index === 0 && (
                                <span className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                                    Main
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default VariationImageUploader;
