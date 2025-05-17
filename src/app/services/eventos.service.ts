import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evento, EventosResponse } from 'src/app/modals/evento-admin/evento.model';

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private apiUrl = 'http://127.0.0.1:8000/eventos-academicos/';

  constructor(private http: HttpClient) {}

  // Crear un evento
  crearEvento(evento: Evento): Observable<any> {
    return this.http.post(`${this.apiUrl}`, evento);
  }

  // Obtener todos los eventos
  obtenerEventos(): Observable<EventosResponse> {
    return this.http.get<EventosResponse>(this.apiUrl);
  }

  // Obtener un evento por ID
  obtenerEventoPorId(id: number): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}${id}/`);
  }

  // Editar un evento
  editarEvento(id: number, evento: Evento): Observable<any> {
    return this.http.put(`${this.apiUrl}${id}/`, evento);
  }

  // Eliminar un evento
  eliminarEvento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}
