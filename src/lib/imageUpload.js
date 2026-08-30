const API_UPLOAD = "/.netlify/functions/upload_url";

// Acima deste tamanho o arquivo é reprocessado antes de subir.
export const MAX_ORIGINAL_BYTES = 1.5 * 1024 * 1024;
// Limite do maior lado depois do redimensionamento.
export const MAX_EDGE = 2560;

// Um bucket por tipo; ver KINDS em netlify/functions/upload_url.mjs.
const PUBLIC_PREFIXES = [
  "/storage/v1/object/public/trip-images/",
  "/storage/v1/object/public/product-images/",
];

export const isUploadedImage = (url) =>
  typeof url === "string" && PUBLIC_PREFIXES.some((p) => url.includes(p));

/**
 * Só mexe no arquivo quando ele passa de 1,5 MB. A proporção original é sempre
 * preservada e a imagem nunca é ampliada — 2560px é teto do maior lado, não alvo.
 */
export async function prepareImage(file) {
  if (file.size <= MAX_ORIGINAL_BYTES) {
    return { blob: file, contentType: file.type, resized: false };
  }

  let bitmap;
  try {
    // from-image respeita a orientação EXIF (foto de celular deitada).
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(`Não foi possível ler "${file.name}". Envie em JPG, PNG ou WebP.`);
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
  if (!blob) throw new Error(`Falha ao redimensionar "${file.name}".`);
  return { blob, contentType: "image/webp", resized: true };
}

/**
 * Sobe direto para o Supabase com uma URL assinada emitida pela function.
 * O arquivo não passa pela function por causa do teto de 6 MB de payload.
 *
 * @param {File} file
 * @param {{kind: "trip"|"product", ownerId: string}} destino
 */
export async function uploadImage(file, { kind, ownerId }) {
  const { blob, contentType, resized } = await prepareImage(file);

  const res = await fetch(API_UPLOAD, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, ownerId, contentType }),
  });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    throw new Error(error || `Falha ao preparar o envio de "${file.name}".`);
  }
  const { signedUrl, publicUrl } = await res.json();

  const body = new FormData();
  body.append("cacheControl", "3600");
  body.append("", blob, file.name);
  const put = await fetch(signedUrl, { method: "PUT", body });
  if (!put.ok) throw new Error(`Falha ao enviar "${file.name}".`);

  return { url: publicUrl, resized };
}

/** Best-effort: URL externa (colada à mão) é ignorada, não há o que apagar. */
export async function deleteUploadedImage(url) {
  if (!isUploadedImage(url)) return;
  await fetch(`${API_UPLOAD}?url=${encodeURIComponent(url)}`, {
    method: "DELETE",
    credentials: "include",
  }).catch(() => {});
}
