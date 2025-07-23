import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Briefcase,
  GraduationCap,
  Globe,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

interface UserInfo {
  id: number;
  first_name: string;
  last_name: string;
  username?: string;
  nickname?: string;
  email: string;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  birth_date?: string;
  gender?: string;
  relationship_status?: string;
  work?: string;
  education?: string;
  avatar?: string;
  cover_photo?: string;
  created_at: string;
}

interface UserInfoPageProps {
  userToken: string;
  currentUserId: number;
}

export function UserInfoPage({ userToken, currentUserId }: UserInfoPageProps) {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPrivateInfo, setShowPrivateInfo] = useState(false);

  const isOwnProfile = userId ? parseInt(userId) === currentUserId : false;

  useEffect(() => {
    fetchUserInfo();
  }, [userId]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch(
        userId
          ? `http://localhost:8000/users/${userId}/profile`
          : "http://localhost:8000/auth/me",
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      }
    } catch (error) {
      console.error("Erro ao carregar informações do usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGenderText = (gender?: string) => {
    const genderMap: { [key: string]: string } = {
      male: "Masculino",
      female: "Feminino",
      other: "Outro",
      prefer_not_to_say: "Prefiro não dizer",
    };
    return gender ? genderMap[gender] || gender : "";
  };

  const getRelationshipStatusText = (status?: string) => {
    const statusMap: { [key: string]: string } = {
      single: "Solteiro(a)",
      in_relationship: "Em um relacionamento",
      married: "Casado(a)",
      divorced: "Divorciado(a)",
      widowed: "Viúvo(a)",
      complicated: "É complicado",
    };
    return status ? statusMap[status] || status : "";
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Usuário não encontrado</p>
        </div>
      </div>
    );
  }

  const InfoSection = ({
    title,
    children,
    isPrivate = false,
  }: {
    title: string;
    children: React.ReactNode;
    isPrivate?: boolean;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {isPrivate && !isOwnProfile && (
          <Lock className="w-5 h-5 text-gray-400" />
        )}
      </div>
      {children}
    </div>
  );

  const InfoItem = ({
    icon: Icon,
    label,
    value,
    isPrivate = false,
    isLink = false,
  }: {
    icon: any;
    label: string;
    value?: string | null;
    isPrivate?: boolean;
    isLink?: boolean;
  }) => {
    if (!value) return null;

    const shouldHide = isPrivate && !isOwnProfile && !showPrivateInfo;

    return (
      <div className="flex items-center space-x-3 py-2">
        <Icon className="w-5 h-5 text-gray-500 flex-shrink-0" />
        <div className="flex-1">
          <span className="text-sm text-gray-600">{label}</span>
          <div className="font-medium text-gray-900">
            {shouldHide ? (
              <span className="text-gray-400">••••••••</span>
            ) : isLink ? (
              <a
                href={value.startsWith("http") ? value : `https://${value}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                {value}
              </a>
            ) : (
              value
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Informações de {userInfo.first_name} {userInfo.last_name}
          </h1>
          <p className="text-gray-600">
            {isOwnProfile
              ? "Suas informações pessoais"
              : "Informações públicas do usuário"}
          </p>
        </div>
      </div>

      {/* Privacy Toggle for non-own profiles */}
      {!isOwnProfile && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">
                Informações Privadas
              </h3>
              <p className="text-sm text-blue-700">
                Algumas informações podem estar ocultas para proteger a
                privacidade
              </p>
            </div>
            <button
              onClick={() => setShowPrivateInfo(!showPrivateInfo)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showPrivateInfo ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              <span>{showPrivateInfo ? "Ocultar" : "Mostrar"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <InfoSection title="Informações Básicas">
        <div className="space-y-2">
          <InfoItem
            icon={User}
            label="Nome completo"
            value={`${userInfo.first_name} ${userInfo.last_name}`}
          />
          {userInfo.username && (
            <InfoItem
              icon={User}
              label="Nome de usuário"
              value={`@${userInfo.username}`}
            />
          )}
          {userInfo.nickname && (
            <InfoItem icon={User} label="Apelido" value={userInfo.nickname} />
          )}
          <InfoItem
            icon={Mail}
            label="Email"
            value={userInfo.email}
            isPrivate={true}
          />
          {userInfo.phone && (
            <InfoItem
              icon={Phone}
              label="Telefone"
              value={userInfo.phone}
              isPrivate={true}
            />
          )}
          {userInfo.birth_date && (
            <InfoItem
              icon={Calendar}
              label="Data de nascimento"
              value={new Date(userInfo.birth_date).toLocaleDateString("pt-BR")}
              isPrivate={true}
            />
          )}
          {userInfo.gender && (
            <InfoItem
              icon={User}
              label="Gênero"
              value={getGenderText(userInfo.gender)}
              isPrivate={true}
            />
          )}
        </div>
      </InfoSection>

      {/* Contact & Location */}
      {(userInfo.location || userInfo.website) && (
        <InfoSection title="Localização e Contatos">
          <div className="space-y-2">
            {userInfo.location && (
              <InfoItem
                icon={MapPin}
                label="Localização"
                value={userInfo.location}
              />
            )}
            {userInfo.website && (
              <InfoItem
                icon={Globe}
                label="Website"
                value={userInfo.website}
                isLink={true}
              />
            )}
          </div>
        </InfoSection>
      )}

      {/* Professional Information */}
      {(userInfo.work || userInfo.education) && (
        <InfoSection title="Carreira e Educação">
          <div className="space-y-2">
            {userInfo.work && (
              <InfoItem
                icon={Briefcase}
                label="Trabalho"
                value={userInfo.work}
              />
            )}
            {userInfo.education && (
              <InfoItem
                icon={GraduationCap}
                label="Educação"
                value={userInfo.education}
              />
            )}
          </div>
        </InfoSection>
      )}

      {/* Personal Information */}
      {userInfo.relationship_status && (
        <InfoSection title="Informações Pessoais">
          <div className="space-y-2">
            <InfoItem
              icon={Heart}
              label="Status de relacionamento"
              value={getRelationshipStatusText(userInfo.relationship_status)}
            />
          </div>
        </InfoSection>
      )}

      {/* Bio */}
      {userInfo.bio && (
        <InfoSection title="Sobre">
          <p className="text-gray-700 leading-relaxed">{userInfo.bio}</p>
        </InfoSection>
      )}

      {/* Account Information */}
      <InfoSection title="Informações da Conta">
        <div className="space-y-2">
          <InfoItem
            icon={Calendar}
            label="Membro desde"
            value={new Date(userInfo.created_at).toLocaleDateString("pt-BR")}
          />
          <InfoItem
            icon={User}
            label="ID do usuário"
            value={userInfo.id.toString()}
          />
        </div>
      </InfoSection>
    </div>
  );
}
