import { supabase } from './supabase'
import * as FileSystem from 'expo-file-system'
import { decode } from 'base64-arraybuffer'

const BUCKET = 'fotos-instalacao'

export const storageService = {
  async uploadFoto(
    instaladorId: string,
    instalacaoId: string,
    uri: string,
  ): Promise<string> {
    const ext = uri.split('.').pop() ?? 'jpg'
    const fileName = `${Date.now()}.${ext}`
    const path = `${instaladorId}/${instalacaoId}/${fileName}`

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    })

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, decode(base64), {
        contentType: `image/${ext}`,
        upsert: false,
      })

    if (error) throw error

    // Registrar na tabela
    await supabase
      .from('fotos_instalacao')
      .insert({ instalacao_id: instalacaoId, storage_path: path })

    return path
  },

  async getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, expiresIn)
    if (error) throw error
    return data.signedUrl
  },

  async deleteFoto(id: string, path: string): Promise<void> {
    await supabase.storage.from(BUCKET).remove([path])
    await supabase.from('fotos_instalacao').delete().eq('id', id)
  },
}
