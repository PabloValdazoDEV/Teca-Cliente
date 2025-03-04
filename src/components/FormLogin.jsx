import { useForm } from "react-hook-form";
import { tryLogin } from "@/API";
import { useNavigate } from "react-router";
import { useState } from "react";
import { useEffect } from "react";
import "@/assets/form.css";

const FormLogin = () => {
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
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2 className="text-xl text-white">Login</h2>
        <div>
          <label id="email">Email</label>
          <input
            type="text"
            {...register("email", { required: true })}
            onBlur={(e) => setValue("email", e.target.value.trim())}
          />
        </div>
        {errors.email && <p style={{ color: "red" }}>Campo requerido</p>}
        <div>
          <label id="password">Password</label>
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
          />

          <a
          id="viewPassword"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setViewPassword((prev) => !prev);
            }}
          >
            X
          </a>

        </div>

        {errors.password?.type === "required" && (
          <p style={{ color: "red" }}>Campo requerido</p>
        )}
        {errors.password?.type === "pattern" && (
          <p style={{ color: "red" }}>{errors.password.message}</p>
        )}
        <button>Send</button>
      </form>
    </>
  );
};

export default FormLogin;
