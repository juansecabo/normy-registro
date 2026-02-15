"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface Props {
  onContinue: (contrasena: string) => void;
  onBack: () => void;
}

export function PasoCredenciales({ onContinue, onBack }: Props) {
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (!contrasena) {
      setError("Ingresa una contraseña");
      return;
    }
    if (contrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (contrasena !== confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }
    onContinue(contrasena);
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground text-center mb-2">
        Crea tu contraseña
      </h2>
      <p className="text-muted-foreground text-center mb-8">
        Esta contraseña te servirá para ingresar a la plataforma
      </p>
      <div className="space-y-4 max-w-sm mx-auto">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            label="Contraseña"
            placeholder="Mínimo 6 caracteres"
            value={contrasena}
            onChange={(e) => {
              setContrasena(e.target.value);
              setError("");
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] p-1 cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground" /> : <Eye className="w-5 h-5 text-muted-foreground" />}
          </button>
        </div>
        <div className="relative">
          <Input
            type={showConfirm ? "text" : "password"}
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
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-[38px] p-1 cursor-pointer"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff className="w-5 h-5 text-muted-foreground" /> : <Eye className="w-5 h-5 text-muted-foreground" />}
          </button>
        </div>
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
