import { useState, useEffect, useRef } from "react";

const AutocompleteInput = ({
  label,
  id,
  placeholder,
  textError,
  error,
  register,
  setValue,
  options,
  resetTrigger,
  disabled,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [idCliente, setIdCliente] = useState(Number);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  

  const viewValue = () => {
    if (!inputValue) return;
    options.forEach((option) => {
      if (!String(option.id).includes(idCliente)) {
        setValue(id, "");
      }
    });
  };

  useEffect(() => {
    if (!inputValue) {
      setShowSuggestions(false);
      return;
    }
  
    const sugerencias = options
      .filter((option) => {
        const input = String(inputValue).toLowerCase();
        const fullName = String(option.fullName).toLowerCase();
  
        // 🔥 Buscar en todos los números de teléfono (si existen)
        const phoneMatch = option.phones?.some((phone) =>
          String(`${phone.countryCode} ${phone.phoneNumber}`)
            .toLowerCase()
            .includes(input)
        );
  
        return fullName.includes(input) || phoneMatch;
      })
      .slice(0, 5);
  
    setFilteredOptions(sugerencias);
    setShowSuggestions(sugerencias.length > 0);
  }, [inputValue, options]);
  

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    setInputValue("");
  }, [resetTrigger]);

  return (
    <div
      className="flex flex-col justify-center items-start gap-2 relative w-full"
      ref={inputRef}
    >
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        autoComplete="off"
        id={id}
        {...register(id, { required: true })}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white p-2 rounded border border-gray-300 text-black text-sm focus:ring-2 focus:ring-emerald-400"
        onBlur={viewValue}
        disabled={disabled}
      />

      {showSuggestions && (
        <ul className="absolute top-full left-0 w-full border border-gray-300 bg-white rounded-md mt-1 shadow-md max-h-40 overflow-y-auto z-10">
          {filteredOptions.map((sugerencia, index) => {
            const phoneString = sugerencia.phones?.length
              ? sugerencia.phones
                .filter((phone) => phone.isCommunicationPhone === true && phone.phoneNumber)
                .map((phone) => `${phone.countryCode} ${phone.phoneNumber}`)
                .join(' ')
            
              : "Sin teléfono";
            return (
              <li
                key={index}
                onClick={() => {
                  setInputValue(`${sugerencia.fullName} - ${phoneString}`);
                  setValue(id, {
                    id: sugerencia.id,
                    phone: `${sugerencia.phones[0]?.countryCode} ${sugerencia.phones[0]?.phoneNumber}`,
                    name: sugerencia.fullName
                  });
                  setIdCliente(sugerencia.id);
                  setShowSuggestions(false);
                }}
                
                className="p-2 cursor-pointer hover:bg-gray-100 text-sm text-left"
              >
                {sugerencia.fullName} - {phoneString}
              </li>
            );
          })}
        </ul>
      )}
      {error && <span className="text-red-400 text-xs">{textError}</span>}
    </div>
  );
};

export default AutocompleteInput;
