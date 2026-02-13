
import { useEffect, useState } from "react";
import axios from "axios";
import type { Software } from "../libs/types";

interface UseSoftwaresOptions {
  favoritesOnly?: boolean;
  userFavoritesIds?: number[];
  params?: Record<string, any>;
}

export function useSoftwares(options?: UseSoftwaresOptions) {
  const [softwares, setSoftwares] = useState<Software[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchSoftwares = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get<Software[]>("http://localhost:5000/api/auth/softwares", {
          params: options?.params ?? {},
        });
        let data = res.data;
        if (options?.favoritesOnly && options.userFavoritesIds) {
          data = data.filter(s => options.userFavoritesIds!.includes(s.id));
        }
        if (!cancelled) setSoftwares(data);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSoftwares();
    return () => { cancelled = true; };
  }, [JSON.stringify(options?.params), options?.favoritesOnly, JSON.stringify(options?.userFavoritesIds)]);

  const refetch = () => {
    // simple: trigger useEffect by toggling param or rewrite fetch logic
    // pour simplicité tu peux exposer une fonction fetch distincte
  };

  return { softwares, loading, error, refetch };
}
