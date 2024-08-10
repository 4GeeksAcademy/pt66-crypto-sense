import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const Logout = () => {
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear the token from localStorage and update the global state
    localStorage.removeItem('token');
    dispatch({ type: 'update_token', token: null });
    dispatch({ type: 'update_user', user: null });

    navigate("/login");
  }, [dispatch, navigate]);

  return null;
};

export default Logout;
