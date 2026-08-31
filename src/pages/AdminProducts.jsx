import React, { useEffect, useRef, useState } from "react";
import { Pencil, Plus, Trash2, Save, X, Upload, ShoppingBag, ExternalLink } from "lucide-react";
import { NumericFormat } from "react-number-format";
import { Button, Card, CardContent, Input, Label, Textarea, Dialog } from "./Admin.jsx";
import { uploadImage, deleteUploadedImage, isUploadedImage } from "../lib/imageUpload.js";
import { CATEGORY_VALUES, subcategoriesOf } from "../lib/products.js";
import { formatBRL } from "../lib/format.js";

const API_PRODUCTS = "/.netlify/functions/products";

export default function ProductsSection() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [newProductId, setNewProductId] = useState(null);
  // Imagem enviada neste diálogo, para descartar caso não seja salva.
  const [sessionUpload, setSessionUpload] = useState(null);

  useEffect(() => {
    fetch(`${API_PRODUCTS}?all=1`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setProducts(d))
      .catch(() => setProducts([]));
  }, []);

  // Cancelar: apaga o que subiu e não chegou a ser salvo.
  const discard = (close) => {
    const orfa = sessionUpload;
    setSessionUpload(null);
    close();
    if (orfa) deleteUploadedImage(orfa);
  };

  // Salvar: apaga a imagem substituída e a que subiu mas ficou de fora.
  const reconcile = (previous, saved) => {
    const candidatas = [sessionUpload, previous].filter(Boolean);
    setSessionUpload(null);
    candidatas.filter((u) => u !== saved && isUploadedImage(u)).forEach(deleteUploadedImage);
  };

  const remove = async (id) => {
    if (!confirm("Remover este produto? A imagem enviada também será apagada.")) return;
    const res = await fetch(`${API_PRODUCTS}?id=${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== id));
    else alert("Falha ao remover.");
  };

  const toggleActive = async (product) => {
    const res = await fetch(API_PRODUCTS, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: product.id, active: !product.active }),
    });
    if (res.ok) {
      const data = await res.json();
      setProducts((prev) => prev.map((p) => (p.id === data.id ? data : p)));
    } else alert("Falha ao alterar a visibilidade.");
  };

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" /> Produtos (afiliados)
        </h2>
        <Button onClick={() => setNewProductId(crypto.randomUUID())}>
          <Plus className="w-4 h-4 mr-1" /> Novo produto
        </Button>
      </div>

      <Card>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-sm text-neutral-500">Nada por aqui.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3 font-medium">Produto</th>
                    <th className="py-2 pr-3 font-medium">Categoria</th>
                    <th className="py-2 pr-3 font-medium">Subcategoria</th>
                    <th className="py-2 pr-3 font-medium">Preço</th>
                    <th className="py-2 pr-3 font-medium">Link</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          {p.image_url && (
                            <img src={p.image_url} alt="" className="h-10 w-10 rounded object-cover border" />
                          )}
                          <span className="font-medium">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-2 pr-3 text-neutral-600">{p.category || "—"}</td>
                      <td className="py-2 pr-3 text-neutral-600">{p.subcategory || "—"}</td>
                      <td className="py-2 pr-3 text-neutral-600">
                        {p.price != null ? formatBRL(p.price) : "—"}
                      </td>
                      <td className="py-2 pr-3">
                        <a
                          href={p.affiliate_url}
                          target="_blank"
                          rel="sponsored noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[var(--moss)] hover:underline"
                        >
                          abrir <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-2 pr-3">
                        <button
                          type="button"
                          onClick={() => toggleActive(p)}
                          className={`rounded px-2 py-0.5 text-xs ${
                            p.active ? "bg-green-100 text-green-800" : "bg-neutral-200 text-neutral-600"
                          }`}
                        >
                          {p.active ? "Publicado" : "Pausado"}
                        </button>
                      </td>
                      <td className="py-2 text-right whitespace-nowrap">
                        <Button variant="secondary" className="mr-2" onClick={() => setEditing(p)}>
                          <Pencil className="w-4 h-4 mr-1" /> Editar
                        </Button>
                        <Button variant="destructive" onClick={() => remove(p.id)}>
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

      {newProductId && (
        <Dialog onClose={() => discard(() => setNewProductId(null))}>
          <h3 className="text-lg font-semibold mb-2">Novo produto</h3>
          <ProductForm
            initial={{
              id: newProductId, name: "", description: "", category: "", subcategory: "",
              price: null, imageUrl: "", affiliateUrl: "", active: true,
            }}
            onUploaded={setSessionUpload}
            onCancel={() => discard(() => setNewProductId(null))}
            onSave={async (created) => {
              const res = await fetch(API_PRODUCTS, {
                method: "POST", credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(created),
              });
              if (res.ok) {
                const data = await res.json();
                setProducts((prev) => [data, ...prev]);
                reconcile(null, data.image_url);
                setNewProductId(null);
              } else alert((await res.json().catch(() => ({}))).error || "Falha ao criar.");
            }}
          />
        </Dialog>
      )}

      {editing && (
        <Dialog onClose={() => discard(() => setEditing(null))}>
          <h3 className="text-lg font-semibold mb-2">Editar produto</h3>
          <ProductForm
            initial={{
              id: editing.id, name: editing.name, description: editing.description || "",
              category: editing.category || "", subcategory: editing.subcategory || "", price: editing.price,
              imageUrl: editing.image_url || "", affiliateUrl: editing.affiliate_url || "",
              active: editing.active,
            }}
            onUploaded={setSessionUpload}
            onCancel={() => discard(() => setEditing(null))}
            onSave={async (patch) => {
              const previous = editing.image_url;
              const res = await fetch(API_PRODUCTS, {
                method: "PUT", credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patch),
              });
              if (res.ok) {
                const data = await res.json();
                setProducts((prev) => prev.map((p) => (p.id === data.id ? data : p)));
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

function ProductForm({ initial, onSave, onCancel, onUploaded }) {
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
      const { url, resized } = await uploadImage(file, { kind: "product", ownerId: form.id });
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
    if (!form.name) return alert("Defina um nome.");
    if (!form.affiliateUrl) return alert("Cole o link do produto no Mercado Livre.");
    onSave({ ...form, price: form.price ?? null });
  };

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <div>
        <Label>Nome do produto</Label>
        <Input value={form.name} onChange={(e) => update({ name: e.target.value })} placeholder="Ex.: Barraca de teto para 2 pessoas" />
      </div>

      <div>
        <Label>Link de afiliado (Mercado Livre)</Label>
        <Input value={form.affiliateUrl} onChange={(e) => update({ affiliateUrl: e.target.value })} placeholder="https://mercadolivre.com/sec/..." />
        <p className="text-xs text-neutral-500 mt-1">
          Cole o link que o Mercado Livre gera para você como afiliado — é ele que garante a comissão.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Categoria</Label>
          <select
            value={form.category}
            // Trocar de categoria zera a subcategoria: a lista depende dela.
            onChange={(e) => update({ category: e.target.value, subcategory: "" })}
            className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--moss)] border-neutral-300"
          >
            <option value="">Selecione</option>
            {CATEGORY_VALUES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Subcategoria</Label>
          <select
            value={form.subcategory}
            onChange={(e) => update({ subcategory: e.target.value })}
            disabled={!form.category}
            className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--moss)] border-neutral-300 disabled:bg-neutral-100 disabled:text-neutral-400"
          >
            <option value="">{form.category ? "Selecione" : "Escolha a categoria antes"}</option>
            {subcategoriesOf(form.category).map((sc) => (
              <option key={sc} value={sc}>{sc}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Preço de referência</Label>
          <NumericFormat
            value={form.price ?? ""}
            onValueChange={(v) => update({ price: typeof v.floatValue === "number" ? v.floatValue : null })}
            customInput={Input}
            thousandSeparator="." decimalSeparator="," decimalScale={2} fixedDecimalScale
            allowNegative={false} prefix="R$ " inputMode="decimal" placeholder="R$ 0,00"
          />
          <p className="text-xs text-neutral-500 mt-1">Opcional. Quem manda é o preço do Mercado Livre na hora da compra.</p>
        </div>
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea rows={3} value={form.description} onChange={(e) => update({ description: e.target.value })} placeholder="Por que vale a pena, para quem serve." />
      </div>

      <div>
        <Label>Imagem</Label>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => handleFile(e.target.files)} />
        <Button type="button" variant="secondary" disabled={uploading} onClick={() => fileRef.current?.click()}>
          <Upload className="w-4 h-4 mr-1" /> {uploading ? "Enviando…" : "Enviar do computador"}
        </Button>
        <p className="text-xs text-neutral-500 mt-1">
          Imagens acima de 1,5 MB são redimensionadas automaticamente para no máximo 2560px, mantendo a proporção original.
        </p>
        {uploadNote && <p className="text-xs text-neutral-600 mt-1">{uploadNote}</p>}
        {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
        <div className="mt-3">
          <Input value={form.imageUrl} onChange={(e) => update({ imageUrl: e.target.value })} placeholder="ou cole uma URL https://..." />
        </div>
        {form.imageUrl && (
          <div className="relative mt-2 w-40">
            <img src={form.imageUrl} alt="" className="w-full h-28 object-cover rounded-lg border" />
            <button type="button" className="absolute top-1 right-1 bg-white/80 rounded-full p-1" onClick={() => update({ imageUrl: "" })}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
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
