import type { CarModel } from '../types';

interface Props {
  models: CarModel[];
  onSelect: (model: CarModel) => void;
}

export default function ModelShowroom({ models, onSelect }: Props) {
  return (
    <main className="w-full px-4 sm:px-6 lg:px-14 py-6 pb-45 sm:py-10 lg:py-14">
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="flex flex-col gap-4 sm:hidden">
          {models.map((m, idx) => (
            <article
              key={m.id}
              onClick={() => onSelect(m)}
              className="group relative flex flex-col bg-white rounded-xl border border-slate-200/80 shadow-sm active:shadow-md transition-all duration-300 cursor-pointer overflow-hidden animate-fade-in"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="absolute top-2.5 right-2.5 z-10 bg-blue-600 text-white px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wide">
                Nuovo
              </div>

              <div className="px-4 pt-4 pb-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {m.name}
                </h3>
              </div>

              <div className="relative w-full aspect-[4/3] flex items-center justify-center bg-gradient-to-b from-slate-50 to-white overflow-hidden">
                <img
                  src={m.image_url}
                  loading="lazy"
                  className="max-w-[80%] max-h-[80%] object-contain"
                  alt={m.name}
                />
              </div>

              <div className="flex flex-col px-4 py-3 gap-2.5">
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {m.description}
                </p>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                    Da
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                    € {Number(m.base_price).toLocaleString('it-IT')}
                  </span>
                </div>

                <button className="w-full py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg active:bg-slate-950 transition-colors">
                  Configura ora →
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="hidden sm:block">
          <div className="showroom-grid">
            {models.map((m, idx) => (
              <article
                key={m.id}
                onClick={() => onSelect(m)}
                className="group relative flex flex-col h-full bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-slate-300/80 transition-all duration-300 cursor-pointer overflow-hidden animate-fade-in"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="absolute top-3 right-3 z-10 bg-blue-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide">
                  Nuovo
                </div>

                <div className="px-5 pt-5 pb-3">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                    {m.name}
                  </h3>
                </div>

                <div className="relative w-full aspect-[4/3] flex items-center justify-center bg-gradient-to-b from-slate-50 to-white overflow-hidden">
                  <img
                    src={m.image_url}
                    loading="lazy"
                    className="max-w-[85%] max-h-[85%] object-contain transition-transform duration-500 group-hover:scale-105"
                    alt={m.name}
                  />
                </div>

                <div className="flex flex-col flex-grow px-5 py-4 gap-3">
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                    {m.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 mt-auto border-t border-slate-100">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                      Da
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-bold">
                      € {Number(m.base_price).toLocaleString('it-IT')}
                    </span>
                  </div>

                  <button className="w-full py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">
                    Configura ora →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

