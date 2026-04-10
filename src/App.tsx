import React, { useState } from 'react';
import { Play, Pause, Eye, EyeOff, Move } from 'lucide-react';
import EngineScene from './components/EngineScene';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInternals, setShowInternals] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="w-full h-screen bg-gray-900 relative font-sans overflow-hidden">
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all font-medium w-48"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          {isPlaying ? 'Pausar' : 'Iniciar'}
        </button>
        <button
          onClick={() => setShowInternals(!showInternals)}
          className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl shadow-lg transition-all font-medium w-48"
        >
          {showInternals ? <EyeOff size={20} /> : <Eye size={20} />}
          {showInternals ? 'Ocultar Interno' : 'Mostrar Interno'}
        </button>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl shadow-lg transition-all font-medium w-48 ${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
        >
          <Move size={20} />
          {isEditing ? 'Concluir Edição' : 'Mover Peças'}
        </button>
      </div>
      
      <div className="absolute bottom-6 left-6 z-10 text-white/70 text-sm max-w-md pointer-events-none bg-gray-900/50 p-4 rounded-xl backdrop-blur-sm border border-white/10">
        <h1 className="text-2xl font-bold text-white mb-2">Motor Stirling Tipo Gama</h1>
        <p className="mb-2">Modelo 3D interativo baseado no projeto com materiais recicláveis.</p>
        <ul className="list-disc pl-4 space-y-1 text-white/60">
          <li><strong>Câmara Quente:</strong> Lata de alumínio (220ml)</li>
          <li><strong>Câmara Fria:</strong> Cano de PVC (25mm)</li>
          <li><strong>Transmissão:</strong> Virabrequim de arame e volante de inércia</li>
        </ul>
        {isEditing ? (
          <p className="mt-4 text-green-400 font-medium">Modo de edição ativo: Clique nas peças (lata, cano, base, etc) para movê-las individualmente.</p>
        ) : (
          <p className="mt-4 text-xs text-white/40">Arraste para girar a câmera. Role para dar zoom.</p>
        )}
      </div>

      <EngineScene isPlaying={isPlaying} showInternals={showInternals} isEditing={isEditing} />
    </div>
  );
}
