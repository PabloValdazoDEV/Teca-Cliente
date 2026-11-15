import api from "@/API/api";

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

const updateEmployee = async (id, data) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

const getTeam = async () => {
  const response = await api.get("/team");
  return response.data;
};

const createAgendaForAccount = async (userId) => {
  const response = await api.post(`/team/${userId}/agenda`, {});
  return response.data;
};

const updateEmployeeAccess = async (id, active) => {
  const response = await api.put(`/users/${id}/access`, { active });
  return response.data;
};

// Lanza el error: si la agenda no carga, la pantalla debe decirlo en vez de
// mostrar huecos libres que quizá estén ocupados.
const getFormDateUser = async (id, range) => {
  const params = range ? { from: range.start.toISOString(), to: range.end.toISOString() } : undefined;
  const response = await api.get(`/citas/createCalendar/${id}`, { params });
  return response.data;
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
  await api.delete(`/citas/delete/${id}`);
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

// Archivar (solo administración). Si el paciente tiene citas futuras, el servidor
// responde 409 con `futureAppointments` y hay que confirmar su cancelación.
const archiveCustomer = async (id, { cancelFutureAppointments = false } = {}) => {
  const response = await api.post(`/customers/${id}/archive`, { cancelFutureAppointments });
  return response.data;
};

const restoreCustomer = async (id) => {
  const response = await api.post(`/customers/${id}/restore`, {});
  return response.data;
};

const getCustomerDetail = async (id) => {
  const response = await api.get(`/customers/detail/${id}`);
  return response.data;
};

const getCustomerAccessLog = async (id) => {
  const response = await api.get(`/customers/${id}/access-log`);
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

export {
  tryLogin,
  tryRegister,
  tryLogout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  updateProfile,
  updatePassword,
  updateEmployee,
  updateEmployeeAccess,
  getTeam,
  createAgendaForAccount,
  getFormDateUser,
  postDataCreate,
  deleteDate,
  putDataEdit,
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
  archiveCustomer,
  restoreCustomer,
  getCustomerDetail,
  getCustomerAccessLog,
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
  DeleteDoc,
};
