import React, { useState } from "react";
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  LogOut,
  Save,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface User {
  id?: number;
  name: string;
  email: string;
  avatar?: string;
  token: string;
}

interface SettingsPageProps {
  user: User;
  onLogout: () => void;
  onUserUpdate: () => void;
}

export function SimpleSettingsPage({
  user,
  onLogout,
  onUserUpdate,
}: SettingsPageProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const settingsOptions = [
    {
      id: "profile",
      title: "Editar Perfil",
      description: "Gerencie suas informações pessoais",
      icon: User,
      onClick: () => navigate("/edit-profile"),
    },
    {
      id: "privacy",
      title: "Privacidade e Segurança",
      description: "Controle quem pode ver seu conteúdo",
      icon: Shield,
      onClick: () => console.log("Privacy settings"),
    },
    {
      id: "notifications",
      title: "Notificações",
      description: "Configure como você quer ser notificado",
      icon: Bell,
      toggle: true,
      value: notifications,
      onChange: setNotifications,
    },
    {
      id: "appearance",
      title: "Aparência",
      description: "Escolha entre tema claro e escuro",
      icon: Palette,
      toggle: true,
      value: darkMode,
      onChange: setDarkMode,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600">
              Gerencie suas preferências e configurações da conta
            </p>
          </div>
        </div>
      </div>

      {/* Settings Options */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Configurações Gerais
          </h2>
          <div className="space-y-4">
            {settingsOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.id}
                  className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ${
                    !option.toggle ? "cursor-pointer" : ""
                  }`}
                  onClick={!option.toggle ? option.onClick : undefined}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {option.description}
                      </p>
                    </div>
                  </div>

                  {option.toggle ? (
                    <label
                      className="relative inline-flex items-center cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={option.value}
                        onChange={(e) => option.onChange?.(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Salvar Configurações</h3>
            <p className="text-sm text-gray-600">
              Suas alterações serão aplicadas imediatamente
            </p>
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              saved
                ? "bg-green-100 text-green-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Salvando..." : saved ? "Salvo!" : "Salvar"}</span>
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Sair da conta</h3>
            <p className="text-sm text-gray-600">Desconectar-se desta sessão</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
}
