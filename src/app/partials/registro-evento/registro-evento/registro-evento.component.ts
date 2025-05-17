import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Evento } from 'src/app/modals/evento-admin/evento.model';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { EventosService } from 'src/app/services/eventos.service';
@Component({
  selector: 'app-registro-evento',
  templateUrl: './registro-evento.component.html',
  styleUrls: ['./registro-evento.component.scss']
})
export class RegistroEventoComponent implements OnInit {
  eventoForm: FormGroup;
  tiposEvento = ['Conferencia', 'Taller', 'Seminario', 'Concurso'];
  publicos = [
    { label: 'Estudiantes', value: 'Estudiantes' },
    { label: 'Profesores', value: 'Profesores' },
    { label: 'Público general', value: 'Público general' }
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

  evento: Evento = {
    nombre: '',
    tipo: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    lugar: '',
    publico_objetivo: [],
    responsable: { tipo: '', id: 0 },
    descripcion: '',
    cupo: 0
  };

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
  ) {}

  ngOnInit(): void {
    this.eventoForm = this.fb.group({
      nombre_evento: ['', [Validators.required, Validators.pattern('^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]+$')]],
      tipo_evento: ['', Validators.required],
      fecha_realizacion: ['', Validators.required],
      hora_inicio: ['', Validators.required],
      hora_final: ['', Validators.required],
      lugar: ['', [Validators.required, Validators.pattern('^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]+$')]],
      publico_objetivo: this.fb.array([], Validators.required),
      programa_educativo: [''],
      responsable: ['', Validators.required],
      descripcion_breve: ['', [Validators.required, Validators.maxLength(300), Validators.pattern('^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 .,;:!¡¿?()\n\r]+$')]],
      cupo_maximo: ['', [Validators.required, Validators.pattern('^[1-9][0-9]{0,2}$')]]
    });
    const publicoArray = this.eventoForm.get('publico_objetivo') as FormArray;
    this.publicos.forEach(() => publicoArray.push(this.fb.control(false)));
    this.eventoForm.get('publico_objetivo')?.valueChanges.subscribe(valores => {
      const estudiantesSeleccionado = valores[0];
      this.mostrarProgramaEducativo = !!estudiantesSeleccionado;
      const programaCtrl = this.eventoForm.get('programa_educativo');
      if (estudiantesSeleccionado) {
        programaCtrl?.setValidators([Validators.required]);
      } else {
        programaCtrl?.clearValidators();
        programaCtrl?.setValue('');
      }
      programaCtrl?.updateValueAndValidity();
    });
    this.loadResponsables();
    this.adminService.obtenerListaAdmins().subscribe(data => {
      this.admins = data.map(a => ({...a, tipo: 'admin'}));
      this.updateResponsables();
    });
    this.maestroService.obtenerListaMaestros().subscribe(data => {
      this.maestros = data.map(m => ({...m, tipo: 'maestro'}));
      this.updateResponsables();
    });
  }

  loadResponsables() {
    this.loadingResponsables = true;
    this.eventoForm.get('responsable')?.disable();
    Promise.all([
      this.http.get<any[]>('http://127.0.0.1:8000/lista-maestros/').toPromise(),
      this.http.get<any[]>('http://127.0.0.1:8000/lista-admins/').toPromise()
    ]).then(([maestros = [], admins = []]) => {
      this.responsables = [
        ...maestros.map(m => ({ id: m.id, nombre: m.user.first_name + ' ' + m.user.last_name, tipo: 'maestro' })),
        ...admins.map(a => ({ id: a.id, nombre: a.user.first_name + ' ' + a.user.last_name, tipo: 'admin' }))
      ];
      this.loadingResponsables = false;
      this.eventoForm.get('responsable')?.enable();
    }).catch(() => {
      this.loadingResponsables = false;
      this.eventoForm.get('responsable')?.enable();
    });
  }

  onCheckboxChange(e: any) {
    const publicoArray: FormArray = this.eventoForm.get('publico_objetivo') as FormArray;
    if (e.checked) {
      publicoArray.push(this.fb.control(e.source.value));
    } else {
      const idx = publicoArray.controls.findIndex(x => x.value === e.source.value);
      if (idx !== -1) publicoArray.removeAt(idx);
    }
    // Si selecciona "Estudiantes", el campo programa_educativo es obligatorio
    if (publicoArray.value.includes('Estudiantes')) {
      this.eventoForm.get('programa_educativo')?.setValidators([Validators.required]);
    } else {
      this.eventoForm.get('programa_educativo')?.clearValidators();
      this.eventoForm.get('programa_educativo')?.setValue('');
    }
    this.eventoForm.get('programa_educativo')?.updateValueAndValidity();
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
    // Obtener los valores seleccionados de público objetivo (array real)
    const selectedPublicos = this.eventoForm.value.publico_objetivo
      .map((checked, i) => checked ? this.publicos[i].value : null)
      .filter(v => v !== null);

    if (selectedPublicos.length === 0) {
      this.errorMessage = 'Debes seleccionar un público objetivo.';
      return;
    }

    const formValue = this.eventoForm.value;
    let payload: any = {
      ...formValue,
      fecha_realizacion: formValue.fecha_realizacion
        ? new Date(formValue.fecha_realizacion).toISOString().slice(0, 10)
        : '',
      publico_objetivo: selectedPublicos.length > 0
        ? (selectedPublicos[0] === 'Público general' ? 'Publico general' : selectedPublicos[0])
        : null,
      responsable_maestro: null,
      responsable_admin: null
    };
    const responsable = this.responsables.find(r => r.id == formValue.responsable?.id);
    if (responsable?.tipo === 'maestro') {
      payload.responsable_maestro = responsable.id;
    } else if (responsable?.tipo === 'admin') {
      payload.responsable_admin = responsable.id;
    }
    delete payload.responsable;
    // Llama al servicio para crear el evento
    this.eventoService.crearEvento(payload).subscribe({
      next: () => {
        this.successMessage = '¡Evento registrado correctamente!';
        this.errorMessage = '';
        this.eventoForm.reset();
        // Reinicializa el FormArray
        const publicoArray = this.eventoForm.get('publico_objetivo') as FormArray;
        while (publicoArray.length) {
          publicoArray.removeAt(0);
        }
        this.publicos.forEach(() => publicoArray.push(this.fb.control(false)));
      },
      error: (err) => {
        this.errorMessage = 'Error al registrar el evento. Intenta de nuevo.';
        this.successMessage = '';
      }
    });
  }

  updateResponsables() {
    this.responsables = [...this.admins, ...this.maestros];
  }

  getError(controlName: string): string {
    const control = this.eventoForm.get(controlName);
    if (control?.hasError('required')) return 'Este campo es obligatorio';
    if (controlName === 'nombre_evento' && control?.hasError('pattern')) return 'Solo letras, números y espacios';
    if (controlName === 'lugar' && control?.hasError('pattern')) return 'Solo letras, números y espacios';
    if (controlName === 'descripcion_breve' && control?.hasError('pattern')) return 'Solo letras, números y signos de puntuación básicos';
    if (controlName === 'descripcion_breve' && control?.hasError('maxlength')) return 'Máximo 300 caracteres';
    if (controlName === 'cupo_maximo' && control?.hasError('pattern')) return 'Solo números positivos, máximo 3 dígitos';
    return '';
  }

  registrarEvento() {
    // Validaciones aquí si quieres
    this.eventoService.crearEvento(this.evento).subscribe(
      res => { /* éxito */ },
      err => { /* error */ }
    );
  }
}
