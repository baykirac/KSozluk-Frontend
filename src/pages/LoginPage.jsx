import { Login } from "@bs/login";
import { saveUserData } from "../services/userService";
import { useNavigate } from "react-router-dom"; 
import '../App.css';

function LoginPage() {
  const navigate = useNavigate(); 

  const handleSuccess = (data) => {
    saveUserData(data);
    navigate("/"); 
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