import React from "react";
import {
  ArrowLeft,
  Shield,
  Eye,
  Database,
  Lock,
  Users,
  AlertCircle,
} from "lucide-react";
import { Logo } from "../components/ui/Logo";

export function PrivacyPolicy() {
  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <Logo />
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-gray-900">
                Política de Privacidade
              </h1>
              <p className="text-sm text-gray-600">
                Última atualização: {new Date().toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Introduction */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                1. Introdução
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Esta Política de Privacidade descreve como coletamos, usamos,
              armazenamos e protegemos suas informações pessoais quando você
              utiliza nossa plataforma social. Estamos comprometidos com a
              transparência e com o cumprimento da Lei Geral de Proteção de
              Dados (LGPD - Lei 13.709/2018).
            </p>
            <p className="text-gray-700 leading-relaxed">
              Esta política se aplica a todos os usuários da nossa plataforma,
              residentes no Brasil ou não, e é parte integrante dos nossos
              Termos de Uso.
            </p>
          </div>

          {/* Legal Basis */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Database className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                2. Base Legal para o Tratamento
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Tratamos seus dados pessoais com base nas seguintes hipóteses
              legais previstas na LGPD:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                <strong>Consentimento:</strong> Para funcionalidades opcionais e
                comunicações de marketing
              </li>
              <li>
                <strong>Execução de contrato:</strong> Para fornecer os serviços
                da plataforma
              </li>
              <li>
                <strong>Legítimo interesse:</strong> Para segurança, prevenção
                de fraudes e melhorias
              </li>
              <li>
                <strong>Cumprimento de obrigação legal:</strong> Para atender
                requisitos legais e regulatórios
              </li>
              <li>
                <strong>Proteção da vida:</strong> Em situações de emergência ou
                risco
              </li>
            </ul>
          </div>

          {/* Data Collection */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Eye className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                3. Dados Coletados
              </h2>
            </div>

            <h3 className="text-lg font-medium text-gray-900 mb-3">
              3.1. Dados fornecidos por você
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-6">
              <li>
                <strong>Informações de conta:</strong> Nome, sobrenome, email,
                senha, data de nascimento, gênero
              </li>
              <li>
                <strong>Informações de perfil:</strong> Foto de perfil,
                biografia, localização (opcional)
              </li>
              <li>
                <strong>Conteúdo:</strong> Posts, fotos, vídeos, comentários,
                mensagens, stories
              </li>
              <li>
                <strong>Contatos:</strong> Lista de amigos e pessoas que você
                segue
              </li>
              <li>
                <strong>Comunicações:</strong> Mensagens enviadas para suporte
                ou feedback
              </li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 mb-3">
              3.2. Dados coletados automaticamente
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-6">
              <li>
                <strong>Dados de uso:</strong> Páginas visitadas, tempo gasto,
                interações com conteúdo
              </li>
              <li>
                <strong>Dados técnicos:</strong> Endereço IP, tipo de
                dispositivo, sistema operacional, navegador
              </li>
              <li>
                <strong>Dados de localização:</strong> Localização aproximada
                baseada no IP (quando permitido)
              </li>
              <li>
                <strong>Cookies:</strong> Preferências, configurações de sessão,
                dados analíticos
              </li>
              <li>
                <strong>Logs de segurança:</strong> Tentativas de login, ações
                de segurança
              </li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 mb-3">
              3.3. Dados de terceiros
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                Informações de outros usuários que mencionam ou marcam você
              </li>
              <li>
                Dados de integração com redes sociais (com seu consentimento)
              </li>
              <li>
                Informações públicas disponíveis online (quando relevante para
                segurança)
              </li>
            </ul>
          </div>

          {/* Data Usage */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                4. Como Usamos seus Dados
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizamos suas informações pessoais para:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-6">
              <li>
                <strong>Fornecer o serviço:</strong> Criar e manter sua conta,
                exibir conteúdo, facilitar conexões
              </li>
              <li>
                <strong>Comunicação:</strong> Enviar notificações, atualizações
                de serviço e respostas de suporte
              </li>
              <li>
                <strong>Personalização:</strong> Customizar sua experiência e
                recomendar conteúdo relevante
              </li>
              <li>
                <strong>Segurança:</strong> Detectar fraudes, prevenir abusos e
                proteger usuários
              </li>
              <li>
                <strong>Melhoria:</strong> Analisar uso para aprimorar
                funcionalidades e performance
              </li>
              <li>
                <strong>Conformidade legal:</strong> Cumprir obrigações legais e
                responder a solicitações judiciais
              </li>
            </ul>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Importante:</strong> Nunca vendemos seus dados pessoais
                para terceiros. Todo tratamento é realizado com base legal
                adequada e com o mínimo de dados necessários.
              </p>
            </div>
          </div>

          {/* Data Sharing */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                5. Compartilhamento de Dados
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Compartilhamos suas informações apenas nas seguintes situações:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-6">
              <li>
                <strong>Com outros usuários:</strong> Conforme suas
                configurações de privacidade
              </li>
              <li>
                <strong>Prestadores de serviço:</strong> Empresas que nos ajudam
                a operar a plataforma (hosting, analytics)
              </li>
              <li>
                <strong>Obrigações legais:</strong> Quando exigido por lei,
                ordem judicial ou autoridades competentes
              </li>
              <li>
                <strong>Proteção de direitos:</strong> Para proteger nossos
                direitos, propriedade ou segurança
              </li>
              <li>
                <strong>Transações corporativas:</strong> Em caso de fusão,
                aquisição ou venda de ativos
              </li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 mb-3">
              5.1. Transferência Internacional
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Caso seja necessário transferir dados para outros países,
              garantiremos proteção adequada através de cláusulas contratuais
              padrão, certificações adequadas ou outras salvaguardas
              reconhecidas pela LGPD.
            </p>
          </div>

          {/* Data Security */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Lock className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                6. Segurança dos Dados
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Implementamos medidas técnicas e organizacionais apropriadas para
              proteger seus dados:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-6">
              <li>
                <strong>Criptografia:</strong> Dados sensíveis são
                criptografados em trânsito e em repouso
              </li>
              <li>
                <strong>Controle de acesso:</strong> Acesso limitado apenas a
                funcionários autorizados
              </li>
              <li>
                <strong>Monitoramento:</strong> Sistemas de detecção de intrusão
                e atividades suspeitas
              </li>
              <li>
                <strong>Backups seguros:</strong> Cópias de segurança
                regularmente testadas
              </li>
              <li>
                <strong>Treinamento:</strong> Funcionários treinados em
                segurança e privacidade
              </li>
              <li>
                <strong>Auditoria:</strong> Revisões regulares de segurança e
                conformidade
              </li>
            </ul>

            <div className="bg-amber-50 p-4 rounded-lg">
              <p className="text-amber-800 text-sm">
                <strong>Lembre-se:</strong> Você também tem responsabilidade na
                segurança. Use senhas fortes, não compartilhe suas credenciais e
                mantenha seus dispositivos seguros.
              </p>
            </div>
          </div>

          {/* Data Retention */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              7. Retenção de Dados
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Mantemos seus dados pelo tempo necessário para cumprir as
              finalidades descritas nesta política:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-6">
              <li>
                <strong>Dados de conta:</strong> Enquanto sua conta estiver
                ativa
              </li>
              <li>
                <strong>Conteúdo publicado:</strong> Até você excluir ou
                encerrar a conta
              </li>
              <li>
                <strong>Dados de comunicação:</strong> 2 anos após a última
                interação
              </li>
              <li>
                <strong>Logs de segurança:</strong> 1 ano para investigações de
                segurança
              </li>
              <li>
                <strong>Dados fiscais:</strong> 5 anos conforme legislação
                brasileira
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Após os períodos de retenção, os dados são excluídos de forma
              segura, exceto quando a manutenção for exigida por lei ou para
              exercício de direitos.
            </p>
          </div>

          {/* User Rights */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                8. Seus Direitos (LGPD)
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Você tem os seguintes direitos em relação aos seus dados pessoais:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-6">
              <li>
                <strong>Acesso:</strong> Saber quais dados temos sobre você
              </li>
              <li>
                <strong>Correção:</strong> Atualizar dados incompletos, inexatos
                ou desatualizados
              </li>
              <li>
                <strong>Exclusão:</strong> Solicitar a eliminação de dados
                desnecessários ou tratados ilegalmente
              </li>
              <li>
                <strong>Portabilidade:</strong> Receber seus dados em formato
                estruturado e de uso comum
              </li>
              <li>
                <strong>Oposição:</strong> Se opor ao tratamento com base em
                legítimo interesse
              </li>
              <li>
                <strong>Revogação:</strong> Retirar consentimento quando for a
                base legal
              </li>
              <li>
                <strong>Informação:</strong> Obter informações sobre entidades
                com quem compartilhamos dados
              </li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 mb-3">
              8.1. Como exercer seus direitos
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para exercer seus direitos, você pode:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Acessar as configurações de privacidade da sua conta</li>
              <li>
                Entrar em contato através do email:
                privacidade@nossa-plataforma.com.br
              </li>
              <li>Usar o formulário de solicitação disponível no suporte</li>
            </ul>
          </div>

          {/* Cookies */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              9. Cookies e Tecnologias Similares
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizamos cookies e tecnologias similares para:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-6">
              <li>
                <strong>Essenciais:</strong> Funcionamento básico da plataforma
                (sempre ativos)
              </li>
              <li>
                <strong>Preferências:</strong> Lembrar suas configurações e
                escolhas
              </li>
              <li>
                <strong>Analytics:</strong> Entender como você usa a plataforma
                (com consentimento)
              </li>
              <li>
                <strong>Marketing:</strong> Personalizar conteúdo e anúncios
                (com consentimento)
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Você pode gerenciar suas preferências de cookies nas configurações
              do seu navegador ou através das nossas configurações de
              privacidade.
            </p>
          </div>

          {/* Minors */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              10. Crianças e Adolescentes
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nossa plataforma é destinada a usuários com 13 anos ou mais. Para
              usuários entre 13 e 18 anos:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Coletamos apenas dados estritamente necessários</li>
              <li>
                Aplicamos configurações de privacidade mais restritivas por
                padrão
              </li>
              <li>Limitamos o compartilhamento de informações</li>
              <li>Fornecemos controles parentais quando apropriado</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Pais ou responsáveis podem solicitar acesso, correção ou exclusão
              dos dados de menores sob sua responsabilidade.
            </p>
          </div>

          {/* Changes */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              11. Alterações nesta Política
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Podemos atualizar esta política ocasionalmente para refletir
              mudanças em nossas práticas, tecnologias ou requisitos legais.
              Alterações significativas serão comunicadas:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Por notificação na plataforma</li>
              <li>Por email para usuários registrados</li>
              <li>Com pelo menos 30 dias de antecedência</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Recomendamos revisar esta política periodicamente para se manter
              informado sobre como protegemos suas informações.
            </p>
          </div>

          {/* Contact DPO */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              12. Contato e Encarregado de Proteção de Dados
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para questões sobre privacidade, exercício de direitos ou
              reclamações:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Encarregado de Proteção de Dados (DPO)
                </h3>
                <ul className="text-gray-700 space-y-1">
                  <li>
                    <strong>Nome:</strong> [Nome do DPO]
                  </li>
                  <li>
                    <strong>Email:</strong> dpo@nossa-plataforma.com.br
                  </li>
                  <li>
                    <strong>Telefone:</strong> (11) 9999-9999
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Autoridade Nacional de Proteção de Dados
                </h3>
                <ul className="text-gray-700 space-y-1">
                  <li>
                    <strong>Site:</strong> www.gov.br/anpd
                  </li>
                  <li>
                    <strong>Email:</strong> comunicacao@anpd.gov.br
                  </li>
                  <li>
                    <strong>Telefone:</strong> (61) 2027-6464
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Final Notice */}
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">
              <strong>Compromisso:</strong> Estamos comprometidos com a
              transparência e proteção da sua privacidade. Esta política está em
              conformidade com a LGPD e será sempre atualizada para refletir as
              melhores práticas de proteção de dados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
