"use server";

import { getServerSession } from "../utils/auth/server";
import { AuthProvider } from "./AuthContext";

/**
 * Server Auth Provider
 * Fetches authentication data on the server and passes it to client components
 */
const ServerAuthProvider = async ({ children }) => {
  const { user, session } = await getServerSession();

  // Pass server data to client provider
  return (
    <AuthProvider initialUser={user} initialSession={session}>
      {children}
    </AuthProvider>
  );
};

export default ServerAuthProvider;
