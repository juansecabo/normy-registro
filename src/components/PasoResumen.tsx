"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface EstudianteInfo {
  codigo: string;
  nombre: string;
  apellidos: string;
  nivel: string;
  grado: string;
  salon: string;
}

interface Props {
  perfil: "Estudiante" | "Padre de familia";
  estudiante?: EstudianteInfo;
  contrasena?: string;
  padreCodigo?: string;
  padreNombre?: string;
  padreNumEstudiantes?: string;
  padreEstudiantes?: EstudianteInfo[];
  credentialStep: number;
  identificationStep?: number;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  loading: boolean;
  error?: string;
}

export function PasoResumen({
  perfil,
  estudiante,
  contrasena,
  padreCodigo,
  padreNombre,
  padreNumEstudiantes,
  padreEstudiantes,
  credentialStep,
  identificationStep,
  onEdit,
  onSubmit,
  loading,
  error,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground text-center mb-2">
        Revisa tus datos
      </h2>
      <p className="text-muted-foreground text-center mb-8">
        Confirma que todo esté correcto antes de completar el registro
      </p>

      <div className="space-y-4 max-w-md mx-auto">
        {/* Profile type */}
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-muted-foreground">Perfil</span>
              <p className="font-semibold text-foreground">{perfil}</p>
            </div>
            <button
              onClick={() => onEdit(1)}
              className="text-sm text-primary font-medium hover:underline cursor-pointer"
            >
              Cambiar
            </button>
          </div>
        </Card>

        {/* Student info */}
        {perfil === "Estudiante" && estudiante && (
          <Card className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Estudiante</span>
                  <p className="font-semibold text-foreground">
                    {estudiante.nombre} {estudiante.apellidos}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Documento</span>
                  <p className="font-medium text-foreground">{estudiante.codigo}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Grado</span>
                    <p className="font-medium text-foreground">{estudiante.grado}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Salón</span>
                    <p className="font-medium text-foreground">{estudiante.salon}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onEdit(2)}
                className="text-sm text-primary font-medium hover:underline cursor-pointer"
              >
                Cambiar
              </button>
            </div>
          </Card>
        )}

        {/* Parent info */}
        {perfil === "Padre de familia" && (
          <>
            <Card className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-muted-foreground">Nombre</span>
                  <p className="font-semibold text-foreground">{padreNombre}</p>
                </div>
                <button
                  onClick={() => onEdit(2)}
                  className="text-sm text-primary font-medium hover:underline cursor-pointer"
                >
                  Cambiar
                </button>
              </div>
            </Card>

            {padreCodigo && (
              <Card className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm text-muted-foreground">Identificación</span>
                    <p className="font-semibold text-foreground">{padreCodigo}</p>
                  </div>
                  <button
                    onClick={() => onEdit(identificationStep || 3)}
                    className="text-sm text-primary font-medium hover:underline cursor-pointer"
                  >
                    Cambiar
                  </button>
                </div>
              </Card>
            )}

            <Card className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-muted-foreground">Estudiantes a cargo</span>
                  <p className="font-semibold text-foreground">{padreNumEstudiantes}</p>
                </div>
                <button
                  onClick={() => onEdit(4)}
                  className="text-sm text-primary font-medium hover:underline cursor-pointer"
                >
                  Cambiar
                </button>
              </div>
            </Card>

            {padreEstudiantes?.map((est, i) => (
              <Card key={i} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">
                      Estudiante {i + 1}
                    </span>
                    <p className="font-semibold text-foreground">
                      {est.nombre} {est.apellidos}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Doc: {est.codigo} · {est.grado} - Salón {est.salon}
                    </p>
                  </div>
                  <button
                    onClick={() => onEdit(5 + i * 2)}
                    className="text-sm text-primary font-medium hover:underline cursor-pointer"
                  >
                    Cambiar
                  </button>
                </div>
              </Card>
            ))}
          </>
        )}

        {/* Password */}
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-muted-foreground">Contraseña</span>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">
                  {showPassword ? contrasena : "•".repeat(contrasena?.length || 6)}
                </p>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
            </div>
            <button
              onClick={() => onEdit(credentialStep)}
              className="text-sm text-primary font-medium hover:underline cursor-pointer"
            >
              Cambiar
            </button>
          </div>
        </Card>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm text-center">
            {error}
          </div>
        )}

        <Button onClick={onSubmit} disabled={loading} className="w-full" size="lg">
          {loading ? "Guardando..." : "Completar registro"}
        </Button>
      </div>
    </div>
  );
}
