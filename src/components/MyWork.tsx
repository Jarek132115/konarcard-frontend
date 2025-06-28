import React, { useState } from "react";
import { useCreateWorks } from "../hooks/useCreateWork";

const UploadImage = ({
  onImageSelect,
  image_url,
}: {
  onImageSelect: (file: File) => void;
  image_url?: string;
}) => {
  const handleClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onImageSelect(file);
    };
    input.click();
  };

  return (
    <div
      className="w-full shadow-md overflow-hidden bg-gray-200 flex items-end justify-end rounded-md h-[100px] cursor-pointer"
      onClick={handleClick}
    >
      {image_url ? (
        <img
          src={image_url}
          alt="Selected work"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full bg-white p-2 flex items-center justify-center">
          <svg
            width="16"
            height="15"
            viewBox="0 0 16 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.06143 1.5C5.7626 1.5 5.48955 1.65937 5.30205 1.94062L4.81455 2.7H2.1333C1.30596 2.7 0.633301 3.37266 0.633301 4.2V11.4C0.633301 12.2273 1.30596 12.9 2.1333 12.9H13.5333C14.3606 12.9 15.0333 12.2273 15.0333 11.4V4.2C15.0333 3.37266 14.3606 2.7 13.5333 2.7H10.8146L10.3364 1.93125C10.1524 1.65586 9.87588 1.5 9.57705 1.5H6.06143Z"
              fill="black"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export const MyWork = ({
  onWorksCreated,
}: {
  onWorksCreated?: (ids: string[]) => void;
}) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [createdWorkIds, setCreatedWorkIds] = useState<string[]>([]);
  const createWorks = useCreateWorks();

  const handleImageSelect = (file: File) => {
    setSelectedImages((prev) => [...prev, file]);
  };

  const handleUpload = async () => {
    if (selectedImages.length === 0) return;

    const formData = new FormData();
    formData.append("user", "6837297df30c0dcda9cf7bd0"); // Replace with actual user ID

    selectedImages.forEach((image, index) => {
      formData.append("work_name", `My Work ${index + 1}`);
      formData.append("work_images", image);
    });

    try {
      const response = await createWorks.mutateAsync(formData);
      const data = response?.data as { _id: string }[];  // tell TypeScript it's an array
      const ids = data?.map((w) => w._id) || [];
      setCreatedWorkIds(ids);
      onWorksCreated?.(ids);
      setSelectedImages([]);
    } catch (error) {
      console.error("Error uploading works:", error);
    }
  };

  return (
    <>
      <h3 className="editor-subtitle">Portfolio Upload</h3>
      <div className="grid grid-cols-3 gap-2">
        {selectedImages.map((image, index) => (
          <UploadImage
            key={index}
            onImageSelect={handleImageSelect}
            image_url={URL.createObjectURL(image)}
          />
        ))}
        {selectedImages.length < 6 && (
          <UploadImage onImageSelect={handleImageSelect} />
        )}
      </div>
      {selectedImages.length > 0 && (
        <button
          onClick={handleUpload}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          disabled={createWorks.isPending}
        >
          {createWorks.isPending ? "Uploading..." : "Upload Works"}
        </button>
      )}
      {createdWorkIds.length > 0 && (
        <p className="text-sm mt-2 text-gray-600">
          Created work IDs: {createdWorkIds.join(", ")}
        </p>
      )}
    </>
  );
};
