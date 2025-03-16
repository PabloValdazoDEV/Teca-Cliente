const InputForm = (data) => {
  const { label, placeholder, textError, id, error, textAltInput, ...rest } =
    data;

  if (rest.type === "select") {
    return (
      <div className="flex flex-col justify-center items-start gap-2 w-full">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <select
          id={id}
          className={`w-full bg-white p-2 rounded border border-gray-300 text-black text-sm focus:ring-2 focus:ring-emerald-400 ${rest.disabled && "opacity-50"}`}
          defaultValue={rest.value ?? ""}
          {...rest}
        >
          <option value="" disabled hidden>
            Seleccione una opción
          </option>
          {rest.options?.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        {error && <span className="text-red-400 text-xs">{textError}</span>}
      </div>
    );
  }

  if (rest.type === "checkbox") {
    return (
      <div className="flex flex-col justify-start items-start gap-2 w-full my-auto">
        <div className="flex flex-row items-center gap-2 w-1xl my-auto">
          <label htmlFor={id} className="text-sm font-medium w-full">
            {label}
          </label>
          <input
            id={id}
            type="checkbox"
            className={`bg-white p-2 rounded border border-gray-300 text-black text-sm ${rest.disabled && "opacity-50"}`}
            checked={rest.checked ?? false}
            onChange={rest.onChange}
            {...rest}
          />
        </div>
        <p className="text-xs text-left">{textAltInput}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col justify-center items-start gap-2 w-full">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        className={`w-full bg-white p-2 rounded border border-gray-300 text-black text-sm focus:ring-2 focus:ring-emerald-400 ${rest.disabled && "opacity-50"}`}
        placeholder={placeholder}
        defaultValue={rest.value ?? ""}
        {...rest}
      />
      {error && <span className="text-red-400 text-xs">{textError}</span>}
    </div>
  );
};

export default InputForm;
