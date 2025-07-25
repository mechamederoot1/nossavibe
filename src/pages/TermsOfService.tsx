import React from "react";
import { ArrowLeft, Shield, Users, AlertTriangle, Scale } from "lucide-react";
import { Logo } from "../components/ui/Logo";

export function TermsOfService() {
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
                Termos de Uso
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
              <Scale className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                1. Introdução
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Bem-vindo aos Termos de Uso da nossa plataforma social. Estes
              termos estabelecem as regras e condições para o uso dos nossos
              serviços. Ao criar uma conta ou utilizar nossa plataforma, você
              concorda em cumprir estes termos.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Nossa plataforma é operada no Brasil e está sujeita às leis
              brasileiras, incluindo o Marco Civil da Internet (Lei
              12.965/2014), a Lei Geral de Proteção de Dados (LGPD - Lei
              13.709/2018) e o Código de Defesa do Consumidor.
            </p>
          </div>

          {/* Acceptance */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                2. Aceitação dos Termos
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ao utilizar nossos serviços, você declara que:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Tem pelo menos 13 anos de idade</li>
              <li>Possui capacidade legal para aceitar estes termos</li>
              <li>Fornecerá informações verdadeiras e atualizadas</li>
              <li>Cumprirá todas as leis aplicáveis ao usar nossos serviços</li>
              <li>Manterá a segurança e confidencialidade da sua conta</li>
            </ul>
          </div>

          {/* Services Description */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                3. Descrição dos Serviços
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nossa plataforma oferece os seguintes serviços:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Criação e gerenciamento de perfis pessoais</li>
              <li>
                Publicação e compartilhamento de conteúdo (textos, fotos,
                vídeos)
              </li>
              <li>
                Interação com outros usuários através de comentários, curtidas e
                mensagens
              </li>
              <li>Criação e visualização de stories temporários</li>
              <li>Sistema de amizades e seguidores</li>
              <li>Notificações sobre atividades relevantes</li>
            </ul>
          </div>

          {/* User Responsibilities */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                4. Responsabilidades do Usuário
              </h2>
            </div>

            <h3 className="text-lg font-medium text-gray-900 mb-3">
              4.1. Conduta Proibida
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              É expressamente proibido:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-6">
              <li>
                Publicar conteúdo ilegal, ofensivo, discriminatório ou que viole
                direitos de terceiros
              </li>
              <li>
                Fazer upload de material protegido por direitos autorais sem
                autorização
              </li>
              <li>Criar contas falsas ou se passar por outra pessoa</li>
              <li>Enviar spam, vírus ou qualquer código malicioso</li>
              <li>Assediar, intimidar ou ameaçar outros usuários</li>
              <li>Violar a privacidade de outros usuários</li>
              <li>
                Usar a plataforma para atividades comerciais não autorizadas
              </li>
              <li>
                Tentar acessar contas de outros usuários ou sistemas da
                plataforma
              </li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 mb-3">
              4.2. Conteúdo do Usuário
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Você é totalmente responsável pelo conteúdo que publica e deve
              garantir que:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Possui todos os direitos necessários sobre o conteúdo</li>
              <li>O conteúdo não viola leis ou direitos de terceiros</li>
              <li>O conteúdo está em conformidade com estes termos</li>
            </ul>
          </div>

          {/* Intellectual Property */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              5. Propriedade Intelectual
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              A plataforma e todo seu conteúdo (exceto o conteúdo do usuário)
              são protegidos por direitos autorais, marcas registradas e outras
              leis de propriedade intelectual. Você não pode copiar, distribuir,
              modificar ou criar obras derivadas sem autorização expressa.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Ao publicar conteúdo, você nos concede uma licença não exclusiva,
              transferível, sublicenciável, livre de royalties e mundial para
              usar, hospedar, armazenar, reproduzir, modificar, criar obras
              derivadas, comunicar, publicar, exibir publicamente e distribuir
              tal conteúdo.
            </p>
          </div>

          {/* Privacy and Data Protection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              6. Privacidade e Proteção de Dados
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Respeitamos sua privacidade e estamos comprometidos com a proteção
              dos seus dados pessoais em conformidade com a Lei Geral de
              Proteção de Dados (LGPD). Nossa Política de Privacidade detalha
              como coletamos, usamos, armazenamos e protegemos suas informações.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Você tem direitos garantidos pela LGPD, incluindo acesso,
              correção, exclusão e portabilidade dos seus dados. Para exercer
              esses direitos, entre em contato conosco através dos canais
              oficiais.
            </p>
          </div>

          {/* Suspension and Termination */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              7. Suspensão e Encerramento
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Reservamo-nos o direito de suspender ou encerrar sua conta a
              qualquer momento se:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Você violar estes termos de uso</li>
              <li>
                Seu comportamento prejudicar outros usuários ou a plataforma
              </li>
              <li>Detectarmos atividade suspeita ou fraudulenta</li>
              <li>For necessário para cumprir obrigações legais</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Você pode encerrar sua conta a qualquer momento através das
              configurações do seu perfil. Alguns dados podem ser mantidos
              conforme exigido por lei ou para fins legítimos de negócio.
            </p>
          </div>

          {/* Disclaimer */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              8. Isenção de Responsabilidade
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nossa plataforma é fornecida "como está" e "conforme disponível".
              Não garantimos que o serviço será ininterrupto, livre de erros ou
              totalmente seguro. Você usa a plataforma por sua própria conta e
              risco.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Não somos responsáveis por conteúdo de terceiros, interações entre
              usuários, ou danos indiretos, incidentais ou consequenciais que
              possam resultar do uso da plataforma.
            </p>
          </div>

          {/* Changes to Terms */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              9. Alterações nos Termos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Podemos modificar estes termos a qualquer momento. Alterações
              significativas serão notificadas com pelo menos 30 dias de
              antecedência através da plataforma ou por email.
            </p>
            <p className="text-gray-700 leading-relaxed">
              O uso continuado da plataforma após as alterações constitui
              aceitação dos novos termos. Se você não concordar com as
              alterações, deve encerrar sua conta.
            </p>
          </div>

          {/* Governing Law */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              10. Lei Aplicável e Jurisdição
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Estes termos são regidos pelas leis brasileiras. Qualquer disputa
              será resolvida nos tribunais brasileiros competentes, conforme
              determina o Código de Processo Civil.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Antes de recorrer ao judiciário, tentaremos resolver disputas
              através de mediação ou arbitragem, conforme previsto na Lei de
              Arbitragem (Lei 9.307/96).
            </p>
          </div>

          {/* Contact */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              11. Contato
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para dúvidas sobre estes termos, sugestões ou reclamações, entre
              em contato conosco:
            </p>
            <ul className="text-gray-700 space-y-2">
              <li>
                <strong>Email:</strong> legal@nossa-plataforma.com.br
              </li>
              <li>
                <strong>Telefone:</strong> (11) 9999-9999
              </li>
              <li>
                <strong>Endereço:</strong> Rua Exemplo, 123 - São Paulo, SP -
                CEP: 01234-567
              </li>
              <li>
                <strong>CNPJ:</strong> 00.000.000/0001-00
              </li>
            </ul>
          </div>

          {/* Final Notice */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Importante:</strong> Estes termos constituem um acordo
              legal entre você e nossa empresa. Leia-os cuidadosamente e
              consulte um advogado se tiver dúvidas sobre seus direitos e
              obrigaç��es.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
