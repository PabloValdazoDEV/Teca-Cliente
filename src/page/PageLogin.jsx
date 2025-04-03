import { useForm } from "react-hook-form";
import { tryLogin } from "@/API";
import { useNavigate } from "react-router";
import { useState } from "react";
import { useEffect } from "react";
import InputForm from "../components/InputForm";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

// import "@/assets/form.css";

const PageLogin = () => {
  const [viewPassword, setViewPassword] = useState(false);

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await tryLogin(data);
      navigate("/home");
      reset();
    } catch (error) {
      console.error("Error en el login:", error);
    }
  };

  useEffect(() => {
    const x = document.getElementById("inputPassword");
    if (viewPassword) {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }, [viewPassword]);

  return (
    <div className="bg-white w-full h-screen flex justify-center items-center">
      <form
        id="login"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5 bg-gray-100 rounded-lg shadow-lg py-20 px-15 w-96 "
      >
        <div className="flex flex-row gap-5 items-center">
          {/* <label id="email">Email</label>
          <input
            type="text"
            {...register("email", { required: true })}
            onInput={(e) => setValue("email", e.target.value.trim())}
          /> */}
          <label id="email" className="text-sm font-medium w-30 text-right">
            Email
          </label>
          <input
            id="email"
            className="w-full bg-white p-2 rounded border border-gray-300 text-black text-sm focus:ring-2 focus:ring-emerald-400 
              hover:outline-1 hover:outline-white 
              focus-visible:outline-1 focus-visible:outline-white"
            placeholder="Ej. ejemplo@gmail.com"
            type="text"
            {...register("email", { required: true })}
            onInput={(e) => setValue("email", e.target.value.trim())}
          />
        </div>

        {errors.email && <p style={{ color: "red" }}>Campo requerido</p>}
        <div className="flex flex-row gap-5 items-center relative">
          {/* <label id="password">Password</label>
          <input
            id="inputPassword"
            type="password"
            {...register("password", {
              required: true,
              pattern: {
                value: /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{7,}$/gm,
                message: "La contraseña no cumple los parametros",
              },
            })}
          /> */}

          <label id="password" className="text-sm font-medium w-30 text-right">
            Contraseña
          </label>
          <input
            id="inputPassword"
            className="w-full bg-white p-2 rounded border border-gray-300 text-black text-sm focus:ring-2 focus:ring-emerald-400 
            hover:outline-1 hover:outline-white 
            focus-visible:outline-1 focus-visible:outline-white"
            placeholder="Ej. *********"
            type="password"
            {...register("password", {
              required: true,
              pattern: {
                value: /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{7,}$/gm,
                message: "La contraseña no cumple los parametros",
              },
            })}
            onInput={(e) => setValue("password", e.target.value.trim())}
          />

          <a
            id="viewPassword"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setViewPassword((prev) => !prev);
            }}
            className="absolute top-auto right-4"
          >
            {viewPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible/>}
          </a>
        </div>

        {errors.password?.type === "required" && (
          <p style={{ color: "red" }}>Campo requerido</p>
        )}
        {errors.password?.type === "pattern" && (
          <p style={{ color: "red" }}>{errors.password.message}</p>
        )}
        <button className="bg-emerald-500 text-white w-full px-4 py-2 rounded cursor-pointer transition-transform duration-200 hover:scale-105">Inicar sesión</button>
      </form>
    </div>
  );
};

export default PageLogin;
