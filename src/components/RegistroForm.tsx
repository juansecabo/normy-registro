"use client";

import { useState, useEffect, useCallback } from "react";
import { ProgressBar } from "./ProgressBar";
import { PasoSeleccionPerfil } from "./PasoSeleccionPerfil";
import { PasoCodigoEstudiante } from "./PasoCodigoEstudiante";
import { PasoConfirmarIdentidad } from "./PasoConfirmarIdentidad";
import { PasoNombrePadre } from "./PasoNombrePadre";
import { PasoNumeroEstudiantes } from "./PasoNumeroEstudiantes";
import { PasoResumen } from "./PasoResumen";
import { PasoExito } from "./PasoExito";
import { PasoYaRegistrado } from "./PasoYaRegistrado";

interface EstudianteInfo {
  codigo: string;
  nombre: string;
  apellidos: string;
  nivel: string;
  grado: string;
  salon: string;
}

type Perfil = "Estudiante" | "Padre de familia";
type NumEstudiantes = "1 (uno)" | "2 (dos)" | "3 (tres)";

interface FormState {
  perfil?: Perfil;
  estudiante?: EstudianteInfo;
  padreNombre?: string;
  padreNumEstudiantes?: NumEstudiantes;
  padreEstudiantes: EstudianteInfo[];
}

type PageStatus = "loading" | "invalid" | "already_registered" | "form" | "success";

