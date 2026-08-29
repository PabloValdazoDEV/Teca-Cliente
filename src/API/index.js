import api from "@/API/api";

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
  const response = await api.post("/login", data);
  return response.data;
};

const tryRegister = async (data) => {
  const response = await api.post("/register", data);
  return response.data;
};

const tryLogout = async () => {
  await api.post("/logout");
};

const getCurrentUser = async () => {
  const response = await api.get("/me");
  return response.data;
};

const forgotPassword = async (email) => {
  const response = await api.post("/forgot-password", { email });
  return response.data;
};

const resetPassword = async (token, password) => {
  const response = await api.post("/reset-password", { token, password });
  return response.data;
};

const updateProfile = async (data) => {
  const response = await api.put("/me", data);
  return response.data;
};

const updatePassword = async (data) => {
  const response = await api.put("/me/password", data);
  return response.data;
};

const getEmployees = async () => {
  const response = await api.get("/users");
  return response.data;
};

const updateEmployee = async (id, data) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
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
    return response.data;
  } catch (error) {
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
  const response = await api.get("/citas/users");
  return response.data;
}

const getPractitioners = async (includeInactive = false) => {
  const response = await api.get("/practitioners", {
    params: includeInactive ? { includeInactive: true } : {},
  });
  return response.data;
};

const createPractitioner = async (data) => {
  const response = await api.post("/practitioners", data);
  return response.data;
};

const updatePractitioner = async (id, data) => {
  const response = await api.put(`/practitioners/${id}`, data);
  return response.data;
};

const invitePractitioner = async (id, email) => {
  const response = await api.post(`/practitioners/${id}/invite`, { email });
  return response.data;
};

const getClinic = async () => {
  const response = await api.get("/clinic");
  return response.data;
};

const getAppConfig = async () => {
  const response = await api.get("/app-config");
  return response.data;
};

const updateClinic = async (data) => {
  const response = await api.put("/clinic", data);
  return response.data;
};

const getSystemStatus = async () => {
  const response = await api.get("/system-status");
  return response.data;
};

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

const searchCustomers = async (query) => {
  const response = await api.get("/customers/search", { params: { q: query } });
  return response.data;
};

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

const getCustomerDetail = async (id) => {
  const response = await api.get(`/customers/detail/${id}`);
  return response.data;
};

const uploadCustomerDocument = async (customerId, file) => {
  const body = new FormData();
  body.append("file", file);
  const response = await api.post(`/docs/customer/${customerId}/upload`, body);
  return response.data;
};

const createCustomerTemplates = async (customerId) => {
  const response = await api.post(`/docs/customer/${customerId}/templates`, {});
  return response.data;
};

const uploadDocumentVersion = async (docId, file) => {
  const body = new FormData();
  body.append("file", file);
  const response = await api.post(`/docs/file/${docId}/version`, body);
  return response.data;
};

const getDocumentBlob = async (docId, version) => {
  const response = await api.get(`/docs/file/${docId}/content`, {
    params: version ? { version } : {},
    responseType: "blob",
  });
  return response.data;
};

const getDocumentMetadata = async (docId) => {
  const response = await api.get(`/docs/file/${docId}`);
  return response.data;
};

const downloadDocument = async (docId, fileName, version) => {
  const response = await api.get(`/docs/file/${docId}/content`, {
    params: { download: true, ...(version ? { version } : {}) },
    responseType: "blob",
  });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || "documento";
  link.click();
  URL.revokeObjectURL(url);
};

const downloadFullExport = async () => {
  const response = await api.get("/docs/export/all", { responseType: "blob" });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = `TECA-export-${new Date().toISOString().slice(0, 10)}.zip`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  return { exportedAt: response.headers["x-teca-exported-at"] || new Date().toISOString() };
};

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
  getCurrentUser,
  forgotPassword,
  resetPassword,
  updateProfile,
  updatePassword,
  getEmployees,
  updateEmployee,
  getDataCalendario,
  getFormDateCreate,
  getFormDateUser,
  postDataCreate,
  deleteDate,
  sendSms,
  putDataEdit,
  getAllUser,
  getPractitioners,
  createPractitioner,
  updatePractitioner,
  invitePractitioner,
  getClinic,
  getAppConfig,
  updateClinic,
  getSystemStatus,
  postCustomerCreate,
  getAllCustomers,
  searchCustomers,
  getCustomerEdit,
  putCustomerEdit,
  getCustomerDate,
  deteleCustomeRelation,
  getAllDoc,
  getCustomerDetail,
  uploadCustomerDocument,
  createCustomerTemplates,
  uploadDocumentVersion,
  getDocumentBlob,
  getDocumentMetadata,
  downloadDocument,
  downloadFullExport,
  getAllFcihas,
  postFcihaCreate,
  DeleteFciha,
  putFcihaEdit,
  postDocCreate,
  DeleteDoc,
};
