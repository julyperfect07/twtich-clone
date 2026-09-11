import { toast } from "sonner";
import { useEffect, useState } from "react";
import { JwtPayload, jwtDecode } from "jwt-decode";

import { createViewerToken } from "@/actions/token";

export const useViewerToken = (hostIdentity: string) => {
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [identity, setIdentity] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const createToken = async () => {
      try {
        const viewerToken = await createViewerToken(hostIdentity);
        setToken(viewerToken);

        const decodedToken = jwtDecode(viewerToken) as JwtPayload & { name?: string }
        const name = decodedToken?.name;
        const identity = decodedToken.sub;

        if (identity) {
          setIdentity(identity);
        }

        if (name) {
          setName(name);
        }

      } catch (error) {
        console.error("Failed to create a LiveKit viewer token", error);
        setError(true);
        toast.error("Could not connect to the stream");
      }
    }

    createToken();
  }, [hostIdentity]);

  return {
    token,
    name,
    identity,
    error,
  };
};
