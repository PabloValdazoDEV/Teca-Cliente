import { useForm } from "react-hook-form";
import { tryRegister } from "@/API";

const FormRegister = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();
  return (
    <>
      <h1>Register</h1>
      <form
        onSubmit={handleSubmit((data) => {
          tryRegister(data);
          reset();
        })}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 5,
            marginBottom: 10,
          }}
        >
          <label id="username">Username</label>
          <input
            type="text"
            {...register("username", { required: true })}
            onBlur={(e) => setValue("username", e.target.value.trim())}
          />
          {errors.username && <p style={{ color: "red" }}>Campo requerido</p>}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 5,
            marginBottom: 20,
          }}
        >
          <label id="username">Password</label>
          <input
            type="password"
            {...register("password", {
              required: true,
              pattern: {
                value: /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{7,}$/gm,
                message: "La contraseña no cumple los parametros",
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
        <button>Register</button>
      </form>
    </>
  );
};

export default FormRegister;
