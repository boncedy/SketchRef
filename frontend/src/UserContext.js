import { createContext, useContext } from "react";

export const UserContext = createContext({ id: "public", name: "Guest" });

export function useUser() {
  return useContext(UserContext);
}
