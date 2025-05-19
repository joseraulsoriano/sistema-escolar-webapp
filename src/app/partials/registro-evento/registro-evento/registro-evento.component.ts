import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Evento } from 'src/app/modals/evento-admin/evento.model';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { EventosService } from 'src/app/services/eventos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmacionModalComponent } from 'src/app/modals/confirmacion-modal/confirmacion-modal.component';

@Component({
  selector: 'app-registro-evento',
  templateUrl: './registro-evento.component.html',
  styleUrls: ['./registro-evento.component.scss']
})
export class RegistroEventoComponent implements OnInit {
  eventoForm: FormGroup;
  eventoId: number | null = null;
  tiposEvento = ['Conferencia', 'Taller', 'Seminario', 'Concurso'];
  publicos = [
    { label: 'Estudiantes', value: 'Estudiantes' },
    { label: 'Profesores', value: 'Profesores' },
    { label: 'Público general', value: 'Publico general' }
  ];
  programasEducativos = [
    'Ingeniería en Ciencias de la Computación',
    'Licenciatura en Ciencias de la Computación',
    'Ingeniería en Tecnologías de la Información'
  ];
  mostrarProgramaEducativo = false;
  responsables: any[] = [];
  loadingResponsables = false;
  successMessage: string = '';
  errorMessage: string = '';
  minDate = new Date();

  admins: any[] = [];
  maestros: any[] = [];

