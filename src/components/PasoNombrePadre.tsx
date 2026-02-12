"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface Props {
  initialValue?: string;
  onContinue: (nombre: string) => void;
  onBack: () => void;
}

export function PasoNombrePadre({ initialValue = "", onContinue, onBack }: Props) {
  const [nombre, setNombre] = useState(initialValue);
  const [error, setError] = useState("");

  const handleContinue = () => {
    const trimmed = nombre.trim();
    if (!trimmed) {
      setError("Ingresa tu nombre");
      return;
    }
    if (trimmed.length < 2) {
      setError("El nombre es demasiado corto");
      return;
    }
    onContinue(trimmed);
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground text-center mb-2">
        ¿Cuál es tu nombre?
      </h2>
      <p className="text-muted-foreground text-center mb-8">
        Ingresa tu nombre completo
      </p>
      <div className="space-y-4 max-w-sm mx-auto">
        <Input
          type="text"
          placeholder="Ej: María García"
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value);
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
