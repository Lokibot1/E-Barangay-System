import { useLocation, useNavigate } from "react-router-dom";
import RouteStatusScreen from "../../components/shared/RouteStatusScreen";
import {
  getDefaultAuthenticatedPath,
  isAuthenticated,
} from "../../homepage/services/loginService";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTheme =
    typeof window !== "undefined"
      ? localStorage.getItem("appTheme") || "modern"
      : "modern";
  const homePath = !isAuthenticated() ? "/" : getDefaultAuthenticatedPath();

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(homePath, { replace: true });
  };

  return (
    <RouteStatusScreen
      currentTheme={currentTheme}
      variant="not-found"
      title="The page you're looking for doesn't exist."
      description="The address may be outdated, moved, or entered incorrectly. You can return to the previous page, go back home, or refresh the page and try again."
      detailTitle="Requested Path"
      detailMessage={location.pathname || "/"}
      pathLabel={location.pathname || "/"}
      primaryLabel="Go Home"
      onPrimaryAction={() => navigate(homePath, { replace: true })}
      secondaryLabel="Go Back"
      onSecondaryAction={handleGoBack}
      tertiaryLabel="Reload"
      onTertiaryAction={() => window.location.reload()}
    />
  );
}
