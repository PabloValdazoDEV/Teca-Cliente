import { useNavigate } from 'react-router'
import { tryLogout } from '@/API';

const HomeAuth = () => {
  const navigate = useNavigate()

  const onSubmit = () => {
    tryLogout()
    navigate("/login");
  };

  return (
    <>
      <h1>Logeado 👍🏼</h1>
      <button onClick={onSubmit}>LogOut</button>
    </>
  );
};

export default HomeAuth;
