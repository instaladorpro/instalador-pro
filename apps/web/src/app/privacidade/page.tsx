import Link from 'next/link';

export default function PrivacidadePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-primary hover:underline mb-6 inline-block">← Voltar</Link>
      <h1 className="text-2xl font-bold text-foreground mb-6">Política de Privacidade</h1>
      <div className="prose prose-sm text-secondary space-y-4">
        <p><strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
        <p>Esta Política de Privacidade está em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).</p>

        <h2 className="text-lg font-semibold text-foreground mt-6">1. Dados Coletados</h2>
        <p>Coletamos os seguintes dados pessoais:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Nome, email, telefone (cadastro)</li>
          <li>CPF/CNPJ (cadastro de clientes)</li>
          <li>Endereço (localização de instalações)</li>
          <li>Fotos (registros de instalações)</li>
          <li>Dados financeiros (valores de serviços e pagamentos)</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground mt-6">2. Finalidade do Tratamento</h2>
        <p>Seus dados são utilizados exclusivamente para:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Gerenciar sua conta e organização</li>
          <li>Fornecer as funcionalidades da plataforma</li>
          <li>Gerar relatórios e análises para sua empresa</li>
          <li>Comunicações sobre o serviço</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground mt-6">3. Base Legal</h2>
        <p>O tratamento de dados é baseado no consentimento do titular e na execução do contrato de prestação de serviços.</p>

        <h2 className="text-lg font-semibold text-foreground mt-6">4. Compartilhamento</h2>
        <p>Não compartilhamos seus dados com terceiros, exceto:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Supabase (infraestrutura de banco de dados e autenticação)</li>
          <li>Sentry (monitoramento de erros — dados anonimizados)</li>
          <li>Quando exigido por lei ou ordem judicial</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground mt-6">5. Seus Direitos (LGPD Art. 18)</h2>
        <p>Você tem direito a:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Acesso:</strong> solicitar cópia de todos os seus dados</li>
          <li><strong>Correção:</strong> corrigir dados incompletos ou incorretos</li>
          <li><strong>Exclusão:</strong> solicitar a eliminação dos seus dados pessoais</li>
          <li><strong>Portabilidade:</strong> exportar seus dados em formato legível</li>
          <li><strong>Revogação:</strong> retirar o consentimento a qualquer momento</li>
        </ul>
        <p>Para exercer seus direitos, acesse Configurações → Privacidade na plataforma ou envie email para <a href="mailto:privacidade@instaladorpro.com.br" className="text-primary">privacidade@instaladorpro.com.br</a>.</p>

        <h2 className="text-lg font-semibold text-foreground mt-6">6. Retenção de Dados</h2>
        <p>Seus dados são mantidos enquanto sua conta estiver ativa. Após exclusão da conta, os dados são mantidos por 30 dias (período de recuperação) e então excluídos permanentemente.</p>

        <h2 className="text-lg font-semibold text-foreground mt-6">7. Segurança</h2>
        <p>Utilizamos criptografia em trânsito (TLS) e em repouso, autenticação JWT, Row Level Security (RLS) para isolamento de dados entre empresas, e auditoria de acessos.</p>

        <h2 className="text-lg font-semibold text-foreground mt-6">8. Encarregado (DPO)</h2>
        <p>Para questões sobre proteção de dados: <a href="mailto:privacidade@instaladorpro.com.br" className="text-primary">privacidade@instaladorpro.com.br</a></p>
      </div>
    </div>
  );
}
