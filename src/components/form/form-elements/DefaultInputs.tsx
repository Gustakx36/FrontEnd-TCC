"use client";
import React, { useState } from 'react';
import ComponentCard from '../../common/ComponentCard';
import Input from '../input/InputField';
import Select from '../Select';
import Label from '../Label';
import { ChevronDownIcon } from '@/icons';
import { useSocket } from '@/context/SocketContext';
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DefaultInputs() {
  const { login, setLogin } = useSocket();
  const router = useRouter();
  const [urlYoutube, setUrlYoutube] = useState("");
  const [padrao, setPadrao] = useState("");
  const [tipoBusca, setTipoBusca] = useState("");
  const [resumo, setResumo] = useState(false);
  const [click, setClick] = useState(false);

  const options = [
    { value: "1", label: "Busca por Conparação Direta" },
    { value: "2", label: "Busca por Conparação Fonética" },
  ];

  const handleSubmit = async () => {
    setClick(true);
    const idSolicitation = Date.now();

    await fetch(`https://cutwise.site/backend/criar_trecho_banco_monitoria?` + 
      new URLSearchParams({
        id_solicitation: idSolicitation,
        username: login.username,
        padrao: padrao.trim(),
        tipo: tipoBusca
      }),
      {
        method: "GET",
      }
    );
    fetch(`https://cutwise.site/backend/upload_youtube?`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url_youtube: urlYoutube,
          id_solicitation: `${idSolicitation}`,
          username: login.username,
          padrao: padrao.trim(),
          tipo: tipoBusca,
          resumo: resumo
        }),
      }
    );
    setTimeout(() => {
      window.location.href = `/trecho/${idSolicitation}`;
    }, 1000)
  }

  return (
    <ComponentCard title="Parâmetros">
      <div className="space-y-6">
        <div>
          <Label>URL YouTube</Label>
          <Input 
          onChange={(e) => setUrlYoutube(e.target.value)}
          type="text" />
        </div>
        <div>
          <Label>Padrão</Label>
          <Input 
          onChange={(e) => setPadrao(e.target.value)}
          type="text" />
        </div>
        <div>
          <Label>Tipo de Busca</Label>
          <div className="relative">
            <Select
              options={options}
              placeholder="Selecione uma Opção"
              onChange={(value) => setTipoBusca(value)}
              className="dark:bg-dark-900"
            />
             <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <ChevronDownIcon/>
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            id="gerarResumo"
            type="checkbox"
            checked={resumo}
            onChange={(e) => setResumo(e.target.checked)}
            className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
          />
          <label
            htmlFor="gerarResumo"
            className="text-sm text-gray-700 dark:text-gray-300"
          >
            Gerar Resumo
          </label>
        </div>
        <div className="col-span-full">
          <button
            onClick={handleSubmit}
            disabled={click}
            className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition w-full px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300"
          >
            {click ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Gerar"
            )}
          </button>
        </div>
      </div>
    </ComponentCard>
  );
}
