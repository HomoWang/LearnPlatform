import { ChangeEvent, useState } from "react";
import PageHeader from "../components/PageHeader";
import { learningPaths } from "../lib/catalog";
import type { AppPageProps } from "../lib/appActions";

export default function SettingsPage({ state, actions }: AppPageProps) {
  const [message, setMessage] = useState("");

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      actions.importBackup(raw);
      setMessage("匯入完成。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "匯入失敗。");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <>
      <PageHeader title="設定與資料備份" description="個人資料保存在瀏覽器 localStorage，可匯出 JSON 備份或匯入還原。" />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-4">
          <h2 className="font-bold text-slate-950">偏好設定</h2>
          <div className="mt-4 grid gap-3">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">預設路線</span>
              <select
                className="form-input mt-1"
                value={state.settings.defaultPathId ?? "network"}
                onChange={(event) => actions.updateSettings({ ...state.settings, defaultPathId: event.target.value })}
              >
                {learningPaths.map((path) => (
                  <option key={path.id} value={path.id}>
                    {path.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">每週目標項目數</span>
              <input
                className="form-input mt-1"
                type="number"
                min="1"
                max="30"
                value={state.settings.weeklyTarget ?? 5}
                onChange={(event) =>
                  actions.updateSettings({ ...state.settings, weeklyTarget: Number(event.target.value) })
                }
              />
            </label>
          </div>
        </section>

        <section className="card p-4">
          <h2 className="font-bold text-slate-950">匯出 / 匯入</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-primary" type="button" onClick={actions.exportBackup}>
              匯出 JSON
            </button>
            <label className="btn-secondary cursor-pointer">
              匯入 JSON
              <input className="hidden" type="file" accept="application/json,.json" onChange={handleFile} />
            </label>
          </div>
          {message ? <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">{message}</p> : null}
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
            清除瀏覽器資料會導致進度消失，換電腦時請先匯出 JSON 再匯入。
          </div>
        </section>

        <section className="card p-4 lg:col-span-2">
          <h2 className="font-bold text-slate-950">資料維護</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-secondary" type="button" onClick={actions.resetProgress}>
              重置學習進度
            </button>
            <button className="btn-secondary" type="button" onClick={actions.clearAllData}>
              清除本機資料
            </button>
          </div>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
            <div className="rounded-md bg-slate-50 p-3">
              <div className="text-slate-500">進度</div>
              <div className="mt-1 text-xl font-bold text-slate-950">{state.progress.length}</div>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <div className="text-slate-500">筆記</div>
              <div className="mt-1 text-xl font-bold text-slate-950">{state.notes.length}</div>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <div className="text-slate-500">面試回答</div>
              <div className="mt-1 text-xl font-bold text-slate-950">{state.interviewAnswers.length}</div>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <div className="text-slate-500">作品集</div>
              <div className="mt-1 text-xl font-bold text-slate-950">{state.portfolioItems.length}</div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
