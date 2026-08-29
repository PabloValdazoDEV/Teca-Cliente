/* eslint-disable react/prop-types */
import { useForm } from "react-hook-form";
import { tryRegister } from "@/API";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const FormRegister = ({ onCreated }) => {
  const [status, setStatus] = useState("");
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    setStatus("");

    try {
      const response = await tryRegister(data);
      setStatus("Usuario creado correctamente.");
      reset();
      onCreated?.(response.user);
    } catch (error) {
      setStatus(
        error.response?.data?.message || "No se ha podido crear el usuario."
      );
    }
  };

  return (
    <>
      <h2 style={{ margin: "12px 0 0", fontSize: 19 }}>Crear usuario</h2>
      <form
        className="employee-create-form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="field employee-form-wide">
          <label htmlFor="register-email">Email</label>
          <input
            className="control"
            id="register-email"
            type="email"
            autoComplete="username"
            {...register("email", { required: true })}
          />
          {errors.email && <p style={{ color: "red" }}>Campo requerido</p>}
        </div>
        <div className="field">
          <label htmlFor="register-name">Nombre</label>
          <input className="control" id="register-name" type="text" {...register("name", { required: true, maxLength: 100 })} />
          {errors.name && <p style={{ color: "red" }}>Nombre no válido</p>}
        </div>
        <div className="field">
          <label htmlFor="register-lastName">Apellidos</label>
          <input className="control" id="register-lastName" type="text" {...register("lastName", { required: true, maxLength: 100 })} />
          {errors.lastName && <p style={{ color: "red" }}>Apellidos no válidos</p>}
        </div>
        <div className="field employee-form-wide">
          <label htmlFor="register-password">Contraseña</label>
          <input
            className="control"
            id="register-password"
            type="password"
            autoComplete="new-password"
            {...register("password", {
              required: true,
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
                message: "Usa al menos 8 caracteres, mayúscula, minúscula, número y símbolo",
              },
            })}
          />
          {errors.password?.type === "required" && (
            <p style={{ color: "red" }}>Campo requerido</p>
          )}
          {errors.password?.type === "pattern" && (
            <p style={{ color: "red" }}>{errors.password.message}</p>
          )}
        </div>
        <div className="field">
          <label htmlFor="register-role">Rol</label>
          <select className="control" id="register-role" defaultValue="EMPLOYEE" {...register("role")}>
            <option value="EMPLOYEE">Empleado</option>
            {user?.role === "SUPERADMIN" && <option value="ADMIN">Administrador</option>}
          </select>
        </div>
        {status && <p className="status-message employee-form-wide" role="status">{status}</p>}
        <button className="button-primary employee-form-wide">Crear usuario</button>
      </form>
    </>
  );
};

export default FormRegister;
