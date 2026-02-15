"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface Props {
  initialValue?: string;
  onContinue: (codigo: string) => void;
  onBack: () => void;
}

export function PasoIdentificacionPadre({ initialValue = "", onContinue, onBack }: Props) {
  const [codigo, setCodigo] = useState(initialValue);
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (!codigo.trim()) {
      setError("Ingresa tu número de identificación");
      return;
    }
    onContinue(codigo.trim());
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground text-center mb-2">
        Número de identificación
      </h2>
      <p className="text-muted-foreground text-center mb-2">
        Ingresa tu número de documento de identidad
      </p>
      <p className="text-xs text-muted-foreground text-center mb-8">
        Si tu documento tiene letras, escribe solo los números
      </p>
      <div className="space-y-4 max-w-sm mx-auto">
        <Input
          type="text"
          inputMode="numeric"
          placeholder="Ej: 1103127132"
          value={codigo}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            setCodigo(val);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleContinue()}
          error={error}
        />
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Atrás
          </Button>
          <Button onClick={handleContinue} className="flex-1">
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
