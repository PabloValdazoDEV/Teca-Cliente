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
      <h2 className="text-xl font-semibold text-gray-900">Crear usuario</h2>
      <form
        className="mt-4 grid gap-4 md:grid-cols-2"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-1 md:col-span-2">
          <label htmlFor="register-email">Email</label>
          <input
            className="rounded border border-gray-300 bg-white p-2"
            id="register-email"
            type="email"
            autoComplete="username"
            {...register("email", { required: true })}
          />
          {errors.email && <p style={{ color: "red" }}>Campo requerido</p>}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="register-name">Nombre</label>
          <input className="rounded border border-gray-300 bg-white p-2" id="register-name" type="text" {...register("name", { required: true, maxLength: 100 })} />
          {errors.name && <p style={{ color: "red" }}>Nombre no válido</p>}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="register-lastName">Apellidos</label>
          <input className="rounded border border-gray-300 bg-white p-2" id="register-lastName" type="text" {...register("lastName", { required: true, maxLength: 100 })} />
          {errors.lastName && <p style={{ color: "red" }}>Apellidos no válidos</p>}
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label htmlFor="register-password">Contraseña</label>
          <input
            className="rounded border border-gray-300 bg-white p-2"
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
        <div className="flex flex-col gap-1">
          <label htmlFor="register-role">Rol</label>
          <select className="rounded border border-gray-300 bg-white p-2" id="register-role" defaultValue="EMPLOYEE" {...register("role")}>
            <option value="EMPLOYEE">Empleado</option>
            {user?.role === "SUPERADMIN" && <option value="ADMIN">Administrador</option>}
          </select>
        </div>
        {status && <p className="md:col-span-2" role="status">{status}</p>}
        <button className="rounded bg-emerald-600 px-4 py-2 font-medium text-white md:col-span-2">Crear usuario</button>
      </form>
    </>
  );
};

export default FormRegister;
