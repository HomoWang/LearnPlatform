import { FormEvent, useMemo, useState } from "react";
import Filters from "../components/Filters";
import PageHeader from "../components/PageHeader";
import { courses, getPathName, labs, learningPaths } from "../lib/catalog";
import { makeId } from "../lib/id";
import type { AppPageProps } from "../lib/appActions";
import type { Note } from "../types";

const noteCategories = [
  "概念筆記",
  "指令筆記",
  "SQL 筆記",
  "Pipeline 筆記",
  "排查筆記",
  "錯誤紀錄",
  "面試回答",
  "作品集描述",
  "學習心得"
];

type NoteDraft = {
  id?: string;
  title: string;
  category: string;
  pathId: string;
  relatedItemId: string;
  tags: string;
  content: string;
  createdAt?: string;
};

const emptyDraft: NoteDraft = {
  title: "",
  category: noteCategories[0],
  pathId: "",
  relatedItemId: "",
  tags: "",
  content: ""
};

export default function NotesPage({ state, actions }: AppPageProps) {
  const [draft, setDraft] = useState<NoteDraft>(emptyDraft);
  const [query, setQuery] = useState("");
  const [pathFilter, setPathFilter] = useState("all");

  const relatedOptions = useMemo(() => {
    return [
      ...courses.map((course) => ({ id: course.id, label: `課程：${course.title}`, pathId: course.pathId })),
      ...labs.map((lab) => ({ id: lab.id, label: `Lab：${lab.title}`, pathId: lab.pathId }))
    ];
  }, []);

  const filteredNotes = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return state.notes
      .filter((note) => {
        const source = `${note.title} ${note.category} ${note.content} ${note.tags.join(" ")}`.toLowerCase();
        return (
          (!keyword || source.includes(keyword)) &&
          (pathFilter === "all" || note.pathId === pathFilter)
        );
      })
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  }, [pathFilter, query, state.notes]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!draft.title.trim() || !draft.content.trim()) {
      return;
    }

    const now = new Date().toISOString();
    const note: Note = {
      id: draft.id ?? makeId("note"),
      title: draft.title.trim(),
      category: draft.category,
      content: draft.content.trim(),
      pathId: draft.pathId || undefined,
      relatedItemId: draft.relatedItemId || undefined,
      tags: draft.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      createdAt: draft.createdAt ?? now,
      updatedAt: now
    };

    actions.saveNote(note);
    setDraft(emptyDraft);
  }

  function editNote(note: Note) {
    setDraft({
      id: note.id,
      title: note.title,
      category: note.category,
      pathId: note.pathId ?? "",
      relatedItemId: note.relatedItemId ?? "",
      tags: note.tags.join(", "),
      content: note.content,
      createdAt: note.createdAt
    });
  }

  return (
    <>
      <PageHeader title="我的筆記" description="可針對課程、Lab 或面試題建立概念、指令、SQL、Pipeline、排查與作品集筆記。" />

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <form className="card space-y-3 p-4" onSubmit={handleSubmit}>
          <h2 className="font-bold text-slate-950">{draft.id ? "編輯筆記" : "新增筆記"}</h2>
          <input
            className="form-input"
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            placeholder="標題"
          />
          <select
            className="form-input"
            value={draft.category}
            onChange={(event) => setDraft({ ...draft, category: event.target.value })}
          >
            {noteCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            className="form-input"
            value={draft.pathId}
            onChange={(event) => setDraft({ ...draft, pathId: event.target.value })}
          >
            <option value="">關聯路線</option>
            {learningPaths.map((path) => (
              <option key={path.id} value={path.id}>
                {path.title}
              </option>
            ))}
          </select>
          <select
            className="form-input"
            value={draft.relatedItemId}
            onChange={(event) => {
              const selected = relatedOptions.find((item) => item.id === event.target.value);
              setDraft({
                ...draft,
                relatedItemId: event.target.value,
                pathId: selected?.pathId ?? draft.pathId
              });
            }}
          >
            <option value="">關聯課程或 Lab</option>
            {relatedOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <input
            className="form-input"
            value={draft.tags}
            onChange={(event) => setDraft({ ...draft, tags: event.target.value })}
            placeholder="標籤，以逗號分隔"
          />
          <textarea
            className="form-input min-h-44"
            value={draft.content}
            onChange={(event) => setDraft({ ...draft, content: event.target.value })}
            placeholder="內容"
          />
          <div className="flex gap-2">
            <button className="btn-primary" type="submit">
              儲存筆記
            </button>
            {draft.id ? (
              <button className="btn-secondary" type="button" onClick={() => setDraft(emptyDraft)}>
                取消
              </button>
            ) : null}
          </div>
        </form>

        <section>
          <Filters
            query={query}
            onQueryChange={setQuery}
            pathId={pathFilter}
            onPathChange={setPathFilter}
          />
          <div className="space-y-3">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <article key={note.id} className="card p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="text-xs font-semibold text-teal-700">
                        {note.category} · {getPathName(note.pathId)}
                      </div>
                      <h2 className="mt-1 text-lg font-bold text-slate-950">{note.title}</h2>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{note.content}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {note.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button className="btn-secondary" type="button" onClick={() => editNote(note)}>
                        編輯
                      </button>
                      <button className="btn-secondary" type="button" onClick={() => actions.deleteNote(note.id)}>
                        刪除
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="card p-6 text-sm text-slate-500">尚未建立符合條件的筆記。</div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