export function RegistroForm({ contactId }: { contactId: string }) {
  const [status, setStatus] = useState<PageStatus>("loading");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({ padreEstudiantes: [] });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [pendingEstudiante, setPendingEstudiante] = useState<EstudianteInfo | null>(null);
  const [pendingPadreEstudiante, setPendingPadreEstudiante] = useState<EstudianteInfo | null>(null);

  const checkProfile = useCallback(async () => {
    try {
      const res = await fetch(`/api/obtener-perfil?id=${encodeURIComponent(contactId)}`);
      const data = await res.json();

      if (!data.existe) {
        setStatus("invalid");
        return;
      }

      if (data.ya_registrado) {
        setStatus("already_registered");
        return;
      }

      setStatus("form");
    } catch {
      setStatus("invalid");
    }
  }, [contactId]);

  useEffect(() => {
    checkProfile();
  }, [checkProfile]);

  const getTotalSteps = () => {
    if (!form.perfil) return 1;
    if (form.perfil === "Estudiante") return 4;
    const numMap: Record<string, number> = { "1 (uno)": 1, "2 (dos)": 2, "3 (tres)": 3 };
    const n = form.padreNumEstudiantes ? numMap[form.padreNumEstudiantes] : 1;
    return 3 + n * 2 + 1;
  };

  // Get codes already confirmed by the parent (to prevent duplicates)
  const getCodigosYaUsados = (excludeIndex?: number) => {
    return form.padreEstudiantes
      .filter((_, i) => i !== excludeIndex)
      .map((e) => e.codigo);
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    setSubmitError("");

    try {
      const body: Record<string, string | undefined> = {
        id: contactId,
        perfil: form.perfil,
      };

      if (form.perfil === "Estudiante" && form.estudiante) {
        body.estudiante_codigo = form.estudiante.codigo;
      } else if (form.perfil === "Padre de familia") {
        body.padre_nombre = form.padreNombre;
        body.padre_numero_de_estudiantes = form.padreNumEstudiantes;
        form.padreEstudiantes.forEach((est, i) => {
          body[`padre_estudiante${i + 1}_codigo`] = est.codigo;
        });
      }

      const res = await fetch("/api/guardar-perfil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || "Error al guardar. Intenta de nuevo.");
        return;
      }

      setStatus("success");
    } catch {
      setSubmitError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (targetStep: number) => {
    setStep(targetStep);
  };

  // === STATUS SCREENS ===

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="animate-fade-in text-center py-4">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Link inválido</h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Este enlace de registro no es válido. Escríbele a Normy por WhatsApp para recibir un enlace nuevo.
        </p>
      </div>
    );
  }

  if (status === "already_registered") return <PasoYaRegistrado />;
  if (status === "success") return (
    <PasoExito
      perfil={form.perfil}
      padreNombre={form.padreNombre}
      padreNumEstudiantes={form.padreNumEstudiantes}
    />
  );

  // === STEP 1: Profile selection ===
  if (step === 1) {
    return (
      <PasoSeleccionPerfil
        onSelect={(perfil) => {
          setForm({ ...form, perfil, estudiante: undefined, padreEstudiantes: [] });
          setPendingEstudiante(null);
          setPendingPadreEstudiante(null);
          setStep(2);
        }}
      />
    );
  }

  // === STUDENT FLOW ===
  if (form.perfil === "Estudiante") {
    if (step === 2) {
      return (
        <>
          <ProgressBar currentStep={2} totalSteps={getTotalSteps()} />
          <PasoCodigoEstudiante
            perfil="Estudiante"
            onValidado={(codigo, est) => {
              setPendingEstudiante({ codigo, ...est });
              setStep(3);
            }}
            onBack={() => {
              setForm({ ...form, perfil: undefined, estudiante: undefined });
              setPendingEstudiante(null);
              setStep(1);
            }}
          />
        </>
      );
    }

    if (step === 3 && pendingEstudiante) {
      return (
        <>
          <ProgressBar currentStep={3} totalSteps={getTotalSteps()} />
          <PasoConfirmarIdentidad
            nombre={pendingEstudiante.nombre}
            apellidos={pendingEstudiante.apellidos}
            nivel={pendingEstudiante.nivel}
            grado={pendingEstudiante.grado}
            salon={pendingEstudiante.salon}
            onConfirm={() => {
              setForm({ ...form, estudiante: pendingEstudiante });
              setPendingEstudiante(null);
              setStep(4);
            }}
            onDeny={() => {
              setPendingEstudiante(null);
              setStep(2);
            }}
          />
        </>
      );
    }

    if (step === 4 && form.estudiante) {
      return (
        <>
          <ProgressBar currentStep={4} totalSteps={getTotalSteps()} />
          <PasoResumen
            perfil="Estudiante"
            estudiante={form.estudiante}
            onEdit={handleEdit}
            onSubmit={handleSubmit}
            loading={submitLoading}
            error={submitError}
          />
        </>
      );
    }
  }

  // === PARENT FLOW ===
  if (form.perfil === "Padre de familia") {
    if (step === 2) {
      return (
        <>
          <ProgressBar currentStep={2} totalSteps={getTotalSteps()} />
          <PasoNombrePadre
            initialValue={form.padreNombre}
            onContinue={(nombre) => {
              setForm({ ...form, padreNombre: nombre });
              setStep(3);
            }}
            onBack={() => {
              setForm({ ...form, perfil: undefined });
              setStep(1);
            }}
          />
        </>
      );
    }

    if (step === 3) {
      return (
        <>
          <ProgressBar currentStep={3} totalSteps={getTotalSteps()} />
          <PasoNumeroEstudiantes
            onSelect={(num) => {
              setForm({ ...form, padreNumEstudiantes: num, padreEstudiantes: [] });
              setStep(4);
            }}
            onBack={() => setStep(2)}
          />
        </>
      );
    }

    const numMap: Record<string, number> = { "1 (uno)": 1, "2 (dos)": 2, "3 (tres)": 3 };
    const totalStudents = form.padreNumEstudiantes ? numMap[form.padreNumEstudiantes] : 0;

    // Each student has 2 substeps: code (even offset) + confirm (odd offset)
    if (step >= 4 && step < 4 + totalStudents * 2) {
      const studentIndex = Math.floor((step - 4) / 2);
      const isCodeStep = (step - 4) % 2 === 0;

      if (isCodeStep) {
        const ordinal = totalStudents > 1 ? ` ${studentIndex + 1}` : "";
        return (
          <>
            <ProgressBar currentStep={step} totalSteps={getTotalSteps()} />
            <PasoCodigoEstudiante
              label={`Documento del estudiante${ordinal}`}
              subtitle="Ingresa el número de documento de tu hijo/a"
              perfil="Padre de familia"
              codigosYaUsados={getCodigosYaUsados(studentIndex)}
              onValidado={(codigo, est) => {
                setPendingPadreEstudiante({ codigo, ...est });
                setStep(step + 1);
              }}
              onBack={() => {
                if (studentIndex === 0) {
                  setStep(3);
                } else {
                  const updated = [...form.padreEstudiantes];
                  updated.pop();
                  setForm({ ...form, padreEstudiantes: updated });
                  setStep(step - 2);
                }
              }}
            />
          </>
        );
      }

      if (pendingPadreEstudiante) {
        return (
          <>
            <ProgressBar currentStep={step} totalSteps={getTotalSteps()} />
            <PasoConfirmarIdentidad
              nombre={pendingPadreEstudiante.nombre}
              apellidos={pendingPadreEstudiante.apellidos}
              nivel={pendingPadreEstudiante.nivel}
              grado={pendingPadreEstudiante.grado}
              salon={pendingPadreEstudiante.salon}
              onConfirm={() => {
                const updated = [...form.padreEstudiantes];
                updated[studentIndex] = pendingPadreEstudiante;
                setForm({ ...form, padreEstudiantes: updated });
                setPendingPadreEstudiante(null);

                if (studentIndex + 1 < totalStudents) {
                  setStep(step + 1);
                } else {
                  setStep(4 + totalStudents * 2);
                }
              }}
              onDeny={() => {
                setPendingPadreEstudiante(null);
                setStep(step - 1);
              }}
            />
          </>
        );
      }
    }

    const summaryStep = 4 + totalStudents * 2;
    if (step === summaryStep && form.padreEstudiantes.length === totalStudents) {
      return (
        <>
          <ProgressBar currentStep={summaryStep} totalSteps={getTotalSteps()} />
          <PasoResumen
            perfil="Padre de familia"
            padreNombre={form.padreNombre}
            padreNumEstudiantes={form.padreNumEstudiantes}
            padreEstudiantes={form.padreEstudiantes}
            onEdit={(targetStep) => {
              if (targetStep <= 3) {
                handleEdit(targetStep);
              } else {
                const studIdx = targetStep - 4;
                const codeStep = 4 + studIdx * 2;
                handleEdit(codeStep);
              }
            }}
            onSubmit={handleSubmit}
            loading={submitLoading}
            error={submitError}
          />
        </>
      );
    }
  }

  // Fallback: go to step 1
  return (
    <PasoSeleccionPerfil
      onSelect={(perfil) => {
        setForm({ ...form, perfil, estudiante: undefined, padreEstudiantes: [] });
        setStep(2);
      }}
    />
  );
}
