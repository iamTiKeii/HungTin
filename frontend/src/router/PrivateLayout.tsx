import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { ProfileModal } from "../components/modals/ProfileModal";
import { ChangePasswordModal } from "../components/modals/ChangePasswordModal";
import { TwoFactorModal } from "../components/modals/TwoFactorModal";
import { toast } from "../lib/toast";

interface PrivateLayoutProps {
  children: React.ReactNode;
  requiredPermission?: string | string[];
}

export const PrivateLayout: React.FC<PrivateLayoutProps> = ({
  children,
  requiredPermission,
}) => {
  const { token, user, loading, hasPermission } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [twoFactorOpen, setTwoFactorOpen] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // Only check permissions after auth loading is complete and user profile is loaded
    if (loading || !token || !user || !requiredPermission) {
      return;
    }

    const hasAny = Array.isArray(requiredPermission)
      ? requiredPermission.some((p) => hasPermission(p))
      : hasPermission(requiredPermission);

    if (!hasAny) {
      toast.error("Bạn không có quyền truy cập vào chức năng này!");
      setShouldRedirect(true);
    }
  }, [token, user, loading, requiredPermission, hasPermission]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-700">
        <span className="loading loading-spinner loading-lg text-amber-500"></span>
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;
  if (shouldRedirect) return <Navigate to="/dashboard" replace />;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-800">
      <Header
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenChangePassword={() => setPasswordOpen(true)}
        onOpenTwoFactor={() => setTwoFactorOpen(true)}
      />
      <div className="flex flex-1 pt-16">
        <Sidebar isOpen={sidebarOpen} />
        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-64px)] bg-[#f8fafc]">
          {children}
        </main>
      </div>

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <ChangePasswordModal isOpen={passwordOpen} onClose={() => setPasswordOpen(false)} />
      <TwoFactorModal isOpen={twoFactorOpen} onClose={() => setTwoFactorOpen(false)} />
    </div>
  );
};
