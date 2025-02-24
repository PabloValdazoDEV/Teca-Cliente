import Cookies from "js-cookie"

const isAuth = () => {
  const token = Cookies.get("token");
  return !!token; 
};

export default isAuth;