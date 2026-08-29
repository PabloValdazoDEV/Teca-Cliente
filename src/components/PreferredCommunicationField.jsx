/* eslint-disable react/prop-types */
import { useQuery } from "@tanstack/react-query";
import { getAppConfig } from "@/API";

const labels = {
  PHONE: "Llamada",
  EMAIL: "Email",
  WHATSAPP: "WhatsApp",
  SMS: "SMS",
};

const PreferredCommunicationField = ({ value, onChange }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["app-config"],
    queryFn: getAppConfig,
    staleTime: 5 * 60_000,
  });
  const enabledChannels = data?.preferredCommunicationChannels || [];
  const currentChannelIsDisabled =
    Boolean(value) && !enabledChannels.includes(value);

  return (
    <label className="field">
      <span>Comunicación preferida</span>
      <select
        name="preferredCommunication"
        value={value}
        onChange={onChange}
        disabled={isLoading}
      >
        <option value="">Sin definir</option>
        {currentChannelIsDisabled && (
          <option value={value}>{labels[value] || value} (desactivado)</option>
        )}
        {enabledChannels.map((channel) => (
          <option key={channel} value={channel}>
            {labels[channel] || channel}
          </option>
        ))}
      </select>
      {!isLoading && !enabledChannels.length && (
        <small className="helper">No hay medios de comunicación habilitados.</small>
      )}
    </label>
  );
};

export default PreferredCommunicationField;
