import { useForm } from "react-hook-form";
import { tryLogin } from "@/API";
import { useNavigate } from "react-router";


const FormLogin = () => {

  const navigate = useNavigate()
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

  return (
    <>
      <h1>Login</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
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
        <button>Send</button>
      </form>
    </>
  );
};

export default FormLogin;
