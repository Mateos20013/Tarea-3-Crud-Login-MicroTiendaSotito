import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  titulo: string;
  mensaje: string;
  textoConfirmar: string;
  textocancelar: string;
  tipo?: 'warn' | 'primary';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-header">
      <mat-icon [color]="data.tipo === 'warn' ? 'warn' : 'primary'">
        {{ data.tipo === 'warn' ? 'warning' : 'help' }}
      </mat-icon>
      <h2 mat-dialog-title>{{ data.titulo }}</h2>
    </div>

    <mat-dialog-content>
      <p>{{ data.mensaje }}</p>
    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-button (click)="onCancel()">
        {{ data.textocancelar || 'Cancelar' }}
      </button>
      <button 
        mat-raised-button 
        [color]="data.tipo === 'warn' ? 'warn' : 'primary'"
        (click)="onConfirm()">
        {{ data.textoConfirmar || 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .dialog-header mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .dialog-header h2 {
      margin: 0;
    }

    mat-dialog-content {
      margin-bottom: 16px;
    }

    mat-dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
