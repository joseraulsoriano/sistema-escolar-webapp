export interface Evento {
  nombre: string;
  tipo: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  lugar: string;
  publico_objetivo: string[];
  responsable: { tipo: string, id: number };
  descripcion?: string;
  cupo: number;
}
