import api from "@/API/api";
import Cookies from "js-cookie";

const GetAllUsers = async () => {
  try {
    const responde = await api.get("/users");
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
      Cookies.set("token", response.data.token);
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
    console.error(
      "Error en el registro:",
      error.response?.data || error.message
    );
  }
};

const tryLogout = async () => {
  Cookies.remove("token");
};

const getDataCalendario = async (trabajador) => {
  try {
    const response = await api.get(
      `/citas/calendario?trabajador=${trabajador}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const getFormDateCreate = async () => {
  try {
    const response = await api.get("/citas/createForm");

    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const getFormDateUser = async (id) => {
  try {
    const response = await api.get(
      `/citas/createCalendar/${id}`
    );

    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const postDataCreate = async (data) => {
  try {
  const response = await api.post("/citas/dateCreate", data);
    return response.data;
  } catch (error) {
    console.error("Error en putDataEdit:", error);
    throw error;
  }
};

const deleteDate = async (id) => {
  try {
    await api.delete(`/citas/delete/${id}`,);
  } catch (error) {
    console.error(error);
  }
};

const sendSms = async (phone, message) => {

  try {
    const response = await api.post('/citas/sendCommunication', {
      to: `+34${phone}`,
      message
    });
    setStatus('Mensaje enviado con éxito!');
  } catch (error) {
    setStatus('Error enviando el mensaje');
    console.error(error);
    return { error: error.response?.data?.message || error.message }
  }
};

const putDataEdit = async (data) => {
  try {
    const response = await api.put("/citas/update", data);
    return response.data;
  } catch (error) {
    console.error("Error en putDataEdit:", error);
    throw error;
  }
};

const getAllUser = async () => {
  try {
    const data = await api.get("/citas/users")
    return data.data
  } catch (error) {
    console.error(error)
    return { error: error.response?.data?.message || error.message }
  }
}

const postCustomerCreate = async (data) => {
  try {
    const response = await api.post("/customers/create", data);
      return response.data;
    } catch (error) {
      console.error("Error en postCustomerCreate:", error);
      throw error;
    }
}

const getAllCustomers = async (params = {}) => {
  try {
    const response = await api.get('/customers/all', { params });
    return response.data
  } catch (error) {
    console.error("Error en getAllCustomers:", error);
    throw error;
  }
}

const getCustomerEdit = async (customerId) => {
  try {
    const response = await api.get(`/customers/edit/${customerId}`)
    return response.data
  } catch (error) {
    console.error("Error en getCustomerEdit:", error);
    throw error;
  }
}

const putCustomerEdit = async (data) => {
  try {
    await api.put("/customers/edit", data)
  } catch (error) {
    console.error("Error en putCustomerEdit:", error);
    throw error;
  }
}

const getCustomerDate = async (id) => {
  try {
    const response = await api.get(`/customers/delete/${id}`)
    return response.data
  } catch (error) {
    console.error("Error en getCustomerDate:", error);
    throw error;
  }
}

const deteleCustomeRelation = async (id) =>{
  try {
    await api.delete(`/customers/delete/${id}`)
  } catch (error) {
    console.error("Error en deteleCustomeRelation:", error);
    throw error;
  }
} 

const getAllDoc = async (id) => {
  try {
    const response = await api.get(`/docs/${id}`)
    return response.data
  } catch (error) {
    console.error("Error en getAllDoc:", error);
    throw error;
  }
}

const getAllFcihas = async (id) => {
  try {
    const response = await api.get(`/docs/ficha/${id}`)
    return response.data
  } catch (error) {
    console.error("Error en getAllFcihas:", error);
    throw error;
  }
}

const postFcihaCreate = async (data) =>{

  try {
    await api.post(`/docs/ficha/${data.docId}`, data)
  } catch (error) {
    console.error("Error en postFcihaCreate:", error);
    throw error;
  }
}

const DeleteFciha = async (data) =>{

  try {
    await api.delete(`/docs/ficha/${data}`)
  } catch (error) {
    console.error("Error en DeleteFciha:", error);
    throw error;
  }
}

const DeleteDoc = async (data) =>{

  try {
    await api.delete(`/docs/${data}`)
  } catch (error) {
    console.error("Error en DeleteDoc:", error);
    throw error;
  }
}

const putFcihaEdit = async (data) =>{

  try {
    await api.put(`/docs/ficha/${data.fichaId}`, data)
  } catch (error) {
    console.error("Error en putFcihaEdit:", error);
    throw error;
  }
}

const postDocCreate = async (data) =>{

  try {
    await api.post(`/docs/${data}`, data)
  } catch (error) {
    console.error("Error en postDocCreate:", error);
    throw error;
  }
}

export {
  GetAllUsers,
  tryLogin,
  tryRegister,
  tryLogout,
  getDataCalendario,
  getFormDateCreate,
  getFormDateUser,
  postDataCreate,
  deleteDate,
  sendSms,
  putDataEdit,
  getAllUser,
  postCustomerCreate,
  getAllCustomers,
  getCustomerEdit,
  putCustomerEdit,
  getCustomerDate,
  deteleCustomeRelation,
  getAllDoc,
  getAllFcihas,
  postFcihaCreate,
  DeleteFciha,
  putFcihaEdit,
  postDocCreate,
  DeleteDoc,
};
