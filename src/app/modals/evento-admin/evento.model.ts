export interface Evento {
  id?: number;
  nombre_evento: string;
  tipo_evento: string;
  fecha_realizacion: string;
  hora_inicio: string;
  hora_final: string;
  lugar: string;
  publico_objetivo: string;
  programa_educativo: string;
  descripcion_breve: string;
  cupo_maximo: number;
  creation?: string;
  update?: string;
  responsable_maestro?: number | null;
  responsable_admin?: number | null;
}

export interface EventosResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[]; // Puedes cambiar 'any' por 'Evento' si los campos coinciden exactamente
}
