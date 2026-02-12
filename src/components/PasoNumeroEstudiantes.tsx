"use client";

import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface Props {
  onSelect: (numero: "1 (uno)" | "2 (dos)" | "3 (tres)") => void;
  onBack: () => void;
}

export function PasoNumeroEstudiantes({ onSelect, onBack }: Props) {
  const opciones: { label: string; value: "1 (uno)" | "2 (dos)" | "3 (tres)" }[] = [
    { label: "1", value: "1 (uno)" },
    { label: "2", value: "2 (dos)" },
    { label: "3", value: "3 (tres)" },
  ];

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground text-center mb-2">
        ¿Cuántos estudiantes tienes a cargo?
      </h2>
      <p className="text-muted-foreground text-center mb-8">
        Estudiantes matriculados en la institución
      </p>
      <div className="flex gap-4 justify-center mb-6">
        {opciones.map((op) => (
          <Card
            key={op.value}
            className="w-24 h-24 flex items-center justify-center hover:scale-105 transition-transform"
            onClick={() => onSelect(op.value)}
          >
            <span className="text-3xl font-bold text-primary">{op.label}</span>
          </Card>
        ))}
      </div>
      <div className="max-w-sm mx-auto">
        <Button variant="outline" onClick={onBack} className="w-full">
          Atrás
        </Button>
      </div>
    </div>
  );
}
