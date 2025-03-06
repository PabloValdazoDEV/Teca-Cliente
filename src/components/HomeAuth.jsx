
import { useNavigate } from 'react-router'
import { tryLogout } from '@/API';
import { useState } from "react";
import Calendario from "./Calendario";

const HomeAuth = () => {
  const navigate = useNavigate()
  const [trabajador, setTrabajador] = useState("360d6f38-d6be-4117-824f-fef29e7c3f07");

  const onSubmit = () => {
    tryLogout()
    navigate("/");
  };

  return (
    <div style={{marginTop: 20}}>
      {/* <h1>Logeado 👍🏼</h1>
      <div className=''>
      <h2>Selecciona un trabajador:</h2>
      <select onChange={(e) => setTrabajador(e.target.value)}>
        <option value="360d6f38-d6be-4117-824f-fef29e7c3f07">Pablo Valdazo</option>
        <option value="0a85cc77-321f-48b9-87fa-ac80e509beb3">Antonio Cidoncha</option>
      </select>
      <Calendario trabajador={trabajador} />
    </div>
      <button onClick={onSubmit}>LogOut</button> */}
    </div>
  );
};

export default HomeAuth;


