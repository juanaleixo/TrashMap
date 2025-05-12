import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export const useDicaDoDia = () => {
  const [dica, setDica] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDica = async () => {
      const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
      const { data, error } = await supabase
        .from("dicas")
        .select("*")
        .order("id", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.log("Erro ao buscar dica:", error.message);
        setDica(null);
      } else {
        setDica(data?.texto);
      }

      setLoading(false);
    };

    fetchDica();
  }, []);

  return { dica, loading };
};
