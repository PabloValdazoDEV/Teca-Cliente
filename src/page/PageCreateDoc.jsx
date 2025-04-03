import { useNavigate, useParams } from "react-router";
import { useState, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
import { getAllFcihas, postFcihaCreate } from "../API";
import InputForm from "../components/InputForm";
import { useForm } from "react-hook-form";
import { useAtom } from "jotai";
import ModalCreateFicha from "../context/ModalCreateFicha";
import { useMutation } from "@tanstack/react-query";

const PageCreateDoc = ({ customer, docId }) => {
  const navigate = useNavigate();


  const [showModalCreate, setShowModalCreate] = useAtom(ModalCreateFicha);

  const structureTable = {
    docId: docId,
    observations: "",
    treatmentPlan: "",
    dateFichaId: "",
    PELVIS: {
      LFX: "",
      I: "",
      ILI: "",
    },
    COLUMNA: {
      F: "",
      E: "",
      RO: "",
    },
    CLAVICULA: {
      H: "",
      IZQ: "",
      DCH: "",
    },
    RODILLA: {
      H: "",
      IZQ: "",
      DCH: "",
    },
    CERVICALES: {
      TRS: "",
      RO: "",
    },
    FS: "",
    ES: "",
  };

  const [dataTable, setDataTablet] = useState(structureTable);

  const mutation = useMutation({
    mutationFn: async (data) => {
    
      postFcihaCreate(data)
    },
    onSuccess: () => {
      setShowModalCreate(false)
      setDataTablet(structureTable);
    },
  });


  function formatCustomDate(dateString) {
    const date = new Date(dateString.replace(" ", "T"));

    const dayOfWeek = date.toLocaleDateString("es-ES", { weekday: "long" });
    const day = date.getDate();
    const month = date.toLocaleDateString("es-ES", { month: "long" });
    const hour = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${dayOfWeek}, ${day} de ${month}, ${hour}:${minutes}`;
  }

  const dateCustomer = customer.appointments.map((date) => {
    return { id: date.id, name: formatCustomDate(date.citaDate) };
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    data,
  } = useForm();
  function transformStructureToFicha(structure) {
    const { observations, treatmentPlan, dateFichaId, docId, ...rest } = structure;

    const bodyAssessments = [];

    for (const [bodyPartKey, subParts] of Object.entries(rest)) {
      if (typeof subParts === "string") {
        if (subParts?.trim() !== "") {
          bodyAssessments.push({
            bodyPart: bodyPartKey,
            subBodyPart: "OTRO",
            description: subParts,
          });
        }
      } else {
        for (const [subKey, value] of Object.entries(subParts)) {
          if (value?.trim() !== "") {
            bodyAssessments.push({
              bodyPart: bodyPartKey,
              subBodyPart: subKey,
              description: value,
            });
          }
        }
      }
    }

    return {
      observations,
      treatmentPlan,
      dateFichaId,
      bodyAssessments,
      docId
    };
  }

  const submit = () => {

    mutation.mutate(transformStructureToFicha(dataTable));
  };

  return (
    <div className="flex justify-center items-center flex-col w-6xl mx-auto gap-5 bg-gray-100 mt-10 p-5 rounded-lg shadow-lg">
      <form onSubmit={handleSubmit(submit)}>
        <div className="flex flex-row justify-between w-full gap-5 mb-5">
          <div className="w-2xl">
            <InputForm
              label={"Fecha de la ficha"}
              textError="Este campo es Obligatorio"
              type="select"
              options={dateCustomer}
              id="dateFicha"
              error={errors.dateFicha}
              onInput={(e) => {
                setDataTablet({ ...dataTable, dateFichaId: e.target.value });
              }}
              {...register("dateFicha", { required: true })}
            />
          </div>
          <InputForm
            label="Observaciones"
            textError="Este campo es Obligatorio"
            type="text"
            id="observations"
            error={errors.observations}
            onInput={(e) => {
              setDataTablet({ ...dataTable, observations: e.target.value });
            }}
            {...register("observations")}
          />
          <InputForm
            label="Tratamiento"
            textError="Este campo es Obligatorio"
            type="text"
            id="treatmentPlan"
            error={errors.treatmentPlan}
            onInput={(e) => {
              setDataTablet({ ...dataTable, treatmentPlan: e.target.value });
            }}
            {...register("treatmentPlan")}
          />
        </div>
        <table className="w-full bg-white h-40">
          <thead>
            <tr className="bg-gray-300 text-left">
              <th className="border border-black px-2 py-1 text-sm" colSpan="2">
                PELVIS
              </th>
              <th className="border border-black px-2 py-1 text-sm" colSpan="2">
                COLUMNA
              </th>
              <th className="border border-black px-2 py-1 text-sm" colSpan="2">
                CLAVÍCULA
              </th>
              <th className="border border-black px-2 py-1 text-sm" colSpan="2">
                RODILLA
              </th>
              <th className="border border-black px-2 py-1 text-sm">F.S.</th>
              <th className="border border-black px-2 py-1 text-sm">E.S</th>
              <th className="border border-black px-2 py-1 text-sm" colSpan="2">
                CERVICALES
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-left">
              <td className="border border-black px-2 pb-1 text-xs">LFX:</td>
              <td className="border border-black px-2 text-xs bg-emerald-50">
                <textarea
                  style={{ outline: "none", boxShadow: "none", border: "none" }}
                  className="w-full h-full py-2"
                  onInput={(e) => {
                    setDataTablet({
                      ...dataTable,
                      PELVIS: { ...dataTable.PELVIS, LFX: e.target.value },
                    });
                  }}
                />
              </td>
              <td className="border border-black px-2 pb-1 text-xs">F:</td>
              <td className="border border-black px-2 text-xs bg-emerald-50">
                <textarea
                  style={{ outline: "none", boxShadow: "none", border: "none" }}
                  className="w-full h-full py-2"
                  onInput={(e) => {
                    setDataTablet({
                      ...dataTable,
                      COLUMNA: { ...dataTable.COLUMNA, F: e.target.value },
                    });
                  }}
                />
              </td>
              <td className="border border-black px-2 pb-1 text-xs">H:</td>
              <td className="border border-black px-2 text-xs bg-emerald-50">
                <textarea
                  style={{ outline: "none", boxShadow: "none", border: "none" }}
                  className="w-full h-full py-2"
                  onInput={(e) => {
                    setDataTablet({
                      ...dataTable,
                      CLAVICULA: { ...dataTable.CLAVICULA, H: e.target.value },
                    });
                  }}
                />
              </td>
              <td className="border border-black px-2 pb-1 text-xs">H:</td>
              <td className="border border-black px-2 text-xs bg-emerald-50">
                <textarea
                  style={{ outline: "none", boxShadow: "none", border: "none" }}
                  className="w-full h-full py-2"
                  onInput={(e) => {
                    setDataTablet({
                      ...dataTable,
                      RODILLA: { ...dataTable.RODILLA, H: e.target.value },
                    });
                  }}
                />
              </td>
              <td
                rowSpan="3"
                className="border border-black px-2 text-xs bg-emerald-50"
              >
                <textarea
                  style={{ outline: "none", boxShadow: "none", border: "none" }}
                  className="w-full h-full py-2"
                  onInput={(e) => {
                    setDataTablet({ ...dataTable, FS: e.target.value });
                  }}
                />
              </td>
              <td
                rowSpan="3"
                className="border border-black px-2 text-xs bg-emerald-50"
              >
                <textarea
                  style={{ outline: "none", boxShadow: "none", border: "none" }}
                  className="w-full h-full py-2"
                  onInput={(e) => {
                    setDataTablet({ ...dataTable, ES: e.target.value });
                  }}
                />
              </td>
              <td className="border border-black px-2 pb-1 text-xs">TRS:</td>
              <td className="border border-black px-2 text-xs bg-emerald-50">
                <textarea
                  style={{ outline: "none", boxShadow: "none", border: "none" }}
                  className="w-full h-full py-2"
                  onInput={(e) => {
                    setDataTablet({
                      ...dataTable,
                      CERVICALES: {
                        ...dataTable.CERVICALES,
                        TRS: e.target.value,
                      },
                    });
                  }}
                />
              </td>
            </tr>
            <tr className="text-left">
              <td className="border border-black px-2 pb-1 text-xs">_I_:</td>
              <td className="border border-black px-2 text-xs bg-emerald-50">
                <textarea
                  style={{ outline: "none", boxShadow: "none", border: "none" }}
                  className="w-full h-full py-2"
                  onInput={(e) => {
                    setDataTablet({
                      ...dataTable,
                      PELVIS: { ...dataTable.PELVIS, I: e.target.value },
                    });
                  }}
                />
              </td>
              <td className="border border-black px-2 pb-1 text-xs">E:</td>
              <td className="border border-black px-2 text-xs bg-emerald-50">
                <textarea
                  style={{ outline: "none", boxShadow: "none", border: "none" }}
                  className="w-full h-full py-2"
                  onInput={(e) => {
                    setDataTablet({
                      ...dataTable,
                      COLUMNA: { ...dataTable.COLUMNA, E: e.target.value },
                    });
                  }}
                />
              </td>
              <td className="border border-black px-2 pb-1 text-xs">IZQ:</td>
              <td className="border border-black px-2 text-xs bg-emerald-50">
                <textarea
                  style={{ outline: "none", boxShadow: "none", border: "none" }}
                  className="w-full h-full py-2"
                  onInput={(e) => {
                    setDataTablet({
                      ...dataTable,
                      CLAVICULA: {
                        ...dataTable.CLAVICULA,
                        IZQ: e.target.value,
                      },
                    });
                  }}
                />
              </td>
              <td className="border border-black px-2 pb-1 text-xs">IZQ:</td>
              <td className="border border-black px-2 text-xs bg-emerald-50">
                <textarea
                  style={{ outline: "none", boxShadow: "none", border: "none" }}
                  className="w-full h-full py-2"
                  onInput={(e) => {
                    setDataTablet({
                      ...dataTable,
                      RODILLA: { ...dataTable.RODILLA, IZQ: e.target.value },
                    });
                  }}
                />
              </td>
              <td
                colSpan="2"
                className="border border-black px-2 pb-1 text-xs"
              ></td>
            </tr>
            <tr className="text-left">
              <td className="border border-black px-2 pb-1 text-xs">ILI:</td>
              <td className="border border-black px-2 text-xs bg-emerald-50">
                <textarea
                  style={{ outline: "none", boxShadow: "none", border: "none" }}
                  className="w-full h-full py-2"
                  onInput={(e) => {
                    setDataTablet({
                      ...dataTable,
                      PELVIS: { ...dataTable.PELVIS, ILI: e.target.value },
                    });
                  }}
                />
              </td>
              <td className="border border-black px-2 pb-1 text-xs">R.O:</td>
              <td className="border border-black px-2 text-xs bg-emerald-50">
                <textarea
                  style={{ outline: "none", boxShadow: "none", border: "none" }}
                  className="w-full h-full py-2"
                  onInput={(e) => {
                    setDataTablet({
                      ...dataTable,
                      COLUMNA: { ...dataTable.COLUMNA, RO: e.target.value },
                    });
                  }}
                />
              </td>
              <td className="border border-black px-2 pb-1 text-xs">DCH:</td>
              <td className="border border-black px-2 text-xs bg-emerald-50">
                <textarea
                  style={{ outline: "none", boxShadow: "none", border: "none" }}
                  className="w-full h-full py-2"
                  onInput={(e) => {
                    setDataTablet({
                      ...dataTable,
                      CLAVICULA: {
                        ...dataTable.CLAVICULA,
                        DCH: e.target.value,
                      },
                    });
                  }}
                />
              </td>
              <td className="border border-black px-2 pb-1 text-xs">DCH:</td>
              <td className="border border-black px-2 text-xs bg-emerald-50">
                <textarea
                  style={{ outline: "none", boxShadow: "none", border: "none" }}
                  className="w-full h-full py-2"
                  onInput={(e) => {
                    setDataTablet({
                      ...dataTable,
                      RODILLA: { ...dataTable.RODILLA, DCH: e.target.value },
                    });
                  }}
                />
              </td>
              <td className="border border-black px-2 pb-1 text-xs">R.O:</td>
              <td className="border border-black px-2 text-xs bg-emerald-50">
                <textarea
                  style={{ outline: "none", boxShadow: "none", border: "none" }}
                  className="w-full h-full py-2"
                  onInput={(e) => {
                    setDataTablet({
                      ...dataTable,
                      CERVICALES: {
                        ...dataTable.CERVICALES,
                        RO: e.target.value,
                      },
                    });
                  }}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <div className="flex flex-row justify-between w-full">
          <button
            type="submit"
            className=" text-white px-4 py-2 rounded bg-blue-500 cursor-pointer transition-transform duration-200 hover:scale-105 mt-5"
          >
            Guardar nuevo registro
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowModalCreate(false);
              setDataTablet(structureTable);
            }}
            className=" text-white px-4 py-2 rounded bg-gray-500 cursor-pointer transition-transform duration-200 hover:scale-105 mt-5"
          >
            Cerrar sin guardar
          </button>
        </div>
      </form>
    </div>
  );
};

export default PageCreateDoc;
