// src/components/ui/Status.tsx
"use client";
import React from "react";
import { Loader2 } from "lucide-react";

export function Status({ status, desc }: { status: string, desc?: string }) {
  if (status === "processando") {
    return (
      <div className="flex items-center gap-2 text-yellow-500 pb-[5px]">
        <span>{desc ? `${desc}` : 'Processando'}</span>
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (status === "concluido") {
    return <div className="text-green-500 pb-[5px]">Concluído</div>;
  }

  if (status === "buscando") {
    return <div className="text-blue-500 pb-[5px]">Buscando</div>;
  }

  if (status === "erro") {
    return <div className="text-red-500 pb-[5px]">Erro</div>;
  }

  return null;
}
