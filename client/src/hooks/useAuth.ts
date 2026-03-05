import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface AuthSession {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  activeProfile: {
    id: number;
    name: string;
    grade: number;
    avatar: string;
  } | null;
  activeProfileType: "parent" | "child";
}

export function useAuth() {
  const { data: session, isLoading, error } = useQuery<AuthSession>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] }),
  });

  const registerMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] }),
  });

  const kidLoginMutation = useMutation({
    mutationFn: async (data: { email: string; childName: string; pin: string }) => {
      const res = await apiRequest("POST", "/api/auth/kid-login", data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] }),
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] }),
  });

  const switchProfileMutation = useMutation({
    mutationFn: async (profileId: number | null) => {
      const res = await apiRequest("POST", "/api/auth/switch-profile", { profileId });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] }),
  });

  return {
    user: session?.user ?? null,
    activeProfile: session?.activeProfile ?? null,
    activeProfileType: session?.activeProfileType ?? "parent",
    isLoading,
    isAuthenticated: !!session?.user,
    isParent: session?.activeProfileType === "parent",
    isChild: session?.activeProfileType === "child",
    login: loginMutation,
    register: registerMutation,
    kidLogin: kidLoginMutation,
    logout: logoutMutation,
    switchProfile: switchProfileMutation,
  };
}
