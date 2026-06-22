import Link from 'next/link';

export default function TermosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-primary hover:underline mb-6 inline-block">← Voltar</Link>
      <h1 className="text-2xl font-bold text-foreground mb-6">Termos de Uso</h1>
      <div className="prose prose-sm text-secondary space-y-4">
        <p><strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}</p>

        <h2 className="text-lg font-semibold text-foreground mt-6">1. Aceitação dos Termos</h2>
        <p>Ao acessar e utilizar a plataforma Instalador Pro, você concorda com estes Termos de Uso. Caso não concorde, não utilize a plataforma.</p>

        <h2 className="text-lg font-semibold text-foreground mt-6">2. Descrição do Serviço</h2>
        <p>O Instalador Pro é uma plataforma SaaS para gestão de empresas de instalação de energia solar, incluindo gerenciamento de instalações, clientes, equipes, estoque, documentos e finanças.</p>

        <h2 className="text-lg font-semibold text-foreground mt-6">3. Cadastro e Conta</h2>
        <p>O usuário é responsável por manter a segurança de suas credenciais de acesso. Cada conta é pessoal e intransferível.</p>

        <h2 className="text-lg font-semibold text-foreground mt-6">4. Uso Adequado</h2>
        <p>O usuário compromete-se a utilizar a plataforma de forma legal e ética, não realizando atividades que violem leis ou direitos de terceiros.</p>

        <h2 className="text-lg font-semibold text-foreground mt-6">5. Propriedade Intelectual</h2>
        <p>Todo o conteúdo da plataforma (código, design, textos) é propriedade do Instalador Pro. Os dados inseridos pelo usuário permanecem de propriedade do usuário.</p>

        <h2 className="text-lg font-semibold text-foreground mt-6">6. Disponibilidade</h2>
        <p>O serviço é fornecido &quot;como está&quot;. Não garantimos disponibilidade ininterrupta, mas nos esforçamos para manter a plataforma operacional.</p>

        <h2 className="text-lg font-semibold text-foreground mt-6">7. Cancelamento</h2>
        <p>O usuário pode cancelar sua conta a qualquer momento. Após o cancelamento, os dados serão mantidos por 30 dias e então excluídos permanentemente, conforme a LGPD.</p>

        <h2 className="text-lg font-semibold text-foreground mt-6">8. Alterações</h2>
        <p>Estes termos podem ser atualizados. Notificaremos os usuários sobre alterações significativas.</p>

        <h2 className="text-lg font-semibold text-foreground mt-6">9. Contato</h2>
        <p>Para dúvidas sobre estes termos, entre em contato: <a href="mailto:contato@instaladorpro.com.br" className="text-primary">contato@instaladorpro.com.br</a></p>
      </div>
    </div>
  );
}
