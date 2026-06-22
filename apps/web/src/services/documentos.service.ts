import { createClient } from '@/lib/supabase/client';
import { calculateRange } from '@/lib/pagination';

const supabase = createClient();

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export async function list(orgId: string, filters: { tipo?: string; clienteId?: string; instalacaoId?: string; page?: number; limit?: number } = {}) {
  const { tipo, clienteId, instalacaoId, page = 1, limit = 20 } = filters;
  const { from, to } = calculateRange(page, limit);

  let query = supabase
    .from('documentos')
    .select('*, clientes(nome), instalacoes(tipo_servico)', { count: 'exact' })
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (tipo) query = query.eq('tipo', tipo);
  if (clienteId) query = query.eq('cliente_id', clienteId);
  if (instalacaoId) query = query.eq('instalacao_id', instalacaoId);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { data: data || [], count: count || 0, page, totalPages: Math.ceil((count || 0) / limit) };
}

export async function upload(orgId: string, file: File, meta: { tipo: string; nome: string; instalacao_id?: string; cliente_id?: string }) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Tipo de arquivo não permitido. Use PDF, JPEG, PNG ou DOCX.');
  }
  if (file.size > MAX_SIZE) {
    throw new Error('Arquivo muito grande. Máximo 20MB.');
  }

  const ext = file.name.split('.').pop() || 'pdf';
  const path = `${orgId}/docs/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from('documentos').upload(path, file, { contentType: file.type });
  if (uploadError) throw new Error(uploadError.message);

  const { data, error } = await supabase
    .from('documentos')
    .insert({ organization_id: orgId, storage_path: path, ...meta })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getSignedUrl(path: string) {
  const { data, error } = await supabase.storage.from('documentos').createSignedUrl(path, 3600);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function remove(id: string, storagePath: string) {
  await supabase.storage.from('documentos').remove([storagePath]);
  const { error } = await supabase.from('documentos').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
