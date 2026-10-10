import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { LocalEstoque } from '../../types';
import { validarCadastro, parsePrecoBr } from '../../domain/validacaoCadastro';

interface DialogoCadastroProps {
  onSalvar: (dados: {
    nome: string;
    quantidade: number;
    unidade: string;
    validade: number | null;
    local: LocalEstoque;
    precoRef: number | null;
    fotoPath: string | null;
  }) => void;
  onFechar: () => void;
  escuro: boolean;
}

export const DialogoCadastro: React.FC<DialogoCadastroProps> = ({
  onSalvar,
  onFechar,
  escuro,
}) => {
  const [nome, setNome] = useState('');
  const [quantidadeTxt, setQuantidadeTxt] = useState('1');
  const [unidade, setUnidade] = useState('un');
  const [precoTxt, setPrecoTxt] = useState('');
  const [validadeData, setValidadeData] = useState('');
  const [local, setLocal] = useState<LocalEstoque>('DESPENSA');
  const [fotoPath, setFotoPath] = useState<string | null>(null);
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const unidades = ['un', 'kg', 'g', 'L', 'ml'];

  // Start webcam
  const iniciarCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraAtiva(true);
    } catch (err) {
      // Fallback to file picker if camera stream cannot be acquired
      fileInputRef.current?.click();
    }
  };

  const pararCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraAtiva(false);
  };

  const capturarFotoCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const maxDim = 800;
    let w = video.videoWidth || 640;
    let h = video.videoHeight || 480;

    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setFotoPath(dataUrl);
    }
    pararCamera();
  };

  const handleArquivoImagem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          setFotoPath(canvas.toDataURL('image/jpeg', 0.85));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    const qtdNum = parseFloat(quantidadeTxt.replace(',', '.'));
    const erroValidacao = validarCadastro(nome, qtdNum);
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    let precoNum: number | null = null;
    if (precoTxt.trim()) {
      try {
        precoNum = parsePrecoBr(precoTxt);
      } catch {
        setErro('Preço inválido (ex: 4,99)');
        return;
      }
    }

    let validadeEpoch: number | null = null;
    if (validadeData.trim()) {
      // Input date format YYYY-MM-DD
      const [ano, mes, dia] = validadeData.split('-').map(Number);
      if (ano && mes && dia) {
        const d = new Date(ano, mes - 1, dia, 0, 0, 0, 0);
        validadeEpoch = d.getTime();
      }
    }

    onSalvar({
      nome: nome.trim(),
      quantidade: qtdNum,
      unidade,
      validade: validadeEpoch,
      local,
      precoRef: precoNum,
      fotoPath,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className={`w-full max-w-md my-8 rounded-[28px] p-6 shadow-2xl transition-all ${
          escuro
            ? 'bg-[#131B36] text-[#F2F5FF] border border-[#26414B]'
            : 'bg-[#FFFFFF] text-[#14343C] border border-[#D8E6E8]'
        }`}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold font-display">Novo item</h2>
          <button
            type="button"
            onClick={() => {
              pararCamera();
              onFechar();
            }}
            className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSalvar} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
              Nome do produto *
            </label>
            <input
              type="text"
              required
              placeholder="ex: Queijo Minas, Iogurte, Arroz"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                setErro(null);
              }}
              className={`w-full px-4 py-3 rounded-2xl text-sm font-medium border transition-colors outline-none focus:ring-2 focus:ring-[#0B6E5F] ${
                escuro
                  ? 'bg-[#0A0E1A] border-[#26414B] text-[#F2F5FF] placeholder-[#9AA4C7]'
                  : 'bg-[#F2F5FF] border-[#D8E6E8] text-[#14343C] placeholder-[#47626E]/60'
              }`}
            />
          </div>

          {/* Quantidade & Unidade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
                Quantidade *
              </label>
              <input
                type="text"
                required
                inputMode="decimal"
                value={quantidadeTxt}
                onChange={(e) => setQuantidadeTxt(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl text-sm font-medium border transition-colors outline-none focus:ring-2 focus:ring-[#0B6E5F] ${
                  escuro
                    ? 'bg-[#0A0E1A] border-[#26414B] text-[#F2F5FF]'
                    : 'bg-[#F2F5FF] border-[#D8E6E8] text-[#14343C]'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
                Unidade
              </label>
              <select
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl text-sm font-medium border transition-colors outline-none focus:ring-2 focus:ring-[#0B6E5F] ${
                  escuro
                    ? 'bg-[#0A0E1A] border-[#26414B] text-[#F2F5FF]'
                    : 'bg-[#F2F5FF] border-[#D8E6E8] text-[#14343C]'
                }`}
              >
                {unidades.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preço Unitário & Validade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
                Preço Unit. (R$)
              </label>
              <input
                type="text"
                placeholder="ex: 4,99"
                value={precoTxt}
                onChange={(e) => setPrecoTxt(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl text-sm font-medium border transition-colors outline-none focus:ring-2 focus:ring-[#0B6E5F] ${
                  escuro
                    ? 'bg-[#0A0E1A] border-[#26414B] text-[#F2F5FF] placeholder-[#9AA4C7]'
                    : 'bg-[#F2F5FF] border-[#D8E6E8] text-[#14343C] placeholder-[#47626E]/60'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
                Validade
              </label>
              <input
                type="date"
                value={validadeData}
                onChange={(e) => setValidadeData(e.target.value)}
                className={`w-full px-3 py-3 rounded-2xl text-sm font-medium border transition-colors outline-none focus:ring-2 focus:ring-[#0B6E5F] ${
                  escuro
                    ? 'bg-[#0A0E1A] border-[#26414B] text-[#F2F5FF]'
                    : 'bg-[#F2F5FF] border-[#D8E6E8] text-[#14343C]'
                }`}
              />
            </div>
          </div>

          {/* Local de armazenamento */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
              Local no estoque
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'GELADEIRA' as const, label: 'Geladeira' },
                { id: 'FREEZER' as const, label: 'Freezer' },
                { id: 'DESPENSA' as const, label: 'Despensa' },
              ].map((loc) => {
                const ativo = local === loc.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setLocal(loc.id)}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all ${
                      ativo
                        ? escuro
                          ? 'bg-[#6EE7B7] text-[#0A0E1A] border-[#6EE7B7]'
                          : 'bg-[#0B6E5F] text-white border-[#0B6E5F]'
                        : escuro
                        ? 'bg-[#0A0E1A] text-[#9AA4C7] border-[#26414B] hover:text-[#F2F5FF]'
                        : 'bg-[#F2F5FF] text-[#47626E] border-[#D8E6E8] hover:text-[#14343C]'
                    }`}
                  >
                    {loc.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Foto do item */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
              Foto do item (opcional)
            </label>

            {cameraAtiva ? (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex flex-col items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 flex gap-3">
                  <button
                    type="button"
                    onClick={capturarFotoCamera}
                    className="px-4 py-2 rounded-full bg-[#FF8A00] text-[#14343C] font-bold text-xs shadow-lg"
                  >
                    Tirar foto
                  </button>
                  <button
                    type="button"
                    onClick={pararCamera}
                    className="px-4 py-2 rounded-full bg-black/60 text-white font-medium text-xs backdrop-blur-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {fotoPath ? (
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#0B6E5F] shrink-0">
                    <img
                      src={fotoPath}
                      alt="Prévia"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFotoPath(null)}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-black"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center border shrink-0 ${
                      escuro
                        ? 'bg-[#0A0E1A] border-[#26414B] text-[#9AA4C7]'
                        : 'bg-[#F2F5FF] border-[#D8E6E8] text-[#47626E]'
                    }`}
                  >
                    <ImageIcon className="w-7 h-7 stroke-1" />
                  </div>
                )}

                <div className="flex gap-2 flex-1">
                  <button
                    type="button"
                    onClick={iniciarCamera}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-bold border transition-colors ${
                      escuro
                        ? 'bg-[#0A0E1A] border-[#26414B] text-[#F2F5FF] hover:bg-[#131B36]'
                        : 'bg-[#F2F5FF] border-[#D8E6E8] text-[#14343C] hover:bg-[#EAF3F3]'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    Câmera
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-bold border transition-colors ${
                      escuro
                        ? 'bg-[#0A0E1A] border-[#26414B] text-[#F2F5FF] hover:bg-[#131B36]'
                        : 'bg-[#F2F5FF] border-[#D8E6E8] text-[#14343C] hover:bg-[#EAF3F3]'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Arquivo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleArquivoImagem}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {erro && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => {
                pararCamera();
                onFechar();
              }}
              className={`flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-colors ${
                escuro
                  ? 'bg-[#0A0E1A] text-[#9AA4C7] hover:bg-[#26414B]'
                  : 'bg-[#F2F5FF] text-[#47626E] hover:bg-[#EAF3F3]'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-2xl text-sm font-black bg-[#FF8A00] text-[#14343C] hover:brightness-105 active:scale-98 shadow-md shadow-[#FF8A00]/25 transition-all"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
