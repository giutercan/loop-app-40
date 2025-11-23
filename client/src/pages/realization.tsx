import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";

export default function RealizationPage() {
  const [, params] = useRoute("/projects/:id/realisation");
  const projectId = params?.id ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();

  // Redirect immediately to Discovery page with Realization tab (before any queries)
  useEffect(() => {
    if (projectId) {
      setLocation(`/discovery?project=${projectId}&tab=realization`);
    }
  }, [projectId, setLocation]);

  // Return minimal loading state during redirect
  return (
    <div className="flex items-center justify-center h-screen">
      <p data-testid="text-redirecting">Redirecting to Discovery...</p>
    </div>
  );
}
