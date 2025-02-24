import api from "@/API/api";
import Cookies from "js-cookie"

const GetAllUsers = async () => {
  try {
    const responde = await api.get("/users")
    return responde.data;
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    return [];
  }
};

const tryLogin = async (data) => {
  try {
    const response = await api.post("/login", data);

    if (response.data.token) {
      Cookies.set("token", response.data.token); // chnage to the Cookies
    }

    return response.data;
  } catch (error) {
    return { success: false, message: "Error desconocido" };
  }
};


 
const tryRegister = async (data) => {
  try {
    await api.post("/register", data);
  } catch (error) {
    console.error("Error en el registro:", error.response?.data || error.message);
  }
};

const tryLogout = async () => {
  Cookies.remove("token"); // Change to the Cookies
};

export { GetAllUsers, tryLogin, tryRegister, tryLogout };
