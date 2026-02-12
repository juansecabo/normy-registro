"use client";

import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface Props {
  nombre: string;
  apellidos: string;
  nivel: string;
  grado: string;
  salon: string;
  esPadre?: boolean;
  onConfirm: () => void;
  onDeny: () => void;
}

export function PasoConfirmarIdentidad({
  nombre,
  apellidos,
  nivel,
  grado,
  salon,
  esPadre = false,
  onConfirm,
  onDeny,
}: Props) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground text-center mb-2">
        {esPadre ? "Confirma el estudiante" : "Confirma tu identidad"}
      </h2>
      <p className="text-muted-foreground text-center mb-8">
        {esPadre ? "¿Es este tu estudiante?" : "¿Eres esta persona?"}
      </p>
      <Card className="p-6 mb-6 max-w-sm mx-auto">
        <div className="space-y-3">
          <div>
            <span className="text-sm text-muted-foreground">Nombre</span>
            <p className="font-semibold text-foreground">{nombre} {apellidos}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Nivel</span>
            <p className="font-semibold text-foreground">{nivel}</p>
          </div>
          <div className="flex gap-6">
            <div>
              <span className="text-sm text-muted-foreground">Grado</span>
              <p className="font-semibold text-foreground">{grado}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Salón</span>
              <p className="font-semibold text-foreground">{salon}</p>
            </div>
          </div>
        </div>
      </Card>
      <div className="flex gap-3 max-w-sm mx-auto">
        <Button variant="outline" onClick={onDeny} className="flex-1">
          {esPadre ? "No, no es" : "No, no soy yo"}
        </Button>
        <Button onClick={onConfirm} className="flex-1">
          {esPadre ? "Sí, es mi estudiante" : "Sí, soy yo"}
        </Button>
      </div>
    </div>
  );
}
