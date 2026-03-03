"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface UseUserReturn {
  userName: string;
  userEmail: string;
  isLoading: boolean;
}

export function useUser(): UseUserReturn {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserName(user.user_metadata?.nama || user.email || "User");
        setUserEmail(user.email || "");
      }

      setIsLoading(false);
    }

    fetchUser();
  }, []);

  return { userName, userEmail, isLoading };
}
