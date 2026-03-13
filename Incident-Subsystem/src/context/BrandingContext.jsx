import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  clearBarangayLogoDataUrl,
  clearBarangayLogoDataUrlRemote,
  fetchBarangayLogoDataUrlRemote,
  getBarangayLogoDataUrl,
  saveBarangayLogoDataUrlRemote,
  setBarangayLogoDataUrl,
} from "../utils/branding";

const BrandingContext = createContext();
const DEFAULT_FAVICON = "/gulodlogo-circle.png";

const ensureLinkTag = (rel, type) => {
  if (typeof document === "undefined") return null;
  let link = document.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    if (type) link.type = type;
    document.head.appendChild(link);
  }
  return link;
};

export const BrandingProvider = ({ children }) => {
  const [logoDataUrl, setLogoDataUrl] = useState(() => getBarangayLogoDataUrl());
  const logoRef = useRef(logoDataUrl);
  const pollingRef = useRef(false);

  useEffect(() => {
    logoRef.current = logoDataUrl;
  }, [logoDataUrl]);

  useEffect(() => {
    let isMounted = true;

    const syncRemoteLogo = async () => {
      const remote = await fetchBarangayLogoDataUrlRemote();
      if (!isMounted || remote === null) return;
      setBarangayLogoDataUrl(remote);
      setLogoDataUrl(remote || "");
    };

    syncRemoteLogo();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const iconSrc = logoDataUrl || DEFAULT_FAVICON;
    const favicon = ensureLinkTag("icon", "image/png");
    if (favicon) favicon.href = iconSrc;
    const appleIcon = ensureLinkTag("apple-touch-icon");
    if (appleIcon) appleIcon.href = iconSrc;
  }, [logoDataUrl]);

  useEffect(() => {
    let isMounted = true;

    const pollRemoteLogo = async () => {
      if (!isMounted || pollingRef.current) return;
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }
      pollingRef.current = true;
      try {
        const remote = await fetchBarangayLogoDataUrlRemote();
        if (!isMounted || remote === null) return;
        if (remote !== logoRef.current) {
          setBarangayLogoDataUrl(remote);
          setLogoDataUrl(remote || "");
        }
      } finally {
        pollingRef.current = false;
      }
    };

    pollRemoteLogo();
    const intervalId = setInterval(pollRemoteLogo, 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const updateLogo = useCallback(async (dataUrl) => {
    const saved = await saveBarangayLogoDataUrlRemote(dataUrl);
    setBarangayLogoDataUrl(saved);
    setLogoDataUrl(saved || "");
  }, []);

  const resetLogo = useCallback(async () => {
    await clearBarangayLogoDataUrlRemote();
    clearBarangayLogoDataUrl();
    setLogoDataUrl("");
  }, []);

  const value = useMemo(
    () => ({
      logoDataUrl,
      updateLogo,
      resetLogo,
      hasCustomLogo: Boolean(logoDataUrl),
    }),
    [logoDataUrl, updateLogo, resetLogo],
  );

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);
