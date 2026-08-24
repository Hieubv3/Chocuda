import { createClient } from '@supabase/supabase-js';

// Cấu hình Supabase Storage Client với thông tin dự án của bạn
export const SUPABASE_URL = 'https://xrbjzcwmtjtfckorhvxo.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_4xnfkwHr6Grm6PHe7k_B0g_JsxCVI3X';
export const SUPABASE_BUCKET_NAME = 'media-posts';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Tải file ảnh hoặc video lên Supabase Storage (bucket: media-posts)
 * và trả về Public URL để lưu vào Cloud SQL
 */
export async function uploadMediaToSupabase(
  file: File,
  folder: 'posts' | 'properties' | 'avatars' | 'banners' = 'posts'
): Promise<string> {
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${folder}/${Date.now()}_${cleanFileName}`;

  const { error: uploadError } = await supabase.storage
    .from(SUPABASE_BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    throw new Error('Lỗi upload file lên Supabase Storage: ' + uploadError.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from(SUPABASE_BUCKET_NAME)
    .getPublicUrl(filePath);

  if (!publicUrlData?.publicUrl) {
    throw new Error('Không thể lấy Public URL từ Supabase Storage');
  }

  return publicUrlData.publicUrl;
}
