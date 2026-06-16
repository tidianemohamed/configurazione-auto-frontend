import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { downloadQuotePdf } from '../utils/exportPdf';

interface Configuration {
  id: number;
  total_price: string;
  status: string;
  created_at: string;
  car_model?: { name: string; image_path?: string };
  engine?: { name: string };
  color?: { name: string };
  optionals?: Array<{ id: number; name: string }>;
}

interface StoricoProps {
  onEdit: (config: any) => void;
}

const downloadExport = (config: Configuration) => {
  downloadQuotePdf({
    filename: `preventivo_${config.id}_${new Date(config.created_at).toISOString().slice(0, 10)}.pdf`,
    id: config.id,
    date: new Date(config.created_at).toLocaleDateString('it-IT'),
    model: config.car_model?.name || '-',
    engine: config.engine?.name,
    color: config.color?.name,
    optionals: (config.optionals || []).map((o) => ({ name: o.name })),
    total: Number(config.total_price),
  });
};

const StoricoPreventivi: React.FC<StoricoProps> = ({ onEdit }) => {
  const [preventivi, setPreventivi] = useState<Configuration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchStorico = async () => {
      try {
        const response = await api.get('/configurations');
        const data = response.data;
        const configurations = Array.isArray(data.configurations) ? data.configurations : (Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
        setPreventivi(configurations);
      } catch (err: any) {
        setError('Impossibile caricare i dati.');
      } finally {
        setLoading(false);
      }
    };
    fetchStorico();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-slate-500">
        Caricamento preventivi...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (preventivi.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
        <p className="text-slate-500 text-sm">Nessun preventivo trovato.</p>
      </div>
    );
  }

  return (
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 pb-44 sm:pb-8">
      {preventivi.map((config) => (
        <article
          key={config.id}
          className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
        >
          <div className="mb-4">
            <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${
              config.status === 'saved'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
            }`}>
              {config.status === 'saved' ? 'Salvato' : 'In sospeso'}
            </span>
            <h3 className="mt-3 text-base font-bold text-slate-900">{config.car_model?.name}</h3>
            <p className="mt-1 text-xs text-slate-500">
              {config.engine?.name} · {config.color?.name}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {new Date(config.created_at).toLocaleDateString('it-IT')}
            </p>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-100">
            <p className="text-xl font-bold text-slate-900 mb-4">
              € {parseFloat(config.total_price).toLocaleString('it-IT')}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(config)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Modifica
              </button>
              <button
                onClick={() => downloadExport(config)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                Esporta PDF
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default StoricoPreventivi;