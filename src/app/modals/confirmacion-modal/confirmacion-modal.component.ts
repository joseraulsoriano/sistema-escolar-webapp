import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmacion-modal',
  templateUrl: './confirmacion-modal.component.html',
  styleUrls: ['./confirmacion-modal.component.scss']
})
export class ConfirmacionModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmacionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      titulo: string;
      mensaje: string;
      botonAceptar?: string;
      botonCancelar?: string;
    }
  ) {}

  cerrar_modal(): void {
    this.dialogRef.close(false);
  }

  confirmar(): void {
    this.dialogRef.close(true);
  }
}
