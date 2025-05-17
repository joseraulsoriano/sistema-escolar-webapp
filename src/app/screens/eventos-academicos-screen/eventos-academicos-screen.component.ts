import { Component, OnInit, ViewChild } from '@angular/core';
import { EventosService } from 'src/app/services/eventos.service';
import { Evento } from 'src/app/modals/evento-admin/evento.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog'; // Descomenta si usas el modal de eliminar
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-eventos-academicos-screen',
  templateUrl: './eventos-academicos-screen.component.html',
  styleUrls: ['./eventos-academicos-screen.component.scss']
})
export class EventosAcademicosScreenComponent implements OnInit {
  eventos: Evento[] = [];
  dataSource = new MatTableDataSource<Evento>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  loading = true;
  error = '';
  name_user = '';
  rol = '';
  displayedColumns: string[] = [
    'nombre_evento',
    'tipo_evento',
    'fecha_realizacion',
    'hora_inicio',
    'hora_final',
    'lugar',
    'publico_objetivo',
    'programa_educativo',
    'descripcion_breve',
    'cupo_maximo',
    'actualizar',
    'eliminar'
  ];

  constructor(private eventosService: EventosService, private facadeService: FacadeService) {}

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();

    this.eventosService.obtenerEventos().subscribe({
      next: (data) => {
        this.eventos = data.results;
        this.dataSource = new MatTableDataSource(this.eventos);
        this.dataSource.paginator = this.paginator;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudieron cargar los eventos.';
        this.loading = false;
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  editarEvento(evento: any) {
    // Lógica para editar (puedes abrir un modal o navegar a un formulario)
    console.log('Editar', evento);
  }

  eliminarEvento(evento: any) {
    // Lógica para eliminar (puedes abrir un modal de confirmación)
    console.log('Eliminar', evento);
  }
}
