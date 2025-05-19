import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit, AfterViewInit {
  @ViewChild('pieChart') pieChart?: BaseChartDirective;
  @ViewChild('doughnutChart') doughnutChart?: BaseChartDirective;
  @ViewChild('lineChart') lineChart?: BaseChartDirective;
  @ViewChild('barChart') barChart?: BaseChartDirective;

  public chartPlugins = [DatalabelsPlugin];

  public total_user: any = {
    total_administradores: 0,
    total_maestros: 0,
    total_alumnos: 0
  };

  lineChartData = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        data: [89, 34, 43, 54, 28, 74, 93],
        label: 'Eventos por día',
        backgroundColor: '#F88406',
        borderColor: '#F88406',
        fill: false
      }
    ]
  };

  lineChartOption = {
    responsive: true,
    plugins: {
      datalabels: {
        display: true,
        color: '#000000',
        font: {
          weight: 'bold' as const,
          size: 12
        }
      }
    }
  };

  barChartData = {
    labels: ["Conferencia", "Taller", "Seminario", "Concurso"],
    datasets: [
      {
        data: [34, 43, 54, 28],
        label: 'Eventos por tipo',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#82D3FB',
          '#FB82F5'
        ]
      }
    ]
  };

  barChartOption = {
    responsive: true,
    plugins: {
      datalabels: {
        display: true,
        color: '#000000',
        font: {
          weight: 'bold' as const,
          size: 12
        }
      }
    }
  };

  pieChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: [
          '#FCFF44',
          '#F1C8F2',
          '#31E731'
        ]
      }
    ]
  };

  pieChartOption = {
    responsive: true,
    plugins: {
      datalabels: {
        display: true,
        color: '#000000',
        font: {
          weight: 'bold' as const,
          size: 12
        },
        formatter: (value: number) => {
          return value.toString();
        }
      }
    }
  };

  doughnutChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#31E7E7'
        ]
      }
    ]
  };

  doughnutChartOption = {
    responsive: true,
    plugins: {
      datalabels: {
        display: true,
        color: '#000000',
        font: {
          weight: 'bold' as const,
          size: 12
        },
        formatter: (value: number) => {
          return value.toString();
        }
      }
    }
  };

  constructor(
    private administradoresServices: AdministradoresService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.obtenerTotalUsers();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.actualizarGraficas();
    }, 1000);
  }

  private actualizarGraficas() {
    if (this.pieChart && this.doughnutChart) {
      this.pieChart.chart?.update();
      this.doughnutChart.chart?.update();
      this.lineChart?.chart?.update();
      this.barChart?.chart?.update();
    }
  }

  public obtenerTotalUsers() {
    this.administradoresServices.getTotalUsuarios().subscribe(
      (response) => {
        this.total_user = response;
        console.log("Estadísticas recibidas: ", this.total_user);
        
        // Actualizar datos de usuarios
        const userData = [
          this.total_user.total_administradores,
          this.total_user.total_maestros,
          this.total_user.total_alumnos
        ];
        
        // Actualizar gráficas de usuarios
        this.pieChartData.datasets[0].data = [...userData];
        this.doughnutChartData.datasets[0].data = [...userData];
        
        // Actualizar gráfica de eventos por día si hay datos
        if (this.total_user.eventos_por_dia && this.total_user.eventos_por_dia.length > 0) {
          this.lineChartData.labels = this.total_user.eventos_por_dia.map((evento: any) => evento.fecha);
          this.lineChartData.datasets[0].data = this.total_user.eventos_por_dia.map((evento: any) => evento.total);
        }

        // Actualizar gráfica de eventos por tipo si hay datos
        if (this.total_user.eventos_por_tipo && this.total_user.eventos_por_tipo.length > 0) {
          this.barChartData.labels = this.total_user.eventos_por_tipo.map((evento: any) => evento.tipo_evento);
          this.barChartData.datasets[0].data = this.total_user.eventos_por_tipo.map((evento: any) => evento.total);
        }
        
        // Forzar actualización de las gráficas
        setTimeout(() => {
          this.actualizarGraficas();
          this.cdr.detectChanges();
        }, 100);
      },
      (error) => {
        console.error("Error al obtener estadísticas:", error);
        alert("No se pudieron obtener las estadísticas del sistema");
      }
    );
  }
}