  public timepickerConfig = {
    format: 24,
    minTime: '00:00',
    maxTime: '23:59'
  };

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private adminService: AdministradoresService,
    private maestroService: MaestrosService,
    private eventoService: EventosService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.eventoForm = this.fb.group({
      nombre_evento: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]+$/)]],
      tipo_evento: ['', Validators.required],
      fecha_realizacion: ['', Validators.required],
      hora_inicio: ['', Validators.required],
      hora_final: ['', Validators.required],
      lugar: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]+$/)]],
      publico_objetivo: ['', Validators.required],
      programa_educativo: [''],
      responsable: ['', Validators.required],
      descripcion_breve: ['', [Validators.required, Validators.maxLength(300), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 .,;:¡!¿?()\-]+$/)]],
      cupo_maximo: ['', [Validators.required, Validators.pattern(/^[1-9][0-9]{0,2}$/)]]
    });
    this.adminService.obtenerListaAdmins().subscribe(data => {
      this.admins = data.map(a => ({...a, tipo: 'admin'}));
      this.updateResponsables();
    });
    this.maestroService.obtenerListaMaestros().subscribe(data => {
      this.maestros = data.map(m => ({...m, tipo: 'maestro'}));
      this.updateResponsables();
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.eventoId = +id;
        this.esperarResponsablesYCargarEvento(this.eventoId);
      }
    });
    this.eventoForm.get('publico_objetivo')?.valueChanges.subscribe(valor => {
      this.mostrarProgramaEducativo = valor === 'Estudiantes';
      const programaCtrl = this.eventoForm.get('programa_educativo');
      if (valor === 'Estudiantes') {
        programaCtrl?.setValidators([Validators.required]);
      } else {
        programaCtrl?.clearValidators();
        programaCtrl?.setValue('');
      }
      programaCtrl?.updateValueAndValidity();
    });
  }

  esperarResponsablesYCargarEvento(id: number) {
    if (this.responsables.length === 0) {
      console.log('Esperando a que se carguen los responsables...');
      const checkInterval = setInterval(() => {
        if (this.responsables.length > 0) {
          clearInterval(checkInterval);
          this.cargarEvento(id);
        }
      }, 300);
    } else {
      this.cargarEvento(id);
    }
  }

  validarHoras(): boolean {
    const inicio = this.eventoForm.get('hora_inicio')?.value;
    const final = this.eventoForm.get('hora_final')?.value;
    if (!inicio || !final) return false;
    const [inicioHora, inicioMinuto] = inicio.split(':').map(Number);
    const [finalHora, finalMinuto] = final.split(':').map(Number);
    const inicioMinutos = inicioHora * 60 + inicioMinuto;
    const finalMinutos = finalHora * 60 + finalMinuto;
    return finalMinutos > inicioMinutos;
  }

  onSubmit() {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.validarHoras()) {
      this.eventoForm.get('hora_final')?.setErrors({ horaInvalida: true });
      this.errorMessage = 'La hora final debe ser mayor que la de inicio.';
      return;
    }
    if (this.eventoForm.invalid) {
      this.eventoForm.markAllAsTouched();
      this.errorMessage = 'Por favor, completa todos los campos obligatorios correctamente.';
      return;
    }

    const formValue = this.eventoForm.value;
    const publico = formValue.publico_objetivo;

    if (publico === 'Estudiantes' && !formValue.programa_educativo) {
      this.errorMessage = 'Selecciona el programa educativo';
      return;
    }

    let payload: any = {
      ...formValue,
      fecha_realizacion: formValue.fecha_realizacion
        ? new Date(formValue.fecha_realizacion).toISOString().slice(0, 10)
        : '',
      publico_objetivo: publico === 'Público general' ? 'Publico general' : publico,
      responsable_maestro: null,
      responsable_admin: null
    };

    const responsable: any = this.responsables.find(r => r.id == formValue.responsable?.id);
    if (responsable?.tipo === 'maestro') {
      payload.responsable_maestro = responsable.id;
    } else if (responsable?.tipo === 'admin') {
      payload.responsable_admin = responsable.id;
    }
    delete payload.responsable;

    if (this.eventoId) {
      // Modal de confirmación para editar
      const dialogRef = this.dialog.open(ConfirmacionModalComponent, {
        data: {
          titulo: 'Editar evento académico',
          mensaje: 'Estás a punto de editar este evento y se generarán los cambios',
          botonAceptar: 'EDITAR',
          botonCancelar: 'CANCELAR'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Si confirmó, continuar con la edición
          if (this.eventoId !== null) {
            this.eventoService.editarEvento(this.eventoId, payload).subscribe({
              next: () => {
                this.successMessage = '¡Evento editado correctamente!';
                this.errorMessage = '';
                setTimeout(() => {
                  this.router.navigate(['/eventos-academicos']);
                }, 1200);
              },
              error: () => {
                this.errorMessage = 'No se pudo editar el evento.';
                this.successMessage = '';
              }
            });
          }
        }
      });
    } else {
      this.eventoService.crearEvento(payload).subscribe({
        next: () => {
          this.successMessage = '¡Evento registrado correctamente!';
          this.errorMessage = '';
          setTimeout(() => {
            this.router.navigate(['/eventos-academicos']);
          }, 1200);
        },
        error: () => {
          this.errorMessage = 'No se pudo registrar el evento.';
          this.successMessage = '';
        }
      });
    }
  }

  updateResponsables() {
    this.responsables = [...this.admins, ...this.maestros];
  }

  getError(controlName: string): string {
    const control = this.eventoForm.get(controlName);
    if (control?.hasError('required')) return 'Este campo es obligatorio';
    if (controlName === 'nombre_evento' && control?.hasError('pattern')) return 'Solo letras, números y espacios. No se permiten caracteres especiales.';
    if (controlName === 'lugar' && control?.hasError('pattern')) return 'Solo letras, números y espacios.';
    if (controlName === 'descripcion_breve' && control?.hasError('pattern')) return 'Solo letras, números y signos de puntuación básicos.';
    if (controlName === 'descripcion_breve' && control?.hasError('maxlength')) return 'Máximo 300 caracteres.';
    if (controlName === 'cupo_maximo' && control?.hasError('pattern')) return 'Solo números positivos, máximo 3 dígitos.';
    if (controlName === 'hora_final' && control?.hasError('horaInvalida')) return 'La hora final debe ser mayor que la de inicio.';
    return '';
  }

  cargarEvento(id: number) {
    console.log('Cargando evento con ID:', id);
    this.eventoService.obtenerEventoPorId(id).subscribe(evento => {
      console.log('Datos del evento recibidos:', evento);
      
      // Adaptar la fecha (string a objeto Date)
      const fecha = evento.fecha_realizacion ? new Date(evento.fecha_realizacion) : null;
      
      // Adaptar horas (quitar los segundos)
      const horaInicio = evento.hora_inicio ? evento.hora_inicio.substring(0, 5) : '';
      const horaFinal = evento.hora_final ? evento.hora_final.substring(0, 5) : '';
      
      // Buscar el responsable en la lista
      let responsable: any = null;
      if (evento.responsable_maestro) {
        responsable = this.responsables.find(r => r.tipo === 'maestro' && r.id === evento.responsable_maestro);
        console.log('Responsable maestro encontrado:', responsable);
      } else if (evento.responsable_admin) {
        responsable = this.responsables.find(r => r.tipo === 'admin' && r.id === evento.responsable_admin);
        console.log('Responsable admin encontrado:', responsable);
      }
      
      // Llenar el formulario con los datos
      this.eventoForm.patchValue({
        nombre_evento: evento.nombre_evento,
        tipo_evento: evento.tipo_evento,
        fecha_realizacion: fecha,
        hora_inicio: horaInicio,  // Formato HH:MM (sin segundos)
        hora_final: horaFinal,    // Formato HH:MM (sin segundos)
        lugar: evento.lugar,
        publico_objetivo: evento.publico_objetivo,
        programa_educativo: evento.programa_educativo,
        responsable: responsable ? { tipo: responsable.tipo, id: responsable.id } : '',
        descripcion_breve: evento.descripcion_breve,
        cupo_maximo: evento.cupo_maximo
      });
      
      // Activar la validación del programa educativo si es necesario
      if (evento.publico_objetivo === 'Estudiantes') {
        this.mostrarProgramaEducativo = true;
      }
    });
  }

  irAlHome() {
    this.router.navigate(['/home']);
  }
}
