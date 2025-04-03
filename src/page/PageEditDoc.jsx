import { useNavigate, useParams } from "react-router";
import { useState, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
import { putFcihaEdit } from "../API";
import InputForm from "../components/InputForm";
import { useForm } from "react-hook-form";
import { useAtom } from "jotai";
import ModalEditFicha from "../context/ModalEditFicha";
import { useMutation } from "@tanstack/react-query";

const PageEditDoc = ({ customer, docId, registro }) => {
  const navigate = useNavigate();


  const [showModalEdit, setShowModalEdit] = useAtom(ModalEditFicha);

  function formatCustomDate(dateString) {
    const date = new Date(dateString.replace(" ", "T"));

    const dayOfWeek = date.toLocaleDateString("es-ES", { weekday: "long" });
    const day = date.getDate();
    const month = date.toLocaleDateString("es-ES", { month: "long" });
    const hour = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${dayOfWeek}, ${day} de ${month}, ${hour}:${minutes}`;
  }

  const structureTable = {
    docId: docId,
    fichaId: registro.id,
    observations: registro.observations,
    treatmentPlan: registro.treatmentPlan,
    dateFichaId: registro.date.id,
    dateFicha: formatCustomDate(registro.date.citaDate),
    PELVIS: {
      LFX: registro.bodyAssessments.map((part) => {
        if (part.bodyPart == "PELVIS" && part.subBodyPart == "LFX") {
          return part.description;
        }
      }).join(""),
      I: registro.bodyAssessments.map((part) => {
        if (part.bodyPart == "PELVIS" && part.subBodyPart == "I") {
          return part.description;
        }
      }).join(""),
      ILI: registro.bodyAssessments.map((part) => {
        if (part.bodyPart == "PELVIS" && part.subBodyPart == "ILI") {
          return part.description;
        }
      }).join(""),
    },
    COLUMNA: {
      F: registro.bodyAssessments.map((part) => {
        if (part.bodyPart == "COLUMNA" && part.subBodyPart == "F") {
          return part.description;
        }
      }).join(""),
      E: registro.bodyAssessments.map((part) => {
        if (part.bodyPart == "COLUMNA" && part.subBodyPart == "E") {
          return part.description;
        }
      }).join(""),
      RO: registro.bodyAssessments.map((part) => {
        if (part.bodyPart == "COLUMNA" && part.subBodyPart == "RO") {
          return part.description;
        }
      }).join(""),
    },
    CLAVICULA: {
      H: registro.bodyAssessments.map((part) => {
        if (part.bodyPart == "CLAVICULA" && part.subBodyPart == "H") {
          return part.description;
        }
      }).join(""),
      IZQ: registro.bodyAssessments.map((part) => {
        if (part.bodyPart == "CLAVICULA" && part.subBodyPart == "IZQ") {
          return part.description;
        }
      }).join(""),
      DCH: registro.bodyAssessments.map((part) => {
        if (part.bodyPart == "CLAVICULA" && part.subBodyPart == "DCH") {
          return part.description;
        }
      }).join(""),
    },
    RODILLA: {
      H: registro.bodyAssessments.map((part) => {
        if (part.bodyPart == "RODILLA" && part.subBodyPart == "H") {
          return part.description;
        }
      }).join(""),
      IZQ: registro.bodyAssessments.map((part) => {
        if (part.bodyPart == "RODILLA" && part.subBodyPart == "IZQ") {
          return part.description;
        }
      }).join(""),
      DCH: registro.bodyAssessments.map((part) => {
        if (part.bodyPart == "RODILLA" && part.subBodyPart == "DCH") {
          return part.description;
        }
      }).join(""),
    },
    CERVICALES: {
      TRS: registro.bodyAssessments.map((part) => {
        if (part.bodyPart == "CERVICALES" && part.subBodyPart == "TRS") {
          return part.description;
        }
      }).join(""),
      RO: registro.bodyAssessments.map((part) => {
        if (part.bodyPart == "CERVICALES" && part.subBodyPart == "RO") {
          return part.description;
        }
      }).join(""),
    },
    FS: registro.bodyAssessments.map((part) => {
        if (part.bodyPart == "FS" && part.subBodyPart == "OTRO") {
          return part.description;
        }
      }).join(""),
    ES: registro.bodyAssessments.map((part) => {
        if (part.bodyPart == "ES" && part.subBodyPart == "OTRO") {
          return part.description;
        }
      }).join(""),
  };

  const [dataTable, setDataTablet] = useState(structureTable);

  const mutation = useMutation({
    mutationFn: async (data) => {
      await putFcihaEdit(data);
    },
    onSuccess: () => {
      setShowModalEdit(false);
      setDataTablet(structureTable);
    },
  });



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
    const { observations, treatmentPlan, dateFichaId, docId,dateFicha, fichaId , ...rest } =
      structure;

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
      docId,
      fichaId
    };
  }
  


  const submit = () => {
   
    mutation.mutate(transformStructureToFicha(dataTable));
  };

  return (
    <div className="flex justify-center items-center flex-col w-6xl mx-auto gap-5 bg-gray-100 mt-10 p-5 rounded-lg shadow-lg">
      <form onSubmit={handleSubmit(submit)}>
        <div className="flex flex-row justify-between w-full gap-5 mb-5 items-end">
          <div className="w-2xl">
            <InputForm
              label={
                <div className="text-left">
                  Fecha de la ficha:<br />
                  {dataTable.dateFicha}
                </div>
              }
              textError="Este campo es Obligatorio"
              type="select"
              options={dateCustomer}
              id="dateFicha"
              error={errors.dateFicha}
              onInput={(e) => {
                setDataTablet({ ...dataTable, dateFichaId: e.target.value });
              }}
              {...register("dateFicha")}
            />
          </div>
          <InputForm
            label="Observaciones"
            textError="Este campo es Obligatorio"
            type="text"
            id="observations"
            error={errors.observations}
            defaultValue={registro.observations}
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
            defaultValue={registro.treatmentPlan}
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
                  defaultValue={registro.bodyAssessments.map((part) => {
                    if (
                      part.bodyPart == "PELVIS" &&
                      part.subBodyPart == "LFX"
                    ) {
                      return part.description;
                    }
                  }).join("")}
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
                  defaultValue={registro.bodyAssessments.map((part) => {
                    if (part.bodyPart == "COLUMNA" && part.subBodyPart == "F") {
                      return part.description;
                    }
                  }).join("")}
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
                  defaultValue={registro.bodyAssessments.map((part) => {
                    if (part.bodyPart == "CLAVICULA" && part.subBodyPart == "H") {
                      return part.description;
                    }
                  }).join("")}
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
                  defaultValue={registro.bodyAssessments.map((part) => {
                    if (part.bodyPart == "RODILLA" && part.subBodyPart == "H") {
                      return part.description;
                    }
                  }).join("")}
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
                  defaultValue={registro.bodyAssessments.map((part) => {
                    if (part.bodyPart == "FS" && part.subBodyPart == "OTRO") {
                      return part.description;
                    }
                  }).join("")}
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
                  defaultValue={registro.bodyAssessments.map((part) => {
                    if (part.bodyPart == "ES" && part.subBodyPart == "OTRO") {
                      return part.description;
                    }
                  }).join("")}
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
                  defaultValue={registro.bodyAssessments.map((part) => {
                    if (part.bodyPart == "CERVICALES" && part.subBodyPart == "TRS") {
                      return part.description;
                    }
                  }).join("")}
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
                  defaultValue={registro.bodyAssessments.map((part) => {
                    if (part.bodyPart == "PELVIS" && part.subBodyPart == "I") {
                      return part.description;
                    }
                  }).join("")}
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
                  defaultValue={registro.bodyAssessments.map((part) => {
                    if (part.bodyPart == "COLUMNA" && part.subBodyPart == "E") {
                      return part.description;
                    }
                  }).join("")}
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
                  defaultValue={registro.bodyAssessments.map((part) => {
                    if (part.bodyPart == "CLAVICULA" && part.subBodyPart == "IZQ") {
                      return part.description;
                    }
                  }).join("")}
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
                  defaultValue={registro.bodyAssessments.map((part) => {
                    if (part.bodyPart == "RODILLA" && part.subBodyPart == "IZQ") {
                      return part.description;
                    }
                  }).join("")}
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
                  defaultValue={registro.bodyAssessments.map((part) => {
                    if (part.bodyPart == "PELVIS" && part.subBodyPart == "ILI") {
                      return part.description;
                    }
                  }).join("")}
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
                  defaultValue={registro.bodyAssessments.map((part) => {
                    if (part.bodyPart == "COLUMNA" && part.subBodyPart == "RO") {
                      return part.description;
                    }
                  }).join("")}
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
                  defaultValue={registro.bodyAssessments.map((part) => {
                    if (part.bodyPart == "CLAVICULA" && part.subBodyPart == "DCH") {
                      return part.description;
                    }
                  }).join("")}
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
                  defaultValue={registro.bodyAssessments.map((part) => {
                    if (part.bodyPart == "RODILLA" && part.subBodyPart == "DCH") {
                      return part.description;
                    }
                  }).join("")}
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
                  defaultValue={registro.bodyAssessments.map((part) => {
                    if (part.bodyPart == "CERVICALES" && part.subBodyPart == "RO") {
                      return part.description;
                    }
                  }).join("")}
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
            Actualizar registro
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowModalEdit(false);
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

export default PageEditDoc;
