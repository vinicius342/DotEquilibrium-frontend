import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


const Index = () => {
  const navigate = useNavigate();
  useEffect(() => {
    // Troque a lógica abaixo pela sua autenticação real depois
    const isLogged = Boolean(localStorage.getItem("token"));
    if (isLogged) {
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);
  return null;
};

export default Index;
