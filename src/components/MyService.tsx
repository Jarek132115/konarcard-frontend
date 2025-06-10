import React, { useState } from "react";
import { useCreateService } from "../hooks/useCreateService";

export const MyService = ({
  onServicesCreated,
}: {
  onServicesCreated?: (ids: string[]) => void;
}) => {
  const [serviceName, setServiceName] = useState("");
  const [serviceDetails, setServiceDetails] = useState("");
  const [createdServiceIds, setCreatedServiceIds] = useState<string[]>([]);
  const { mutate: createService, isPending } = useCreateService();

  const handleSubmit = () => {
    createService(
      {
        service_name: serviceName,
        service_details: serviceDetails,
        user: "6837297df30c0dcda9cf7bd0", // ⚠️ Replace with dynamic user ID
      },
      {
        onSuccess: (data: any) => {
          const newId = data._id;
          const updatedIds = [...createdServiceIds, newId];
          setCreatedServiceIds(updatedIds);
          onServicesCreated?.(updatedIds);

          // Optionally clear form fields
          setServiceName("");
          setServiceDetails("");
        },
      }
    );
  };

  return (
    <div>
      <h3 className="editor-subtitle">My Services</h3>

      <div className="flex mt-5 flex-col gap-2">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col">
            <input
              style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
              className="field-value"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="Service Name"
            />
            <input
              style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
              className="field-value"
              value={serviceDetails}
              onChange={(e) => setServiceDetails(e.target.value)}
              placeholder="Service Details"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Create Service"}
          </button>
        </div>

        {/* Optional display of created IDs */}
        {createdServiceIds.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Created service IDs: {createdServiceIds.join(", ")}
          </div>
        )}
      </div>
    </div>
  );
};
