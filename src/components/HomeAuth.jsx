import { useNavigate } from "react-router";
import { tryLogout } from "@/API";
import { useState, useEffect } from "react";
import CalendarioVista from "./Calendario";
import { useQuery } from "@tanstack/react-query";
import { getAllUser } from "../API";
import InputForm from "./InputForm";

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
      setNameUser(userSelect.name);
    }
  }, [valueSelect]);

  if (isLoading) {
    return <h1>Cargando</h1>;
  }
  if (error) {
    return <h1>Error</h1>;
  }
  if (data) {
    return (
      <div className="flex justify-center items-center flex-col w-6xl mx-auto gap-5 bg-gray-100 mt-10 p-5 rounded-lg shadow-lg">
        <div>
          <InputForm
            label="Seleccione un trabajdor"
            textError="Seleccione al trabajador"
            type="select"
            id="user"
            options={data}
            onChange={(e) => {
              setValueSelect(e.target.value);
            }}
          />
        </div>
        <CalendarioVista userId={valueSelect} userName={nameUser} />
      </div>
    );
  }
};

export default HomeAuth;
