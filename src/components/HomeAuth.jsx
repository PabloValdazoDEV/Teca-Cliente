import { useNavigate } from "react-router";
import { tryLogout } from "@/API";
import { useState, useEffect } from "react";
import CalendarioVista from "./Calendario";

const HomeAuth = () => {
  const navigate = useNavigate();

  const [trabajador, setTrabajador] = useState(
    "360d6f38-d6be-4117-824f-fef29e7c3f07"
  );


  return (
    <div className="flex justify-center items-center flex-col w-6xl mx-auto gap-10 bg-gray-100 mt-10 p-5 rounded-lg shadow-lg">
      <h1>Logeado 👍🏼</h1>
      <div className="">
        <h2>Selecciona un trabajador:</h2>
        <select
          value={trabajador} // ✅ Controla el valor del select correctamente
          onChange={(e) => setTrabajador(e.target.value)}
        >
          <option value="360d6f38-d6be-4117-824f-fef29e7c3f07">
            Pablo Valdazo
          </option>
          <option value="0a85cc77-321f-48b9-87fa-ac80e509beb3">
            Antonio Cidoncha
          </option>
        </select>

        {/* ✅ Aquí ahora debería actualizarse correctamente */}
        <CalendarioVista userId={trabajador} />
      </div>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => {
          tryLogout();
          navigate("/");
        }}
      >
        LogOut
      </button>
    </div>
  );
};

export default HomeAuth;
