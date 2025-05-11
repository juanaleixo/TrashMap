import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export const useMateriais = () => {
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMateriais = async () => {
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .order("created_at", { ascending: true });
        
      const getTextColor = (bgColor) => {
        if (!bgColor || !bgColor.startsWith("#")) return "#000";
        const color = bgColor.replace("#", "");
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 160 ? "#000" : "#fff";
      };

      let processedData = data;
      if (data) {
        processedData = data.map((item) => ({
          ...item,
          textColor: getTextColor(item.color),
        }));
      }

      if (error) {
        console.error("Erro ao buscar materiais:", error.message);
      } else {
        setMateriais(processedData);
      }

      setLoading(false);
    };

    fetchMateriais();
  }, []);

  return { materiais, loading };
};
