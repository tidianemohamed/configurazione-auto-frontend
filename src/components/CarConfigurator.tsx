import type { CarModel, Engine, Optional, Color } from '../types';
import { downloadQuotePdf } from '../utils/exportPdf';
import {
  getConflictingSelectedOptionals,
  getMissingRequiredOptionals,
  getOptionalNames,
} from '../utils/optionalRules';

interface Props {
  model: CarModel;
  availableOptionals: Optional[];
  selectedEngine: Engine | null;
  onEngineSelect: (e: Engine) => void;
  selectedOptionals: Optional[];
  onToggleOptional: (o: Optional) => void;
  selectedColor: Color | null;
  onColorSelect: (c: Color) => void;
  onFinish: () => void;
}

const fmtEUR = new Intl.NumberFormat('it-IT', { minimumFractionDigits: 0 });
const price = (v: string | number) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? fmtEUR.format(n) : '0';
};

const downloadExport = (
  model: CarModel,
  selectedEngine: Engine | null,
  selectedColor: Color | null,
  selectedOptionals: Optional[]
) => {
  const basePrice = Number(model.base_price);
  const engineExtra = selectedEngine ? Number(selectedEngine.additional_price) : 0;
  const colorExtra = selectedColor ? Number(selectedColor.price) : 0;
  const total = basePrice + engineExtra + colorExtra
    + selectedOptionals.reduce((sum, opt) => sum + Number(opt.price), 0);

  downloadQuotePdf({
    filename: `${model.name.replace(/\s+/g, '_')}_preventivo_${new Date().toISOString().slice(0, 10)}.pdf`,
    date: new Date().toLocaleDateString('it-IT'),
    model: model.name,
    engine: selectedEngine?.name,
    color: selectedColor?.name,
    optionals: selectedOptionals.map((opt) => ({
      name: opt.name,
      price: Number(opt.price),
    })),
    basePrice,
    engineExtra,
    colorExtra,
    total,
  });
};

const sectionTitleClass = 'text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4';
const optionButtonClass = (active: boolean) =>
  `w-full flex justify-between items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-900 ${
    active
      ? 'border-slate-900 bg-slate-900 text-white shadow-md'
      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
  }`;

