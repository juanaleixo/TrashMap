import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export const useMateriais = () => {
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMateriais = async () => {
      const { data, error } = await supabase
        .from("materials") // ou o nome exato da sua tabela
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Erro ao buscar materiais:", error.message);
      } else {
        setMateriais(data);
      }

      setLoading(false);
    };

    fetchMateriais();
  }, []);

  return { materiais, loading };
};
