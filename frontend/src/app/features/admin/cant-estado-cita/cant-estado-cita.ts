import { AfterViewInit, Component, OnInit } from '@angular/core';
import { EstadoCitaCant } from '../../../shared/models/model-cant-estado-cita';
import { ServiceCita } from '../../../core/services/service-cita';
import * as echarts from 'echarts';
import { CitasPorEspecialidad } from '../../../shared/models/model-cita';
import { CommonModule } from '@angular/common';
import { IngresoMensual } from '../../../shared/models/model-ingresos-mensuales';
import { AdminReportesComponent } from '../reportes/admin-reportes.component';

@Component({
  selector: 'app-cant-estado-cita',
  imports: [CommonModule],
  templateUrl: './cant-estado-cita.html',
  styleUrls: ['./cant-estado-cita.css'],
})
export class CantEstadoCita implements OnInit, AfterViewInit {

  datosEstado: EstadoCitaCant[] = [];
  datosEspecialidad: CitasPorEspecialidad[] = [];
  ingresosMensuales: IngresoMensual[] = [];

  public pieChart!: echarts.ECharts;
  public barChart!: echarts.ECharts;
  public lineChart!: echarts.ECharts;

  constructor(private serviceCita: ServiceCita) { }
  ngOnInit(): void {
    this.serviceCita.obtenerCitasPorEstado()
      .subscribe({
        next: (res) => {
          this.datosEstado = res;
          this.renderPieChart();
        },
        error: (err) => console.error('Error al cargar datos de estado', err)
      });

    this.serviceCita.obtenerCantCitasPorEspecialidad()
      .subscribe({
        next: (res) => {
          this.datosEspecialidad = res;
          this.renderBarChart();
        },
        error: (err) => console.error('Error al cargar datos de especialidad', err)
      });

    this.serviceCita.obtenerIngresosMensuales().subscribe({
      next: (res) => {
        this.ingresosMensuales = res;
        this.renderLineChart();
      },
      error: (err) => console.error('Error al cargar ingresos mensuales', err),
    });
  }

  ngAfterViewInit(): void {
    window.addEventListener('resize', () => {
      this.pieChart?.resize();
      this.barChart?.resize();
      this.lineChart?.resize();
    });
  }

  private renderPieChart(): void {
    const dom = document.getElementById('pieEstadoCita') as HTMLElement;
    if (!dom) return;
    this.pieChart = echarts.init(dom);

    const option: echarts.EChartsOption = {
      title: {
        text: 'Citas por Estado',
        subtext: 'Datos del sistema',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: 'Citas',
          type: 'pie',
          radius: '50%',
          data: this.datosEstado.map(d => ({
            value: d.cantCita,
            name: d.estadoCita
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
    this.pieChart.setOption(option);
  }


  private renderBarChart(): void {
    const dom = document.getElementById('barEspecialidad') as HTMLElement;
    if (!dom) return;
    this.barChart = echarts.init(dom);

    const option: echarts.EChartsOption = {
      title: {
        text: 'Citas por Especialidad',
        subtext: 'Datos del sistema',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      xAxis: {
        type: 'category',
        data: this.datosEspecialidad.map(d => d.especialidad)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Citas',
          type: 'bar',
          data: this.datosEspecialidad.map(d => d.totalCitas),
          itemStyle: {
            color: '#5470C6'
          }
        }
      ]
    };
    this.barChart.setOption(option);
  }

  private renderLineChart(): void {
    const dom = document.getElementById('lineIngresos') as HTMLElement;
    if (!dom) return;
    this.lineChart = echarts.init(dom);

    const data = this.ingresosMensuales;

    const option: echarts.EChartsOption = {
      title: { text: 'Ingresos Mensuales', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: data.map(d => d.mesAno),
      },
      yAxis: { type: 'value' },
      series: [
        {
          data: data.map(d => d.total),
          type: 'line',
          smooth: true,
          itemStyle: { color: '#5470C6' },
        },
      ],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
    };
    this.lineChart.setOption(option);
  }
}
