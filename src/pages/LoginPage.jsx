import { Login } from "@bs/login";
import { useNavigate } from "react-router-dom"; 
import '../App.css';
import { useAuth } from "../contexts/AuthContext";

function LoginPage() {
  const navigate = useNavigate(); 
  const {login} = useAuth();
  const handleSuccess = (data) => {
    localStorage.setItem("oztToken", data.token);
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    navigate("/");
    login();
    return data;
  };

  return (
    <div>
      <Login 
        url="http://localhost:5173"
        theme="center"
        image="../../public/tech.gif"
        logo="../../public/logo.png"
        appName="Başarsoft Kavramlar Sözlüğü"
        edevlet={false}
        register={false}
        rememberMe={true}
        captcha={false}
        forgotPassword={false}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

export default LoginPage;