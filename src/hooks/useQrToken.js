import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const useQrToken = () => {
  const [loading, setLoading] = useState(true);
  const [mesaInfo, setMesaInfo] = useState(null);
  const [error, setError] = useState(null);

  const query = useQuery();
  const navigate = useNavigate();

  useEffect(() => {
    const token = query.get("token");

    if (token && !localStorage.getItem("mesaId")) {
      axios.post("https://localhost:8080/api/Mesas/token", { token })
        .then((res) => {
          const { mesaId, organizationId, mesaNumero } = res.data;
          localStorage.setItem("mesaId", mesaId);
          localStorage.setItem("organizationId", organizationId);
          setMesaInfo({ mesaId, organizationId, mesaNumero });
        })
        .catch((err) => {
          setError("Token inválido o expirado.");
          console.error("❌ Error validando token:", err);
          navigate("/"); // Redirige a home o error page
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  return { loading, error, mesaInfo };
};
