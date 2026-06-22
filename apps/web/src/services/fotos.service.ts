import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function upload(orgId: string, instalacaoId: string, file: File, categoria: string, descricao?: string) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.');
  }
  if (file.size > MAX_SIZE) {
    throw new Error('Arquivo muito grande. Máximo 10MB.');
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${orgId}/${instalacaoId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('fotos-instalacao')
    .upload(path, file, { contentType: file.type });

  if (uploadError) throw new Error(uploadError.message);

  const { data, error } = await supabase
    .from('fotos_instalacao')
    .insert({ instalacao_id: instalacaoId, organization_id: orgId, storage_path: path, categoria, descricao })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getByInstalacao(instalacaoId: string) {
  const { data, error } = await supabase
    .from('fotos_instalacao')
    .select('*')
    .eq('instalacao_id', instalacaoId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getSignedUrl(path: string) {
  const { data, error } = await supabase.storage
    .from('fotos-instalacao')
    .createSignedUrl(path, 3600);

  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function remove(id: string, storagePath: string) {
  await supabase.storage.from('fotos-instalacao').remove([storagePath]);
  const { error } = await supabase.from('fotos_instalacao').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
