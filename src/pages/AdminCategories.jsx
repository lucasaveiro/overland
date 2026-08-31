import React, { useEffect, useRef, useState } from "react";
import { Pencil, Plus, Trash2, Save, Tags } from "lucide-react";
import { Button, Card, CardContent, Input, Label, Textarea, Dialog } from "./Admin.jsx";
import { CATEGORY_ICONS, CATEGORY_COLORS, colorClassFor, slugify } from "../lib/products.js";

const API_CATEGORIES = "/.netlify/functions/categories";

export default function CategoriesSection({ onChange }) {
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [criando, setCriando] = useState(false);

  const recarregar = () =>
    fetch(`${API_CATEGORIES}?all=1`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          setCategories(d);
          onChange?.(d);
        }
      })
      .catch(() => setCategories([]));

  useEffect(() => { recarregar(); }, []);

  const remove = async (cat) => {
    const qtd = cat.subcategories?.length || 0;
    const aviso = qtd
      ? `Remover "${cat.name}"? As ${qtd} subcategorias e os vínculos com produtos somem junto. Os produtos em si continuam.`
      : `Remover "${cat.name}"? Os vínculos com produtos somem junto. Os produtos em si continuam.`;
    if (!confirm(aviso)) return;
    const res = await fetch(`${API_CATEGORIES}?id=${cat.id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) recarregar();
    else alert("Falha ao remover.");
  };

  const salvar = async (dados, metodo) => {
    const res = await fetch(API_CATEGORIES, {
      method: metodo,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    if (!res.ok) {
      alert((await res.json().catch(() => ({}))).error || "Falha ao salvar.");
      return false;
    }
    await recarregar();
    return true;
  };

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <Tags className="w-5 h-5" /> Categorias da loja
        </h2>
        <Button onClick={() => setCriando(true)}>
          <Plus className="w-4 h-4 mr-1" /> Nova categoria
        </Button>
      </div>

      <Card>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-sm text-neutral-500">Nenhuma categoria.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3 font-medium">Categoria</th>
                    <th className="py-2 pr-3 font-medium">Endereço</th>
                    <th className="py-2 pr-3 font-medium">Subcategorias</th>
                    <th className="py-2 pr-3 font-medium">Ordem</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="py-2 pr-3">
                        <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${colorClassFor(c.color)}`}>
                          {c.name}
                        </span>
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs text-neutral-500">?c={c.slug}</td>
                      <td className="py-2 pr-3 text-neutral-600">{c.subcategories?.length || 0}</td>
                      <td className="py-2 pr-3 text-neutral-600">{c.sort_order}</td>
                      <td className="py-2 pr-3">
                        <button
                          type="button"
                          onClick={() => salvar({ id: c.id, active: !c.active }, "PUT")}
                          className={`rounded px-2 py-0.5 text-xs ${c.active ? "bg-green-100 text-green-800" : "bg-neutral-200 text-neutral-600"}`}
                        >
                          {c.active ? "Visível" : "Oculta"}
                        </button>
                      </td>
                      <td className="py-2 text-right whitespace-nowrap">
                        <Button variant="secondary" className="mr-2" onClick={() => setEditing(c)}>
                          <Pencil className="w-4 h-4 mr-1" /> Editar
                        </Button>
                        <Button variant="destructive" onClick={() => remove(c)}>
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

      {criando && (
        <Dialog onClose={() => setCriando(false)}>
          <h3 className="text-lg font-semibold mb-2">Nova categoria</h3>
          <CategoryForm
            initial={{ id: null, name: "", slug: "", description: "", icon: "shopping-bag", color: "moss", sortOrder: categories.length, active: true }}
            onCancel={() => setCriando(false)}
            onSave={async (dados) => { if (await salvar(dados, "POST")) setCriando(false); }}
          />
        </Dialog>
      )}

      {editing && (
        <Dialog onClose={() => setEditing(null)}>
          <h3 className="text-lg font-semibold mb-2">Editar categoria</h3>
          <CategoryForm
            initial={{
              id: editing.id, name: editing.name, slug: editing.slug,
              description: editing.description || "", icon: editing.icon, color: editing.color,
              sortOrder: editing.sort_order, active: editing.active,
            }}
            subcategories={editing.subcategories || []}
            onSubcategoriesChange={recarregar}
            onCancel={() => setEditing(null)}
            onSave={async (dados) => { if (await salvar(dados, "PUT")) setEditing(null); }}
          />
        </Dialog>
      )}
    </div>
  );
}

