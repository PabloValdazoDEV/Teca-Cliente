import { useNavigate } from "react-router";
import { tryLogout } from "@/API";
import { useState, useEffect } from "react";
import CalendarioVista from "./Calendario";
import { useQuery } from "@tanstack/react-query";
import { getAllUser } from "../API";

const HomeAuth = () => {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["allUsers"],
    queryFn: getAllUser,
  });

  const [valueSelect, setValueSelect] = useState("");
  const [nameUser, setNameUser] = useState("");

  useEffect(() => {
    if (data) {
      const userSelect = data.filter((user) => user.id === valueSelect);
      setNameUser(`${userSelect[0].name} ${userSelect[0].lastName}`);
    }
  }, [valueSelect]);

  if (isLoading) {
    return <h1>Cargando</h1>;
  }
  if (error) {
    return <h1>Error</h1>;
  }
  return (
    <div className="flex justify-center items-center flex-col w-6xl mx-auto gap-10 bg-gray-100 mt-10 p-5 rounded-lg shadow-lg">
      <div className="">
        <h2>Selecciona un trabajador:</h2>
        <select
          value={valueSelect}
          onChange={(e) => setValueSelect(e.target.value)}
        >
          <option value="" disabled hidden>
            Seleccione un trabajador
          </option>
          {data.map((user) => {
            return (
              <option key={user.id} value={user.id}>
                {user.name} {user.lastName}
              </option>
            );
          })}
        </select>
        <CalendarioVista userId={valueSelect} userName={nameUser} />
      </div>
    </div>
  );
};

export default HomeAuth;
