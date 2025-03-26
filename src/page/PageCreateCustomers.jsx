import InputForm from "../components/InputForm";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { postCustomerCreate } from "../API";
import { useNavigate } from "react-router";

const PageCustomers = () => {
  const navigate = useNavigate();

  const [arrayPhone, setArrayPhone] = useState([]);
  const [phone, setPhone] = useState({ phoneNumber: "", countryCode: "+34" });
  const [howMuchChildren, setHowMuchChildren] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const mutation = useMutation({
    mutationFn: async (data) => {
      postCustomerCreate(data);
    },
    onSuccess: () => {
      navigate("/customers");
    },
  });

  const countryPrefixes = [
    { id: "+1", prefix: "+1", name: "🇺🇸 Estados Unidos (+1)" },
    { id: "+34", prefix: "+34", name: "🇪🇸 España (+34)" },
    { id: "+33", prefix: "+33", name: "🇫🇷 Francia (+33)" },
    { id: "+44", prefix: "+44", name: "🇬🇧 Reino Unido (+44)" },
    { id: "+49", prefix: "+49", name: "🇩🇪 Alemania (+49)" },
    { id: "+39", prefix: "+39", name: "🇮🇹 Italia (+39)" },
    { id: "+52", prefix: "+52", name: "🇲🇽 México (+52)" },
    { id: "+54", prefix: "+54", name: "🇦🇷 Argentina (+54)" },
    { id: "+55", prefix: "+55", name: "🇧🇷 Brasil (+55)" },
    { id: "+56", prefix: "+56", name: "🇨🇱 Chile (+56)" },
    { id: "+57", prefix: "+57", name: "🇨🇴 Colombia (+57)" },
    { id: "+32", prefix: "+32", name: "🇧🇪 Bélgica (+32)" },
    { id: "+31", prefix: "+31", name: "🇳🇱 Países Bajos (+31)" },
    { id: "+41", prefix: "+41", name: "🇨🇭 Suiza (+41)" },
    { id: "+7", prefix: "+7", name: "🇷🇺 Rusia (+7)" },
    { id: "+61", prefix: "+61", name: "🇦🇺 Australia (+61)" },
    { id: "+86", prefix: "+86", name: "🇨🇳 China (+86)" },
    { id: "+81", prefix: "+81", name: "🇯🇵 Japón (+81)" },
    { id: "+82", prefix: "+82", name: "🇰🇷 Corea del Sur (+82)" },
    { id: "+91", prefix: "+91", name: "🇮🇳 India (+91)" },
    { id: "+27", prefix: "+27", name: "🇿🇦 Sudáfrica (+27)" },
    { id: "+966", prefix: "+966", name: "🇸🇦 Arabia Saudita (+966)" },
    { id: "+971", prefix: "+971", name: "🇦🇪 Emiratos Árabes Unidos (+971)" },
    { id: "+92", prefix: "+92", name: "🇵🇰 Pakistán (+92)" },
    { id: "+90", prefix: "+90", name: "🇹🇷 Turquía (+90)" },
    { id: "+66", prefix: "+66", name: "🇹🇭 Tailandia (+66)" },
    { id: "+64", prefix: "+64", name: "🇳🇿 Nueva Zelanda (+64)" },
    { id: "+20", prefix: "+20", name: "🇪🇬 Egipto (+20)" },
    { id: "+212", prefix: "+212", name: "🇲🇦 Marruecos (+212)" },
    { id: "+213", prefix: "+213", name: "🇩🇿 Argelia (+213)" },
    { id: "+351", prefix: "+351", name: "🇵🇹 Portugal (+351)" },
    { id: "+48", prefix: "+48", name: "🇵🇱 Polonia (+48)" },
    { id: "+420", prefix: "+420", name: "🇨🇿 República Checa (+420)" },
    { id: "+43", prefix: "+43", name: "🇦🇹 Austria (+43)" },
    { id: "+30", prefix: "+30", name: "🇬🇷 Grecia (+30)" },
    { id: "+46", prefix: "+46", name: "🇸🇪 Suecia (+46)" },
    { id: "+47", prefix: "+47", name: "🇳🇴 Noruega (+47)" },
    { id: "+358", prefix: "+358", name: "🇫🇮 Finlandia (+358)" },
    { id: "+63", prefix: "+63", name: "🇵🇭 Filipinas (+63)" },
    { id: "+62", prefix: "+62", name: "🇮🇩 Indonesia (+62)" },
    { id: "+98", prefix: "+98", name: "🇮🇷 Irán (+98)" },
    { id: "+972", prefix: "+972", name: "🇮🇱 Israel (+972)" },
    { id: "+234", prefix: "+234", name: "🇳🇬 Nigeria (+234)" },
    { id: "+254", prefix: "+254", name: "🇰🇪 Kenia (+254)" },
    { id: "+256", prefix: "+256", name: "🇺🇬 Uganda (+256)" },
    { id: "+84", prefix: "+84", name: "🇻🇳 Vietnam (+84)" },
  ];

  const dataProvince = [
    { id: "OTRO", name: "Otro" },
    { id: "ALAVA", name: "Álava" },
    { id: "ALBACETE", name: "Albacete" },
    { id: "ALICANTE", name: "Alicante" },
    { id: "ALMERIA", name: "Almería" },
    { id: "ASTURIAS", name: "Asturias" },
    { id: "AVILA", name: "Ávila" },
    { id: "BADAJOZ", name: "Badajoz" },
    { id: "BARCELONA", name: "Barcelona" },
    { id: "BURGOS", name: "Burgos" },
    { id: "CACERES", name: "Cáceres" },
    { id: "CADIZ", name: "Cádiz" },
    { id: "CANTABRIA", name: "Cantabria" },
    { id: "CASTELLON", name: "Castellón" },
    { id: "CIUDAD_REAL", name: "Ciudad Real" },
    { id: "CORDOBA", name: "Córdoba" },
    { id: "LA_CORUNA", name: "La Coruña" },
    { id: "CUENCA", name: "Cuenca" },
    { id: "GERONA", name: "Gerona" },
    { id: "GRANADA", name: "Granada" },
    { id: "GUADALAJARA", name: "Guadalajara" },
    { id: "GUIPUZCOA", name: "Guipúzcoa" },
    { id: "HUELVA", name: "Huelva" },
    { id: "HUESCA", name: "Huesca" },
    { id: "ISLAS_BALEARES", name: "Islas Baleares" },
    { id: "JAEN", name: "Jaén" },
    { id: "LEON", name: "León" },
    { id: "LERIDA", name: "Lérida" },
    { id: "LUGO", name: "Lugo" },
    { id: "MADRID", name: "Madrid" },
    { id: "MALAGA", name: "Málaga" },
    { id: "MURCIA", name: "Murcia" },
    { id: "NAVARRA", name: "Navarra" },
    { id: "ORENSE", name: "Orense" },
    { id: "PALENCIA", name: "Palencia" },
    { id: "LAS_PALMAS", name: "Las Palmas" },
    { id: "PONTEVEDRA", name: "Pontevedra" },
    { id: "LA_RIOJA", name: "La Rioja" },
    { id: "SALAMANCA", name: "Salamanca" },
    { id: "SEGOVIA", name: "Segovia" },
    { id: "SEVILLA", name: "Sevilla" },
    { id: "SORIA", name: "Soria" },
    { id: "TARRAGONA", name: "Tarragona" },
    { id: "SANTA_CRUZ_DE_TENERIFE", name: "Santa Cruz de Tenerife" },
    { id: "TERUEL", name: "Teruel" },
    { id: "TOLEDO", name: "Toledo" },
    { id: "VALENCIA", name: "Valencia" },
    { id: "VALLADOLID", name: "Valladolid" },
    { id: "VIZCAYA", name: "Vizcaya" },
    { id: "ZAMORA", name: "Zamora" },
    { id: "ZARAGOZA", name: "Zaragoza" },
  ];

  const preferredValues = [
    { id: "WHATSAPP", name: "Whatsapp" },
    { id: "SMS", name: "SMS" },
    { id: "EMAIL", name: "Email" },
    { id: "PHONE", name: "Llamada" },
  ];

  const watchAge = watch("dateBirth");

  useEffect(() => {
    if (watchAge) {
      function calcularEdad(fecha) {
        var hoy = new Date();
        var cumpleanos = new Date(fecha);
        var edad = hoy.getFullYear() - cumpleanos.getFullYear();
        var m = hoy.getMonth() - cumpleanos.getMonth();

        if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
          edad--;
        }

        return edad;
      }

      const newAge = calcularEdad(watchAge);

      setValue("age", newAge);
    }
  }, [watchAge, setValue]);

  const submit = (data) => {
    const dataMutation = {
      ...data,
      children: howMuchChildren,
      PhoneNumber: arrayPhone.map((elPhone) => {
        const prefijoPhone = `${elPhone.countryCode} ${elPhone.phoneNumber}`;
        if (prefijoPhone === data.preferredPhone) {
          return {
            ...elPhone,
            isCommunicationPhone: true,
            phoneNumber: +elPhone.phoneNumber,
          };
        } else {
          return {
            ...elPhone,
            isCommunicationPhone: false,
            phoneNumber: +elPhone.phoneNumber,
          };
        }
      }),
    };
    mutation.mutate(dataMutation);
  };

  return (
    <div className="flex justify-center items-center flex-col w-6xl mx-auto gap-5 bg-gray-100 mt-10 p-5 rounded-lg shadow-lg">
      <h2 className="text-2xl">Formulairo de Alta</h2>
      <form
        onSubmit={handleSubmit(submit)}
        className="flex flex-col items-start justify-center gap-5 w-full bg-white  p-5 rounded-lg shadow-lg"
      >
        <h3 className="text-2xl font-bold">Datos personales</h3>
        <div className="flex flex-row gap-5 w-full items-start">
          <InputForm
            label="Nombre Completo"
            placeholder="Ej: Juan Pérez"
            textError="Este campo es Obligatorio"
            type="text"
            id="fullName"
            error={errors.fullName}
            {...register("fullName", { required: true })}
          />
          <div>
            <InputForm
              label="Fecha de Nacimiento"
              textError="Este campo es Obligatorio"
              type="date"
              id="dateBirth"
              error={errors.dateBirth}
              {...register("dateBirth", { required: true })}
            />
          </div>
          <div className="flex flex-row gap-5 w-80">
            <InputForm
              label="Edad"
              placeholder="Ej: 30"
              textError="Este campo es Obligatorio"
              type="number"
              id="age"
              min={0}
              disabled={true}
              {...register("age", { required: true })}
            />
          </div>
          <div className="w-2xl flex flex-row gap-5 items-start">
            <InputForm
              label="Peso (kg)"
              placeholder="Ej: 70"
              textError="Este campo es Obligatorio"
              type="number"
              id="weight"
              min={0}
              error={errors.weight}
              {...register("weight", { required: true })}
            />
            <InputForm
              label="Altura (cm)"
              placeholder="Ej: 175"
              textError="Este campo es Obligatorio"
              type="number"
              id="height"
              error={errors.height}
              {...register("height", { required: true })}
            />
          </div>
          <InputForm
            label="Profesión"
            placeholder="Ej: Médico, Ingeniero, Profesor..."
            textError="Este campo es Obligatorio"
            type="text"
            id="profession"
            error={errors.profession}
            {...register("profession", { required: true })}
          />
        </div>
        <hr className="border-solid border-1 w-full border-gray-200 rounded-xs my-2" />

        <h3 className="text-2xl font-bold">Datos de contacto</h3>
        <div className="flex flex-row gap-5 w-full items-start justify-start">

          <div className="flex flex-col gap-5 w-full items-start">
            <div className="flex flex-row gap-5 w-full items-start">
              <div className="w-1/6">
                <InputForm
                  label={"Pais"}
                  textError="Este campo es Obligatorio"
                  type="select"
                  options={countryPrefixes}
                  id="countryCode"
                  onInput={(e) => {
                    setPhone({ ...phone, countryCode: e.target.value });
                  }}
                  defaultValue={countryPrefixes[1].id}
                  error={errors.countryCode}
                  {...register("countryCode")}
                />
              </div>
              <div className="w-3/6">
                <InputForm
                  label="Teléfono"
                  placeholder="Ej: 666 123 456"
                  textError="Este campo es Obligatorio"
                  type="number"
                  id="phone"
                  onInput={(e) => {
                    setPhone({ ...phone, phoneNumber: e.target.value });
                  }}
                  {...register("phone")}
                />
              </div>
              <div className="w-2/6">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    console.log(phone);
                    if (phone.phoneNumber) {
                      setArrayPhone((prev) => [...prev, { ...phone }]);
                      setPhone({ phoneNumber: "", countryCode: "+34" });
                      setValue("countryCode", "+34");
                      setValue("phone", "");
                    }
                  }}
                  className="bg-emerald-500 text-white w-full px-4 py-2 rounded mt-7 cursor-pointer transition-transform duration-200 hover:scale-105"
                >
                  Añadir
                </button>
              </div>
            </div>
            {arrayPhone.length !== 0 && (
              <div className="w-full">
                {arrayPhone.map((prefiPhone, i) => {
                  return (
                    <div
                      key={i}
                      className="flex flex-row justify-between items-center mb-2 w-full"
                    >
                      <label className="flex items-center gap-2 w-full">
                        <input
                          type="radio"
                          name="preferredPhone"
                          {...register("preferredPhone", {
                            required: "Debes seleccionar un teléfono preferido",
                          })}
                          value={`${prefiPhone.countryCode} ${prefiPhone.phoneNumber}`}
                          className="mr-2"
                        />
                        {prefiPhone.countryCode} {prefiPhone.phoneNumber}
                      </label>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setArrayPhone((prev) =>
                            prev.filter(
                              (phone) =>
                                !(
                                  phone.countryCode ===
                                    prefiPhone.countryCode &&
                                  phone.phoneNumber === prefiPhone.phoneNumber
                                )
                            )
                          );
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer transition-transform duration-200 hover:scale-105"
                      >
                        Eliminar
                      </button>
                    </div>
                  );
                })}
                {errors.preferredPhone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.preferredPhone.message}
                  </p>
                )}
                <p className="text-xs text-left mt-5">
                  Elige un número de teléfono para establecer
                  <br /> como tu preferencia de contacto.
                </p>
              </div>
            )}
          </div>
          <InputForm
            label="Correo Electrónico"
            placeholder="Ej: nombre@correo.com"
            textError="Este campo es Obligatorio"
            type="email"
            id="emailAddress"
            error={errors.emailAddress}
            {...register("emailAddress")}
          />
          <InputForm
            label="Medio de Comunicación Preferido"
            textError="Este campo es Obligatorio"
            type="select"
            id="preferredCommunication"
            options={preferredValues}
            error={errors.preferredCommunication}
            {...register("preferredCommunication", { required: true })}
          />
        </div>
        <hr className="border-solid border-1 w-full border-gray-200 rounded-xs my-2" />

        <h3 className="text-2xl font-bold ">Dirección</h3>
        <div className="flex flex-row gap-5 w-full items-start">
          <div className="w-2/10">
            <InputForm
              label={"Provincia (España)"}
              textError="Este campo es Obligatorio"
              type="select"
              options={dataProvince}
              id="province"
              error={errors.province}
              {...register("province", { required: true })}
            />
          </div>
          <div className="w-3/10">
            <InputForm
              label="Población (España)"
              placeholder="Introduce tu ciudad o pueblo"
              textError="Este campo es Obligatorio"
              type="text"
              id="population"
              error={errors.population}
              {...register("population", { required: true })}
            />
          </div>
          <div className="w-1/10">
            <InputForm
              label="Código Postal"
              placeholder="Ej: 28053"
              textError="Este campo es Obligatorio"
              type="number"
              min={0}
              id="cD"
              error={errors.cD}
              {...register("cD", { required: true })}
            />
          </div>
          <div className="w-4/10">
            <InputForm
              label="Dirección Completa"
              placeholder="Introduce la dirección completa"
              textError="Este campo es Obligatorio"
              type="text"
              id="address"
              error={errors.address}
              {...register("address", { required: true })}
            />
          </div>
        </div>
        <hr className="border-solid border-1 w-full border-gray-200 rounded-xs my-2" />

        <h3 className="text-2xl font-bold">Otros datos</h3>
        <div className="flex flex-row gap-5 w-full items-start">
          <div className="w-1/15">
            <InputForm
              label="Nº Hijos"
              placeholder="Ej: 2"
              textError="Este campo es Obligatorio"
              type="number"
              min={0}
              id="children"
              onInput={(e) => {
                setHowMuchChildren(e.target.value);
              }}
              error={errors.children}
              {...register("children")}
            />
          </div>
          <div className="w-3/15">
            <InputForm
              label="Observaciones sobre los Hijos"
              placeholder="Algún comentario adicional"
              textError="Este campo es Obligatorio"
              type="text"
              id="observationChildren"
              disabled={howMuchChildren == 0 ? true : false}
              error={errors.observationChildren}
              {...register("observationChildren")}
            />
          </div>
        </div>

        <div className="flex flex-row justify-center gap-5 w-full">
          <button
            type="submit"
            className={` text-white px-4 py-2 rounded ${
              arrayPhone.length !== 0 &&
              "bg-blue-500 cursor-pointer transition-transform duration-200 hover:scale-105"
            } ${arrayPhone.length === 0 && "bg-blue-500/50"}`}
            disabled={arrayPhone.length === 0}
          >
            Dar de alta al paciente
          </button>
        </div>
      </form>
    </div>
  );
};

export default PageCustomers;