function CategoryForm({ initial, subcategories, onSubcategoriesChange, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({ ...initial }));
  // Enquanto o admin não editar o slug à mão, ele acompanha o nome.
  const slugManual = useRef(Boolean(initial.slug));
  useEffect(() => { setForm({ ...initial }); slugManual.current = Boolean(initial.slug); }, [initial.id]);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));
  const mudarNome = (nome) =>
    update({ name: nome, ...(slugManual.current ? {} : { slug: slugify(nome) }) });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Defina um nome.");
    onSave({ ...form, sortOrder: Number(form.sortOrder) || 0 });
  };

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Nome</Label>
          <Input value={form.name} onChange={(e) => mudarNome(e.target.value)} placeholder="Ex.: Viatura Offgrid" />
        </div>
        <div>
          <Label>Endereço na loja</Label>
          <Input
            value={form.slug}
            onChange={(e) => { slugManual.current = true; update({ slug: e.target.value }); }}
            placeholder="viatura-offgrid"
          />
          <p className="text-xs text-neutral-500 mt-1 break-all">/produtos?c={slugify(form.slug || form.name) || "…"}</p>
        </div>
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea rows={2} value={form.description} onChange={(e) => update({ description: e.target.value })} placeholder="Frase curta que aparece na vitrine." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label>Ícone</Label>
          <select value={form.icon} onChange={(e) => update({ icon: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[var(--moss)]">
            {CATEGORY_ICONS.map((i) => (<option key={i.value} value={i.value}>{i.label}</option>))}
          </select>
        </div>
        <div>
          <Label>Cor da etiqueta</Label>
          <select value={form.color} onChange={(e) => update({ color: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[var(--moss)]">
            {CATEGORY_COLORS.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
          </select>
          <span className={`mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-medium ${colorClassFor(form.color)}`}>
            {form.name || "exemplo"}
          </span>
        </div>
        <div>
          <Label>Ordem</Label>
          <Input type="number" value={form.sortOrder} onChange={(e) => update({ sortOrder: e.target.value })} />
          <p className="text-xs text-neutral-500 mt-1">Menor aparece primeiro.</p>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={!!form.active} onChange={(e) => update({ active: e.target.checked })} />
        Visível na loja
      </label>

      {form.id ? (
        <SubcategoryManager categoryId={form.id} subcategories={subcategories} onChange={onSubcategoriesChange} />
      ) : (
        <p className="rounded-xl bg-[var(--sand)] px-3 py-2 text-xs text-neutral-600">
          Salve a categoria para começar a adicionar subcategorias.
        </p>
      )}

      <div className="flex justify-end gap-2 mt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit"><Save className="w-4 h-4 mr-1" /> Salvar</Button>
      </div>
    </form>
  );
}

function SubcategoryManager({ categoryId, subcategories, onChange }) {
  const [nova, setNova] = useState("");
  const [ocupado, setOcupado] = useState(false);

  const chamar = async (metodo, corpo, id) => {
    setOcupado(true);
    const url = id ? `${API_CATEGORIES}?sub=1&id=${id}` : `${API_CATEGORIES}?sub=1`;
    const res = await fetch(url, {
      method: metodo,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
    setOcupado(false);
    if (!res.ok) {
      alert((await res.json().catch(() => ({}))).error || "Falha na subcategoria.");
      return false;
    }
    await onChange?.();
    return true;
  };

  const adicionar = async (e) => {
    e.preventDefault();
    if (!nova.trim()) return;
    if (await chamar("POST", { categoryId, name: nova.trim(), sortOrder: subcategories.length })) setNova("");
  };

  return (
    <div className="rounded-2xl border border-neutral-200 p-3">
      <Label>Subcategorias</Label>
      <div className="flex gap-2">
        <Input
          value={nova}
          onChange={(e) => setNova(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") adicionar(e); }}
          placeholder="Ex.: Pneus e rodas"
        />
        <Button type="button" variant="secondary" disabled={ocupado} onClick={adicionar}>
          <Plus className="w-4 h-4 mr-1" /> Adicionar
        </Button>
      </div>

      {subcategories.length === 0 ? (
        <p className="mt-2 text-xs text-neutral-500">Nenhuma ainda. A categoria funciona sem subcategorias.</p>
      ) : (
        <ul className="mt-2 divide-y text-sm">
          {subcategories.map((sc) => (
            <li key={sc.id} className="flex items-center justify-between gap-2 py-1.5">
              <span>
                {sc.name} <span className="font-mono text-xs text-neutral-400">?s={sc.slug}</span>
              </span>
              <button
                type="button"
                disabled={ocupado}
                onClick={async () => {
                  if (!confirm(`Remover a subcategoria "${sc.name}"? Os produtos ficam na categoria, sem subcategoria.`)) return;
                  await chamar("DELETE", null, sc.id);
                }}
                className="text-neutral-400 transition hover:text-red-600"
                aria-label={`Remover ${sc.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
