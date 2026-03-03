"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/database";

interface UseUserReturn {
  userName: string;
  userEmail: string;
  userRole: UserRole | null;
  userId: string | null;
  isLoading: boolean;
}

export function useUser(): UseUserReturn {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
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
        setUserId(user.id);

        // Fetch role from user_accounts
        const { data: account } = await supabase
          .from("user_accounts")
          .select("role")
          .eq("id", user.id)
          .single() as { data: { role: UserRole } | null };

        if (account) {
          setUserRole(account.role);
        }
      }

      setIsLoading(false);
    }

    fetchUser();
  }, []);

  return { userName, userEmail, userRole, userId, isLoading };
}
