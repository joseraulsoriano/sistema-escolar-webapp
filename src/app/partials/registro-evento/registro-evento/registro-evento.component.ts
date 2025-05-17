import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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
    { label: 'Público general', value: 'Publico general' }
  ];
  programasEducativos = [
    'Ingeniería en Ciencias de la Computación',
    'Licenciatura en Ciencias de la Computación',
    'Ingeniería en Tecnologías de la Información'
  ];
  responsables: any[] = [];
  loadingResponsables = false;
  successMessage: string = '';
  errorMessage: string = '';
  minDate = new Date();

  constructor(private fb: FormBuilder, private http: HttpClient) {}

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
    this.loadResponsables();
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
    // Preparar payload para el backend
    const formValue = this.eventoForm.value;
    let payload: any = {
      ...formValue,
      responsable_maestro: null,
      responsable_admin: null
    };
    const responsable = this.responsables.find(r => r.id == formValue.responsable);
    if (responsable?.tipo === 'maestro') {
      payload.responsable_maestro = responsable.id;
    } else if (responsable?.tipo === 'admin') {
      payload.responsable_admin = responsable.id;
    }
    delete payload.responsable;
    payload.publico_objetivo = formValue.publico_objetivo.join(',');
    this.http.post('/api/eventos-academicos/', payload).subscribe({
      next: () => {
        this.successMessage = '¡Evento registrado correctamente!';
        this.errorMessage = '';
        this.eventoForm.reset();
        (this.eventoForm.get('publico_objetivo') as FormArray).clear();
      },
      error: (err) => {
        this.errorMessage = 'Error al registrar el evento. Intenta de nuevo.';
        this.successMessage = '';
      }
    });
  }
}