export default function CarConfigurator({
  model,
  availableOptionals,
  selectedEngine,
  onEngineSelect,
  selectedOptionals,
  onToggleOptional,
  selectedColor,
  onColorSelect,
  onFinish,
}: Props) {
  return (
    <main className="flex flex-col lg:flex-row min-h-[calc(100vh-73px)] bg-slate-50">
      {/* Preview panel */}
      <div className="lg:w-[55%] xl:w-[58%] flex flex-col items-center justify-center bg-white border-b lg:border-b-0 lg:border-r border-slate-200 px-6 py-8 lg:py-12 lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px)]">
        <img
          src={selectedColor?.image_url || model.image_url}
          className="max-w-full max-h-[40vh] lg:max-h-[65vh] object-contain drop-shadow-md transition-transform duration-300"
          alt={`${model.name}${selectedColor ? ` - ${selectedColor.name}` : ''}`}
        />
        <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.3em] text-slate-400">
          {model.name}
        </p>
      </div>

      {/* Options panel */}
      <div className="lg:w-[45%] xl:w-[42%] flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-8 pb-20 sm:pb-8 space-y-10">
          <section aria-labelledby="motore-title">
            <h3 id="motore-title" className={sectionTitleClass}>
              01 · Motore
            </h3>
            <div role="radiogroup" aria-label="Seleziona motore" className="space-y-2.5">
              {model.engines.map((e) => {
                const active = selectedEngine?.id === e.id;
                return (
                  <button
                    key={e.id}
                    role="radio"
                    aria-checked={active}
                    onClick={() => onEngineSelect(e)}
                    className={optionButtonClass(active)}
                  >
                    <span className="font-semibold text-sm">{e.name}</span>
                    <span className="font-bold text-sm shrink-0">+ €{price(e.additional_price)}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {model.colors && model.colors.length > 0 && (
            <section aria-labelledby="colori-title">
              <h3 id="colori-title" className={sectionTitleClass}>
                02 · Colore
              </h3>
              <div role="radiogroup" aria-label="Seleziona colore" className="space-y-2.5">
                {model.colors.map((c) => {
                  const active = selectedColor?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      role="radio"
                      aria-checked={active}
                      onClick={() => onColorSelect(c)}
                      className={optionButtonClass(active)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm shrink-0"
                          style={{ backgroundColor: c.hex }}
                          aria-hidden="true"
                        />
                        <span className="font-semibold text-sm truncate">{c.name}</span>
                      </div>
                      <span className="font-bold text-sm shrink-0">+ €{price(c.price)}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <section aria-labelledby="equip-title">
            <h3 id="equip-title" className={sectionTitleClass}>
              {model.colors && model.colors.length > 0 ? '03' : '02'} · Equipaggiamento
            </h3>
            <div className="space-y-2">
              {availableOptionals.map((o) => {
                const isActive = selectedOptionals.some((so) => so.id === o.id);
                const inputId = `opt-${o.id}`;
                const conflicts = getConflictingSelectedOptionals(o, selectedOptionals);
                const missingRequired = getMissingRequiredOptionals(o, selectedOptionals);
                const disabledByConflict = !isActive && conflicts.length > 0;
                const requiredNames = getOptionalNames(o.requires || [], availableOptionals);
                const incompatibleNames = getOptionalNames(o.incompatibleWith || [], availableOptionals);

                return (
                  <div key={o.id}>
                    <label
                      htmlFor={inputId}
                      className={`flex justify-between items-start gap-3 px-4 py-3.5 rounded-xl border cursor-pointer transition-all ${
                        isActive
                          ? 'border-slate-900 bg-slate-50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      } ${disabledByConflict ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <input
                          id={inputId}
                          type="checkbox"
                          checked={isActive}
                          onChange={(e) => {
                            if (disabledByConflict) {
                              e.preventDefault();
                              return;
                            }
                            onToggleOptional(o);
                          }}
                          className="sr-only mt-1"
                          disabled={disabledByConflict}
                        />
                        <div
                          className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-300'
                          }`}
                          aria-hidden="true"
                        >
                          {isActive && <span className="text-[9px] leading-none">✓</span>}
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-sm font-medium text-slate-800">{o.name}</p>
                          {requiredNames && (
                            <p className="mt-1 text-[11px] text-amber-700">
                              Richiede: {requiredNames}
                            </p>
                          )}
                          {incompatibleNames && (
                            <p className="mt-0.5 text-[11px] text-slate-500">
                              Non compatibile con: {incompatibleNames}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 shrink-0">+ €{price(o.price)}</p>
                    </label>
                    {disabledByConflict && (
                      <p className="mt-1.5 pl-7 text-xs text-red-500">
                        In conflitto con: {conflicts.map((c) => c.name).join(', ')}
                      </p>
                    )}
                    {!isActive && missingRequired.length > 0 && (
                      <p className="mt-1.5 pl-7 text-xs text-amber-600">
                        Seleziona prima: {getOptionalNames(missingRequired, availableOptionals)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="riepilogo-title" className="pb-4">
            <h3 id="riepilogo-title" className={sectionTitleClass}>
              Riepilogo
            </h3>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Modello</span>
                <span className="font-semibold text-slate-900 text-right">{model.name}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Motore</span>
                <span className="font-semibold text-slate-900 text-right">{selectedEngine?.name ?? '—'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Colore</span>
                <span className="font-semibold text-slate-900 text-right">{selectedColor?.name ?? '—'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Optionals</span>
                <span className="font-semibold text-slate-900">{selectedOptionals.length}</span>
              </div>
              <div className="flex justify-between gap-4 pt-2.5 border-t border-slate-200">
                <span className="font-medium text-slate-700">Totale</span>
                <span className="font-bold text-slate-900">
                  € {price(
                    Number(model.base_price)
                    + (selectedEngine ? Number(selectedEngine.additional_price) : 0)
                    + (selectedColor ? Number(selectedColor.price) : 0)
                    + selectedOptionals.reduce((s, o) => s + Number(o.price), 0)
                  )}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Sticky footer */}
        <div className="fixed bottom-0 left-0 right-0 sm:sticky sm:bottom-0 sm:left-auto sm:right-auto border-t border-slate-200 bg-white/95 backdrop-blur-md px-5 sm:px-8 py-4 safe-area-pb z-50">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => downloadExport(model, selectedEngine, selectedColor, selectedOptionals)}
              className="px-5 py-3 sm:py-2.5 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 transition-colors"
            >
              Esporta PDF
            </button>
            <button
              onClick={onFinish}
              disabled={!selectedEngine}
              className={`flex-1 py-3 sm:py-2.5 rounded-xl text-sm font-semibold transition-all ${
                selectedEngine
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Richiedi preventivo
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
