import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

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
  
  // Totales de eventos
  public total_eventos: any = {
    total_conferencias: 0,
    total_talleres: 0,
    total_seminarios: 0,
    total_concursos: 0,
    total_general: 0
  };

  lineChartData = {
    labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0],
        label: 'Eventos por mes',
        backgroundColor: '#F88406',
        borderColor: '#F88406',
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#F88406',
        pointBorderColor: '#fff',
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  lineChartOption: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        ticks: {
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    plugins: {
      datalabels: {
        display: true,
        color: '#000000',
        font: {
          weight: 'bold',
          size: 14
        },
        formatter: (value) => value || '0'
      },
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: 'Distribución de eventos por mes',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    }
  };

  barChartData = {
    labels: ["Conferencia", "Taller", "Seminario", "Concurso"],
    datasets: [
      {
        data: [0, 0, 0, 0],
        label: 'Cantidad de eventos',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#82D3FB',
          '#FB82F5'
        ]
      }
    ]
  };

  barChartOption: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        ticks: {
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    plugins: {
      datalabels: {
        display: true,
        color: '#000000',
        font: {
          weight: 'bold',
          size: 14
        },
        formatter: (value) => value || '0'
      },
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: 'Distribución de eventos por tipo',
        font: {
          size: 16,
          weight: 'bold'
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

  pieChartOption: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      datalabels: {
        display: true,
        color: '#000000',
        font: {
          weight: 'bold',
          size: 12
        },
        formatter: (value) => value || '0'
      },
      legend: {
        display: true,
        position: 'top'
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

  doughnutChartOption: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      datalabels: {
        display: true,
        color: '#000000',
        font: {
          weight: 'bold',
          size: 12
        },
        formatter: (value) => value || '0'
      },
      legend: {
        display: true,
        position: 'top'
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
    if (this.pieChart && this.doughnutChart && this.lineChart && this.barChart) {
      this.pieChart.chart?.update();
      this.doughnutChart.chart?.update();
      this.lineChart.chart?.update();
      this.barChart.chart?.update();
    }
  }

  public obtenerTotalUsers() {
    console.log('Obteniendo estadísticas...');
    this.administradoresServices.getTotalUsuarios().subscribe(
      (response) => {
        this.total_user = response;
        console.log("Estadísticas recibidas (COMPLETO): ", JSON.stringify(this.total_user, null, 2));
        
        // Actualizar datos de usuarios
        const userData = [
          this.total_user.total_administradores,
          this.total_user.total_maestros,
          this.total_user.total_alumnos
        ];
        
        // Actualizar gráficas de usuarios
        this.pieChartData.datasets[0].data = [...userData];
        this.doughnutChartData.datasets[0].data = [...userData];
        
        // Actualizar gráfica de eventos por mes
        console.log('Eventos por mes:', this.total_user.eventos_por_mes);
        if (this.total_user.eventos_por_mes && this.total_user.eventos_por_mes.length > 0) {
          this.lineChartData.labels = this.total_user.eventos_por_mes.map((evento: any) => evento.fecha);
          this.lineChartData.datasets[0].data = this.total_user.eventos_por_mes.map((evento: any) => evento.total);
          console.log('Datos para gráfica de línea:', {
            labels: this.lineChartData.labels,
            data: this.lineChartData.datasets[0].data
          });
        } else {
          console.warn('No hay datos de eventos por mes');
        }

        // Actualizar gráfica de eventos por tipo
        console.log('Eventos por tipo:', this.total_user.eventos_por_tipo);
        if (this.total_user.eventos_por_tipo && this.total_user.eventos_por_tipo.length > 0) {
          this.barChartData.labels = this.total_user.eventos_por_tipo.map((evento: any) => evento.tipo_evento);
          this.barChartData.datasets[0].data = this.total_user.eventos_por_tipo.map((evento: any) => evento.total);
          
          // Calcular totales de eventos por tipo
          this.total_eventos.total_general = 0;
          this.total_user.eventos_por_tipo.forEach((evento: any) => {
            this.total_eventos.total_general += evento.total;
            
            if (evento.tipo_evento === 'Conferencia') {
              this.total_eventos.total_conferencias = evento.total;
            } else if (evento.tipo_evento === 'Taller') {
              this.total_eventos.total_talleres = evento.total;
            } else if (evento.tipo_evento === 'Seminario') {
              this.total_eventos.total_seminarios = evento.total;
            } else if (evento.tipo_evento === 'Concurso') {
              this.total_eventos.total_concursos = evento.total;
            }
          });
          
          console.log('Datos para gráfica de barras:', {
            labels: this.barChartData.labels,
            data: this.barChartData.datasets[0].data
          });
          
          console.log('Totales de eventos:', this.total_eventos);
        } else {
          console.warn('No hay datos de eventos por tipo');
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
