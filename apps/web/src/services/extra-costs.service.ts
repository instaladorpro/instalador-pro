import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function getByInstalacao(instalacaoId: string) {
  const { data, error } = await supabase
    .from('installation_extra_costs')
    .select('*')
    .eq('instalacao_id', instalacaoId)
    .order('data', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function create(orgId: string, input: {
  instalacao_id: string;
  descricao: string;
  valor: number;
  data: string;
  observacao?: string;
  comprovante_url?: string;
}) {
  const { data, error } = await supabase
    .from('installation_extra_costs')
    .insert({ ...input, organization_id: orgId, created_by: (await supabase.auth.getUser()).data.user?.id })
    .select().single();

  if (error) throw new Error(error.message);
  return data;
}

export async function remove(id: string) {
  const { error } = await supabase.from('installation_extra_costs').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function uploadComprovante(orgId: string, file: File) {
  const ext = file.name.split('.').pop() || 'pdf';
  const path = `${orgId}/comprovantes/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from('documentos').upload(path, file, { contentType: file.type });
  if (error) throw new Error(error.message);

  const { data } = await supabase.storage.from('documentos').createSignedUrl(path, 3600);
  return { path, url: data?.signedUrl };
}
