import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const codigo = request.nextUrl.searchParams.get("codigo");
  const perfil = request.nextUrl.searchParams.get("perfil") || "Estudiante";

  if (!codigo) {
    return NextResponse.json({ error: "Falta el parámetro codigo" }, { status: 400 });
  }

  // Look up the student in the Estudiantes table
  const { data: estudiante, error } = await supabase
    .from("Estudiantes")
    .select("codigo_estudiantil, nombre_estudiante, apellidos_estudiante, nivel_estudiante, grado_estudiante, salon_estudiante")
    .eq("codigo_estudiantil", codigo)
    .single();

  if (error || !estudiante) {
    return NextResponse.json({ existe: false, ya_registrado: false });
  }

  let ya_registrado = false;
  let mensaje = "";

  if (perfil === "Estudiante") {
    // Check the code isn't already taken by another student
    const { data: existing } = await supabase
      .from("Perfiles_Generales")
      .select("id")
      .eq("estudiante_codigo", codigo)
      .limit(1);

    if (existing && existing.length > 0) {
      ya_registrado = true;
      mensaje = "Ya alguien se registró con esta identificación. Comunícate con la institución.";
    }

    // Check the code isn't already used as a parent identification
    if (!ya_registrado) {
      const { data: existingPadre } = await supabase
        .from("Perfiles_Generales")
        .select("id")
        .eq("padre_codigo", codigo)
        .not("padre_codigo", "is", null)
        .limit(1);

      if (existingPadre && existingPadre.length > 0) {
        ya_registrado = true;
        mensaje = "Ya alguien se registró con esta identificación como padre de familia. Comunícate con la institución.";
      }
    }
  }

  return NextResponse.json({
    existe: true,
    ya_registrado,
    mensaje,
    estudiante: {
      nombre: estudiante.nombre_estudiante,
      apellidos: estudiante.apellidos_estudiante,
      nivel: estudiante.nivel_estudiante,
      grado: estudiante.grado_estudiante,
      salon: estudiante.salon_estudiante,
    },
  });
}
