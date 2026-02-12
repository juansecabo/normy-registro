"use client";

import { Card } from "./ui/card";

interface Props {
  onSelect: (perfil: "Estudiante" | "Padre de familia") => void;
}

export function PasoSeleccionPerfil({ onSelect }: Props) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground text-center mb-2">
        ¿Quién eres?
      </h2>
      <p className="text-muted-foreground text-center mb-8">
        Selecciona tu perfil para continuar con el registro
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card
          className="p-8 text-center hover:scale-[1.02] transition-transform"
          onClick={() => onSelect("Estudiante")}
        >
          <div className="text-5xl mb-4">🎓</div>
          <h3 className="text-lg font-semibold text-foreground">Estudiante</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Soy estudiante de la institución
          </p>
        </Card>
        <Card
          className="p-8 text-center hover:scale-[1.02] transition-transform"
          onClick={() => onSelect("Padre de familia")}
        >
          <div className="text-5xl mb-4">👨‍👩‍👧</div>
          <h3 className="text-lg font-semibold text-foreground">Padre de familia</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Tengo hijos en la institución
          </p>
        </Card>
      </div>
    </div>
  );
}
