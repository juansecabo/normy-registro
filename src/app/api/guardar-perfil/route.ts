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
    .select("perfil, numero_de_telefono")
    .eq("numero_de_telefono", id)
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
    if (!campos.estudiante_id) {
      return NextResponse.json({ error: "Falta el id estudiantil" }, { status: 400 });
    }
    updateData.estudiante_id = campos.estudiante_id;
  } else if (perfil === "Padre de familia") {
    if (!campos.padre_nombre || !campos.padre_numero_de_estudiantes) {
      return NextResponse.json({ error: "Faltan datos del padre" }, { status: 400 });
    }
    updateData.padre_nombre = campos.padre_nombre;
    updateData.padre_numero_de_estudiantes = campos.padre_numero_de_estudiantes;
    if (campos.padre_id) {
      updateData.padre_id = campos.padre_id;
    }

    // Add student ids based on number of students
    const numMap: Record<string, number> = {
      "1 (uno)": 1,
      "2 (dos)": 2,
      "3 (tres)": 3,
      "4 (cuatro)": 4,
    };
    const num = numMap[campos.padre_numero_de_estudiantes] || 0;

    for (let i = 1; i <= num; i++) {
      const idKey = `padre_estudiante${i}_id`;
      if (!campos[idKey]) {
        return NextResponse.json({ error: `Falta el id del estudiante ${i}` }, { status: 400 });
      }
      updateData[idKey] = campos[idKey];
    }
  }

  // Check for duplicate ids within the same submission
  const allIds: string[] = [];
  if (updateData.estudiante_id) allIds.push(updateData.estudiante_id);
  for (let i = 1; i <= 4; i++) {
    const key = `padre_estudiante${i}_id`;
    if (updateData[key]) allIds.push(updateData[key]!);
  }
  const uniqueIds = new Set(allIds);
  if (uniqueIds.size !== allIds.length) {
    return NextResponse.json({ error: "No puedes registrar el mismo id para más de un estudiante" }, { status: 400 });
  }

  // Server-side re-validation: check all ids exist in Estudiantes
  for (const idEstudiantil of allIds) {
    const { data: est } = await supabase
      .from("Estudiantes")
      .select("id_estudiantil")
      .eq("id_estudiantil", idEstudiantil)
      .single();

    if (!est) {
      return NextResponse.json({ error: `Documento ${idEstudiantil} no encontrado` }, { status: 400 });
    }
  }

  // Cross-validation: ensure identification isn't used in the other profile type
  if (perfil === "Padre de familia" && updateData.padre_id) {
    const { data: dupPadre } = await supabase
      .from("Perfiles_Generales")
      .select("numero_de_telefono")
      .eq("padre_id", updateData.padre_id)
      .not("padre_id", "is", null)
      .limit(1);

    if (dupPadre && dupPadre.length > 0) {
      return NextResponse.json({
        error: "Ya alguien se registró con esta identificación. Comunícate con la institución.",
      }, { status: 409 });
    }

    const { data: dupAsEstudiante } = await supabase
      .from("Perfiles_Generales")
      .select("numero_de_telefono")
      .eq("estudiante_id", updateData.padre_id)
      .limit(1);

    if (dupAsEstudiante && dupAsEstudiante.length > 0) {
      return NextResponse.json({
        error: "Ya alguien se registró con esta identificación como estudiante. Comunícate con la institución.",
      }, { status: 409 });
    }
  }

  if (perfil === "Estudiante" && updateData.estudiante_id) {
    const { data: dup } = await supabase
      .from("Perfiles_Generales")
      .select("numero_de_telefono")
      .eq("estudiante_id", updateData.estudiante_id)
      .limit(1);

    if (dup && dup.length > 0) {
      return NextResponse.json({
        error: "Ya alguien se registró con esta identificación. Comunícate con la institución.",
      }, { status: 409 });
    }

    const { data: dupAsPadre } = await supabase
      .from("Perfiles_Generales")
      .select("numero_de_telefono")
      .eq("padre_id", updateData.estudiante_id)
      .not("padre_id", "is", null)
      .limit(1);

    if (dupAsPadre && dupAsPadre.length > 0) {
      return NextResponse.json({
        error: "Ya alguien se registró con esta identificación como padre de familia. Comunícate con la institución.",
      }, { status: 409 });
    }
  }

  // Perform the update
  const { error } = await supabase
    .from("Perfiles_Generales")
    .update(updateData)
    .eq("numero_de_telefono", id);

  if (error) {
    return NextResponse.json({ error: "Error al guardar el perfil" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
