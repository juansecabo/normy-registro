"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface Props {
  perfil: "Estudiante" | "Padre de familia";
  initialPadreCodigo?: string;
  onContinue: (data: { padreCodigo?: string; contrasena: string }) => void;
  onBack: () => void;
}

export function PasoCredenciales({ perfil, initialPadreCodigo = "", onContinue, onBack }: Props) {
  const esPadre = perfil === "Padre de familia";
  const [padreCodigo, setPadreCodigo] = useState(initialPadreCodigo);
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (esPadre && !padreCodigo.trim()) {
      setError("Ingresa tu número de identificación");
      return;
    }
    if (!contrasena) {
      setError("Ingresa una contraseña");
      return;
    }
    if (contrasena.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres");
      return;
    }
    if (contrasena !== confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }

    onContinue({
      padreCodigo: esPadre ? padreCodigo.trim() : undefined,
      contrasena,
    });
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground text-center mb-2">
        {esPadre ? "Identificación y contraseña" : "Crea tu contraseña"}
      </h2>
      <p className="text-muted-foreground text-center mb-8">
        {esPadre
          ? "Ingresa tu número de identificación y crea una contraseña para la plataforma"
          : "Esta contraseña te servirá para ingresar a la plataforma"}
      </p>
      <div className="space-y-4 max-w-sm mx-auto">
        {esPadre && (
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            label="Número de identificación"
            placeholder="Ej: 1103127132"
            value={padreCodigo}
            onChange={(e) => {
              setPadreCodigo(e.target.value);
              setError("");
            }}
          />
        )}
        <Input
          type="password"
          label="Contraseña"
          placeholder="Mínimo 4 caracteres"
          value={contrasena}
          onChange={(e) => {
            setContrasena(e.target.value);
            setError("");
          }}
        />
        <Input
          type="password"
          label="Confirmar contraseña"
          placeholder="Repite la contraseña"
          value={confirmar}
          onChange={(e) => {
            setConfirmar(e.target.value);
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
