import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, perfil, ...campos } = body;

  if (!id || !perfil) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  // Verify the row exists
  const { data: existing } = await supabase
    .from("Perfiles_Generales")
    .select("id, perfil")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  // Don't block if partially filled - allow overwrite of incomplete registration

  // Build the update object
  const updateData: Record<string, string | null> = { perfil };

  // Save password for both profiles
  if (campos.contrasena) {
    updateData.contrasena = campos.contrasena;
  }

  if (perfil === "Estudiante") {
    if (!campos.estudiante_codigo) {
      return NextResponse.json({ error: "Falta el código estudiantil" }, { status: 400 });
    }
    updateData.estudiante_codigo = campos.estudiante_codigo;
  } else if (perfil === "Padre de familia") {
    if (!campos.padre_nombre || !campos.padre_numero_de_estudiantes) {
      return NextResponse.json({ error: "Faltan datos del padre" }, { status: 400 });
    }
    updateData.padre_nombre = campos.padre_nombre;
    updateData.padre_numero_de_estudiantes = campos.padre_numero_de_estudiantes;
    if (campos.padre_codigo) {
      updateData.padre_codigo = campos.padre_codigo;
    }

    // Add student codes based on number of students
    const numMap: Record<string, number> = {
      "1 (uno)": 1,
      "2 (dos)": 2,
      "3 (tres)": 3,
    };
    const num = numMap[campos.padre_numero_de_estudiantes] || 0;

    for (let i = 1; i <= num; i++) {
      const codigoKey = `padre_estudiante${i}_codigo`;
      if (!campos[codigoKey]) {
        return NextResponse.json({ error: `Falta el código del estudiante ${i}` }, { status: 400 });
      }
      updateData[codigoKey] = campos[codigoKey];
    }
  }

  // Check for duplicate codes within the same submission
  const allCodes: string[] = [];
  if (updateData.estudiante_codigo) allCodes.push(updateData.estudiante_codigo);
  for (let i = 1; i <= 3; i++) {
    const key = `padre_estudiante${i}_codigo`;
    if (updateData[key]) allCodes.push(updateData[key]!);
  }
  const uniqueCodes = new Set(allCodes);
  if (uniqueCodes.size !== allCodes.length) {
    return NextResponse.json({ error: "No puedes registrar el mismo código para más de un estudiante" }, { status: 400 });
  }

  // Server-side re-validation: check all codes exist in Estudiantes
  for (const codigo of allCodes) {
    const { data: est } = await supabase
      .from("Estudiantes")
      .select("codigo_estudiantil")
      .eq("codigo_estudiantil", codigo)
      .single();

    if (!est) {
      return NextResponse.json({ error: `Documento ${codigo} no encontrado` }, { status: 400 });
    }
  }

  // Cross-validation: ensure identification isn't used in the other profile type
  if (perfil === "Padre de familia" && updateData.padre_codigo) {
    const { data: dupPadre } = await supabase
      .from("Perfiles_Generales")
      .select("id")
      .eq("padre_codigo", updateData.padre_codigo)
      .not("padre_codigo", "is", null)
      .limit(1);

    if (dupPadre && dupPadre.length > 0) {
      return NextResponse.json({
        error: "Esta identificación ya está registrada",
      }, { status: 409 });
    }

    const { data: dupAsEstudiante } = await supabase
      .from("Perfiles_Generales")
      .select("id")
      .eq("estudiante_codigo", updateData.padre_codigo)
      .limit(1);

    if (dupAsEstudiante && dupAsEstudiante.length > 0) {
      return NextResponse.json({
        error: "Esta identificación ya está registrada como estudiante",
      }, { status: 409 });
    }
  }

  if (perfil === "Estudiante" && updateData.estudiante_codigo) {
    const { data: dup } = await supabase
      .from("Perfiles_Generales")
      .select("id")
      .eq("estudiante_codigo", updateData.estudiante_codigo)
      .limit(1);

    if (dup && dup.length > 0) {
      return NextResponse.json({
        error: "Este documento ya está registrado por otro estudiante",
      }, { status: 409 });
    }

    const { data: dupAsPadre } = await supabase
      .from("Perfiles_Generales")
      .select("id")
      .eq("padre_codigo", updateData.estudiante_codigo)
      .not("padre_codigo", "is", null)
      .limit(1);

    if (dupAsPadre && dupAsPadre.length > 0) {
      return NextResponse.json({
        error: "Este documento ya está registrado como padre de familia",
      }, { status: 409 });
    }
  }

  // Perform the update
  const { error } = await supabase
    .from("Perfiles_Generales")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Error al guardar el perfil" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
