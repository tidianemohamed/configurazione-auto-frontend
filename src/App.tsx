import { useState, useEffect } from 'react';
import { api } from './api/client';
import { getModels, getOptionals } from './services/modelsService';

import ModelShowroom from './components/ModelShowroom';
import CarConfigurator from './components/CarConfigurator';
import AdminDashboard from './components/AdminDashboard';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

import type { CarModel, Engine, Optional, Color, GetOptionalsResponse } from './types';
import { mapOptionalsWithRules } from './utils/optionalRules';
import useAuth from './hooks/useAuth';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token'); 
  
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

async function saveConfiguration(payload: any) {
  const response = await api.post('/configurations', payload);
  return response.data;
}

async function updateConfiguration(configId: number, payload: any) {
  const response = await api.put(`/configurations/${configId}`, payload);
  return response.data;
}

function App() {
  const [models, setModels] = useState<CarModel[]>([]);
  const [availableOptionals, setAvailableOptionals] = useState<Optional[]>([]);
  const [loading, setLoading] = useState(true);

  const auth = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingQuote, setPendingQuote] = useState(false);

  const [step, setStep] = useState(1); 
  const [selectedModel, setSelectedModel] = useState<CarModel | null>(null);
  const [selectedEngine, setSelectedEngine] = useState<Engine | null>(null);
  const [selectedOptionals, setSelectedOptionals] = useState<Optional[]>([]);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);

  const [editingConfigId, setEditingConfigId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mRes = await getModels();
        const oRes: GetOptionalsResponse = await getOptionals();

        const mappedOptionals = mapOptionalsWithRules(
          oRes.optionals || [],
          oRes.incompatibilities || [],
          oRes.requirements || [],
        );

        setModels(mRes);
        setAvailableOptionals(mappedOptionals);
      } catch (err) {
        console.error('Errore API nel caricamento del configuratore:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditConfiguration = async (config: any) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/configurations/${config.id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!resp.ok) {
        throw new Error('Impossibile recuperare il preventivo dal server');
      }

      const full = await resp.json();
      const payload = full.configuration || full; 

      setEditingConfigId(payload.id);

      let candidateModel = payload.car_model || config.car_model;
      if (candidateModel && (!candidateModel.engines || candidateModel.engines.length === 0)) {
        const found = models.find(m => m.id === (candidateModel.id || payload.car_model_id || payload.car_model?.id || config.car_model?.id));
        if (found) candidateModel = found;
      }

      if (!candidateModel || !candidateModel.engines) {
        throw new Error('Modello completo non disponibile per l\'editing');
      }

      setSelectedModel(candidateModel);
      setSelectedEngine(payload.engine || config.engine);
      setSelectedColor(payload.color || config.color);

      const savedOpts = (payload.optionals || config.optionals || []).map((saved: any) => {
        return availableOptionals.find(o => o.id === saved.id) || saved;
      });
      setSelectedOptionals(savedOpts);
      setStep(2); 
    } catch (err) {
      console.error('Errore caricamento preventivo per modifica:', err);
      const fallbackModelId = config.car_model?.id || config.car_model_id;
      const fullModel = models.find(m => m.id === fallbackModelId);
      if (!fullModel) {
        alert('Impossibile caricare il preventivo per la modifica: modello non disponibile.');
        return;
      }

      setEditingConfigId(config.id);
      setSelectedModel(fullModel);
      setSelectedEngine(config.engine || null);
      setSelectedColor(config.color || null);
      const savedOpts = (config.optionals || []).map((saved: any) => availableOptionals.find(o => o.id === saved.id) || saved);
      setSelectedOptionals(savedOpts);
      setStep(2);
    }
  };

  const handleRequestQuote = async () => {
    if (!auth.isAuthenticated) {
      setPendingQuote(true);
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }

    if (!selectedModel || !selectedEngine || !selectedColor) {
      alert('Seleziona modello, motore e colore prima di salvare il preventivo!');
      return;
    }

    try {
      const payload = {
        car_model_id: selectedModel.id,
        engine_id: selectedEngine.id,
        color_id: selectedColor.id,
        total_price: calculateTotal(),
        optionals: selectedOptionals.map(o => o.id),
        status: 'saved',
      };

      if (editingConfigId) {
        await updateConfiguration(editingConfigId, {
          car_model_id: payload.car_model_id,
          engine_id: payload.engine_id,
          color_id: payload.color_id,
          total_price: payload.total_price,
          optionals: payload.optionals,
          status: payload.status,
        });
        alert('Preventivo modificato e aggiornato con successo sul database!');
      } else {
        await saveConfiguration(payload);
        alert('Preventivo salvato con successo nel tuo profilo!');
      }

      setStep(3);
      setEditingConfigId(null);
      setSelectedModel(null);
      setSelectedEngine(null);
      setSelectedColor(null);
      setSelectedOptionals([]);

    } catch (err) {
      console.error(err);
      alert('Errore di comunicazione con il server durante il salvataggio del preventivo.');
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (pendingQuote) {
      setPendingQuote(false);
      handleRequestQuote();
      return;
    }
    setStep(3);
  };

  const calculateTotal = () => {
    if (!selectedModel) return 0;
    const base = parseFloat(selectedModel.base_price as string);
    const eng = selectedEngine ? parseFloat(selectedEngine.additional_price as string) : 0;
    const col = selectedColor ? parseFloat(selectedColor.price as string) : 0;
    const opt = selectedOptionals.reduce((s, o) => s + parseFloat(o.price as string), 0);
    return base + eng + col + opt;
  };

  const handleToggleOptional = (targetOptional: Optional) => {
    const isAlreadySelected = selectedOptionals.some(so => so.id === targetOptional.id);

    if (isAlreadySelected) {
      const isRequiredByActiveOptional = selectedOptionals.some(so => 
        so.requires?.includes(targetOptional.id)
      );

      if (isRequiredByActiveOptional) {
        const dependents = selectedOptionals
          .filter(so => so.requires?.includes(targetOptional.id))
          .map(so => so.name)
          .join(', ');
        
        alert(`Non puoi rimuovere "${targetOptional.name}" perché è richiesto obbligatoriamente da: ${dependents}`);
        return;
      }

      setSelectedOptionals(selectedOptionals.filter(so => so.id !== targetOptional.id));

    } else {
      if (targetOptional.requires && targetOptional.requires.length > 0) {
        const missingIds = targetOptional.requires.filter(
          reqId => !selectedOptionals.some(so => so.id === reqId)
        );

        if (missingIds.length > 0) {
          const missingNames = availableOptionals
            .filter(opt => missingIds.includes(opt.id))
            .map(opt => opt.name)
            .join(', ');

          alert(`Per aggiungere "${targetOptional.name}" devi prima selezionare i pacchetti richiesti: ${missingNames}`);
          return;
        }
      }

      const conflictingOptionals = selectedOptionals.filter(so => {
        const targetIncompatible = targetOptional.incompatibleWith?.includes(so.id);
        const sourceIncompatible = so.incompatibleWith?.includes(targetOptional.id);
        return targetIncompatible || sourceIncompatible;
      });

      if (conflictingOptionals.length > 0) {
        const names = conflictingOptionals.map(co => co.name).join(', ');
        const confirmSwitch = window.confirm(
          `"${targetOptional.name}" non è compatibile con le seguenti opzioni già selezionate: ${names}.\n\nVuoi disattivarle automaticamente per inserire questa opzione?`
        );

        if (!confirmSwitch) return;

        const cleanedSelection = selectedOptionals.filter(
          so => !conflictingOptionals.some(co => co.id === so.id)
        );
        setSelectedOptionals([...cleanedSelection, targetOptional]);
        return;
      }

      setSelectedOptionals([...selectedOptionals, targetOptional]);
    }
  };

  const handleColorSelect = (c: Color) => {
    setSelectedColor(c);
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600">
      <div className="flex flex-col items-center gap-4">
        <div className="text-5xl">🚗</div>
        <p className="text-sm font-medium animate-pulse">Caricamento showroom...</p>
        <div className="flex gap-1.5 mt-2">
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-lg shadow-sm">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col items-center text-center gap-4">
            {step === 1 && (
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
                  Scopri la Collezione
                </h1>
                <p className="mt-1 text-sm text-slate-500 hidden sm:block">
                  Personalizza il tuo veicolo Renault con il configuratore interattivo
                </p>
              </div>
            )}
            {step === 2 && (
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Configura la tua auto
              </h1>
            )}
            {step === 3 && (
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                I tuoi preventivi
              </h1>
            )}

            <nav className="header-nav">
              <button
                onClick={() => { setStep(1); setEditingConfigId(null); }}
                className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition-colors ${
                  step === 1
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Showroom
              </button>
              <button
                onClick={() => {
                  if (auth.isAuthenticated) setStep(3);
                  else {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }
                }}
                className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition-colors ${
                  step === 3
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Dashboard
              </button>
              
              {/* Qui ora c'è SOLO il bottone di innesco, senza la modal dentro */}
              <div className="inline-block">
                <button
                  onClick={() => {
                    if (auth.isAuthenticated) {
                      auth.logout();
                      setStep(1);
                      setShowAuthModal(false);
                      setEditingConfigId(null);
                      setSelectedEngine(null);
                      setSelectedOptionals([]);
                      setSelectedColor(null);
                      return;
                    }
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  className="rounded-full bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  {auth.isAuthenticated ? 'Logout' : 'Login'}
                </button>
              </div>
            </nav>
          </div>

          {step > 1 && (
            <div className="absolute right-0 sm:right-6 top-[65%] -translate-y-1/2 flex items-center gap-4">
              {step === 2 && (
                <div className="hidden md:block text-right">
                  <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Totale</p>
                  <p className="text-lg font-bold text-slate-900">€ {calculateTotal().toLocaleString('it-IT')}</p>
                </div>
              )}
              <button
                onClick={() => {
                  setStep(1);
                  setEditingConfigId(null);
                  setSelectedEngine(null);
                  setSelectedOptionals([]);
                  setSelectedColor(null);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors text-xl"
                aria-label="Chiudi"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </header>

      {step === 1 && (
        <ModelShowroom 
          models={models} 
          onSelect={(m) => {
            setSelectedModel(m);
            setSelectedEngine(null);
            setSelectedOptionals([]);
            setSelectedColor(null);
            setStep(2);
          }} 
        />
      )}

      {step === 2 && selectedModel && (
        <CarConfigurator 
          model={selectedModel}
          availableOptionals={availableOptionals}
          selectedEngine={selectedEngine}
          onEngineSelect={setSelectedEngine}
          selectedOptionals={selectedOptionals}
          onToggleOptional={handleToggleOptional}
          selectedColor={selectedColor}
          onColorSelect={handleColorSelect}
          onFinish={handleRequestQuote}
        />
      )}

      {step === 3 && (
        <AdminDashboard onEdit={handleEditConfiguration} />
      )}

      {/* SPOSTATA QUI: Ora la modal vive fuori dall'header, come prima linea sotto il body.
        In questo modo "fixed" calcolerà perfettamente il centro dello schermo dello smartphone.
      */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Sfondo Nero Trasparente Cliccabile */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowAuthModal(false)}
          />

          {/* Scatola Bianca del Form (Sempre Centrata Verticalmente e Orizzontalmente) */}
          <div className="relative w-full max-w-[380px] bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">
                {authMode === 'login' ? 'Accedi' : 'Registrati'}
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors text-xl font-semibold"
                aria-label="Chiudi"
              >
                ×
              </button>
            </div>

            {authMode === 'login' ? (
              <LoginForm onSuccess={handleAuthSuccess} />
            ) : (
              <RegisterForm onSuccess={handleAuthSuccess} />
            )}

            <div className="mt-5 text-center">
              <button
                className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors"
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              >
                {authMode === 'login' ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;