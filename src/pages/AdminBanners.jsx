import React, { useEffect, useRef, useState } from "react";
import { Pencil, Plus, Trash2, Save, X, Upload, Image as ImageIcon, ExternalLink } from "lucide-react";
import { Button, Card, CardContent, Input, Label, Dialog } from "./Admin.jsx";
import { uploadImage, deleteUploadedImage, isUploadedImage } from "../lib/imageUpload.js";

const API_BANNERS = "/.netlify/functions/banners";

export default function BannersSection() {
  const [banners, setBanners] = useState([]);
  const [editing, setEditing] = useState(null);
  const [newBannerId, setNewBannerId] = useState(null);
  const [sessionUpload, setSessionUpload] = useState(null);

  useEffect(() => {
    fetch(`${API_BANNERS}?all=1`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setBanners(d))
      .catch(() => setBanners([]));
  }, []);

  const discard = (close) => {
    const orfa = sessionUpload;
    setSessionUpload(null);
    close();
    if (orfa) deleteUploadedImage(orfa);
  };

  const reconcile = (previous, saved) => {
    const candidatas = [sessionUpload, previous].filter(Boolean);
    setSessionUpload(null);
    candidatas.filter((u) => u !== saved && isUploadedImage(u)).forEach(deleteUploadedImage);
  };

  const remove = async (id) => {
    if (!confirm("Remover este banner? A imagem enviada também será apagada.")) return;
    const res = await fetch(`${API_BANNERS}?id=${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) setBanners((prev) => prev.filter((b) => b.id !== id));
    else alert("Falha ao remover.");
  };

  const toggleActive = async (banner) => {
    const res = await fetch(API_BANNERS, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: banner.id, active: !banner.active }),
    });
    if (res.ok) {
      const data = await res.json();
      setBanners((prev) => prev.map((b) => (b.id === data.id ? data : b)));
    } else alert("Falha ao alterar a visibilidade.");
  };

  const ordenar = (lista) => [...lista].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <ImageIcon className="w-5 h-5" /> Banners da loja
        </h2>
        <Button onClick={() => setNewBannerId(crypto.randomUUID())}>
          <Plus className="w-4 h-4 mr-1" /> Novo banner
        </Button>
      </div>

      <Card>
        <CardContent>
          {banners.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Nenhum banner. Com nenhum banner ativo, a área some da página de produtos.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3 font-medium">Banner</th>
                    <th className="py-2 pr-3 font-medium">Link</th>
                    <th className="py-2 pr-3 font-medium">Ordem</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenar(banners).map((b) => (
                    <tr key={b.id} className="border-b last:border-0">
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <img src={b.image_url} alt="" className="h-10 w-24 rounded object-cover border" />
                          <span className="font-medium">{b.title || <em className="text-neutral-400">sem título</em>}</span>
                        </div>
                      </td>
                      <td className="py-2 pr-3">
                        {b.link_url ? (
                          <a href={b.link_url} target="_blank" rel="sponsored noopener noreferrer" className="inline-flex items-center gap-1 text-[var(--moss)] hover:underline">
                            abrir <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="py-2 pr-3 text-neutral-600">{b.sort_order}</td>
                      <td className="py-2 pr-3">
                        <button
                          type="button"
                          onClick={() => toggleActive(b)}
                          className={`rounded px-2 py-0.5 text-xs ${b.active ? "bg-green-100 text-green-800" : "bg-neutral-200 text-neutral-600"}`}
                        >
                          {b.active ? "Publicado" : "Pausado"}
                        </button>
                      </td>
                      <td className="py-2 text-right whitespace-nowrap">
                        <Button variant="secondary" className="mr-2" onClick={() => setEditing(b)}>
                          <Pencil className="w-4 h-4 mr-1" /> Editar
                        </Button>
                        <Button variant="destructive" onClick={() => remove(b.id)}>
                          <Trash2 className="w-4 h-4 mr-1" /> Remover
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {newBannerId && (
        <Dialog onClose={() => discard(() => setNewBannerId(null))}>
          <h3 className="text-lg font-semibold mb-2">Novo banner</h3>
          <BannerForm
            initial={{ id: newBannerId, title: "", imageUrl: "", linkUrl: "", sortOrder: banners.length, active: true }}
            onUploaded={setSessionUpload}
            onCancel={() => discard(() => setNewBannerId(null))}
            onSave={async (created) => {
              const res = await fetch(API_BANNERS, {
                method: "POST", credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(created),
              });
              if (res.ok) {
                const data = await res.json();
                setBanners((prev) => [...prev, data]);
                reconcile(null, data.image_url);
                setNewBannerId(null);
              } else alert((await res.json().catch(() => ({}))).error || "Falha ao criar.");
            }}
          />
        </Dialog>
      )}

      {editing && (
        <Dialog onClose={() => discard(() => setEditing(null))}>
          <h3 className="text-lg font-semibold mb-2">Editar banner</h3>
          <BannerForm
            initial={{
              id: editing.id, title: editing.title || "", imageUrl: editing.image_url || "",
              linkUrl: editing.link_url || "", sortOrder: editing.sort_order, active: editing.active,
            }}
            onUploaded={setSessionUpload}
            onCancel={() => discard(() => setEditing(null))}
            onSave={async (patch) => {
              const previous = editing.image_url;
              const res = await fetch(API_BANNERS, {
                method: "PUT", credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patch),
              });
              if (res.ok) {
                const data = await res.json();
                setBanners((prev) => prev.map((b) => (b.id === data.id ? data : b)));
                reconcile(previous, data.image_url);
                setEditing(null);
              } else alert((await res.json().catch(() => ({}))).error || "Falha ao salvar.");
            }}
          />
        </Dialog>
      )}
    </div>
  );
}

function BannerForm({ initial, onSave, onCancel, onUploaded }) {
  const [form, setForm] = useState(() => ({ ...initial }));
  const [uploading, setUploading] = useState(false);
  const [uploadNote, setUploadNote] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef(null);
  // Depende do id: `initial` é literal inline e muda de identidade a cada
  // render do pai, o que zeraria o formulário em digitação.
  useEffect(() => setForm({ ...initial }), [initial.id]);
  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleFile = async (fileList) => {
    const file = (fileList || [])[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    setUploadNote("");
    try {
      const { url, resized } = await uploadImage(file, { kind: "banner", ownerId: form.id });
      update({ imageUrl: url });
      onUploaded?.(url);
      if (resized) setUploadNote("A imagem passava de 1,5 MB e foi redimensionada para caber no limite.");
    } catch (err) {
      setUploadError(err.message);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.imageUrl) return alert("Envie ou cole a imagem do banner.");
    onSave({ ...form, sortOrder: Number(form.sortOrder) || 0 });
  };

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <div>
        <Label>Imagem do banner</Label>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => handleFile(e.target.files)} />
        <Button type="button" variant="secondary" disabled={uploading} onClick={() => fileRef.current?.click()}>
          <Upload className="w-4 h-4 mr-1" /> {uploading ? "Enviando…" : "Enviar do computador"}
        </Button>
        <p className="text-xs text-neutral-500 mt-1">
          Formato ideal 3:1 (ex.: 1800×600). Acima de 1,5 MB a imagem é redimensionada automaticamente
          para no máximo 2560px, mantendo a proporção.
        </p>
        {uploadNote && <p className="text-xs text-neutral-600 mt-1">{uploadNote}</p>}
        {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
        <div className="mt-3">
          <Input value={form.imageUrl} onChange={(e) => update({ imageUrl: e.target.value })} placeholder="ou cole uma URL https://..." />
        </div>
        {form.imageUrl && (
          <div className="relative mt-2">
            <img src={form.imageUrl} alt="" className="aspect-[3/1] w-full rounded-lg border object-cover" />
            <button type="button" className="absolute top-1 right-1 bg-white/80 rounded-full p-1" onClick={() => update({ imageUrl: "" })}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div>
        <Label>Título sobre o banner</Label>
        <Input value={form.title} onChange={(e) => update({ title: e.target.value })} placeholder="Opcional. Ex.: Semana do camping" />
        <p className="text-xs text-neutral-500 mt-1">
          Aparece sobre a imagem e serve de texto alternativo para leitores de tela.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <Label>Link ao clicar</Label>
          <Input value={form.linkUrl} onChange={(e) => update({ linkUrl: e.target.value })} placeholder="https://... (opcional)" />
          <p className="text-xs text-neutral-500 mt-1">
            Link do próprio site abre na mesma aba; link externo abre em nova aba.
          </p>
        </div>
        <div>
          <Label>Ordem</Label>
          <Input type="number" value={form.sortOrder} onChange={(e) => update({ sortOrder: e.target.value })} />
          <p className="text-xs text-neutral-500 mt-1">Menor aparece primeiro.</p>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={!!form.active} onChange={(e) => update({ active: e.target.checked })} />
        Publicado na página de produtos
      </label>

      <div className="flex justify-end gap-2 mt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={uploading}><Save className="w-4 h-4 mr-1" /> Salvar</Button>
      </div>
    </form>
  );
}
