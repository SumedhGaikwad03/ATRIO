import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
// this improves client side ux control  by ensuring that only authenticated users can access certain routes, 
// and it also provides a better user experience by redirecting unauthenticated users to the login page. and the users with tokens
// can access the rooms and notes page without any issues.
// it can used as a reuable heck point for any future routes that need auth 
