import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthStore = {
  session: Session | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  initialized: false,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, initialized: true });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session });
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null });
  },
}));
