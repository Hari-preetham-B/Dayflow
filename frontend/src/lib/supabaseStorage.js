import { supabase } from './supabase'

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

/**
 * Validates file size and type before uploading to Supabase Storage
 */
export function validateFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected for upload.' };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB).` };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Unsupported file format. Allowed types: JPG, PNG, WEBP, PDF, DOC, DOCX.' };
  }

  return { valid: true, error: null };
}

/**
 * Uploads file directly to Supabase Storage bucket 'employee-documents'.
 * Strictly throws an error on upload failure — NO Base64 Data URL fallback permitted.
 */
export async function uploadFileToStorage(file, folder = 'avatars') {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  // Upload file directly to Supabase Storage bucket 'employee-documents'
  const { data, error } = await supabase.storage
    .from('employee-documents')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Supabase Storage upload error:', error);
    throw new Error(`Upload to Supabase Storage failed: ${error.message}. Please try again.`);
  }

  if (!data?.path) {
    throw new Error('Supabase Storage did not return a valid object path. Please try again.');
  }

  // Obtain public accessible URL from Supabase Storage
  const { data: publicUrlData } = supabase.storage
    .from('employee-documents')
    .getPublicUrl(data.path);

  if (!publicUrlData?.publicUrl) {
    throw new Error('Failed to generate public URL for uploaded file in Supabase Storage.');
  }

  return { 
    url: publicUrlData.publicUrl, 
    name: file.name,
    path: data.path
  };
}
