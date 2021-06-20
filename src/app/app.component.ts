import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import { CalendarOptions } from "@fullcalendar/angular";
import { ServicesApiRest } from "../global-services/services";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { NotifierService } from "angular-notifier";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    public notifierServices: NotifierService
  ) {}

  ngOnInit(): void {}

  calendarOptions: CalendarOptions = {
    initialView: "dayGridMonth",
    dateClick: this.handleDateClick.bind(this),
    dayMaxEvents: true,
    headerToolbar: false,
    events: {
      url: "http://localhost:9000/api/allEventos",
    },
  };

  handleDateClick(arg) {
    let dialogref = this.dialog.open(DialogEventsByDay, {
      data: {
        fecha_ini: arg.dateStr,
      },
      height: "700px",
      width: "100%",
    });

    dialogref.beforeClosed().subscribe((result) => {
      window.location.reload();
    });
  }
}

export interface PeriodicElement {
  COD_EVENTO: number;
  NOMBRE_EVENTO: string;
  DESCRIPCION: string;
  COD_CIUDAD: number;
  NOM_CIUDAD: string;
  COD_COLOR: number;
  NOM_COLOR: string;
  FECHA_INI: string;
  FECHA_FIN: string;
}

const ELEMENT_DATA: any = [];

@Component({
  selector: "dialog-events-by-day",
  templateUrl: "dialog-events-by-day.html",
  styleUrls: ["./app.component.scss"],
})
export class DialogEventsByDay implements OnInit {
  private readonly notifier: NotifierService;

  constructor(
    public dialogRef: MatDialogRef<DialogEventsByDay>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private serviceAR: ServicesApiRest,
    private dialog: MatDialog,
    public notifierServices: NotifierService
  ) {
    this.notifier = notifierServices;
  }

  displayedColumns: string[] = [
    "NOMBRE",
    "DESCRIPCION",
    "CIUDAD",
    "COLOR",
    "FEC_INI",
    "FEC_FIN",
    "EDIT",
    "DELETE",
  ];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.getEventoByFec(this.data.fecha_ini);
  }

  getEventoByFec(fecha: any) {
    this.serviceAR.getEventoByFec(fecha).subscribe((data: any) => {
      this.dataSource.data = data;
    });
  }

  deleteEvento(cod_evento: any) {
    console.log(cod_evento);
    this.serviceAR.deleteEvento(cod_evento).subscribe((data: any) => {
      console.log(data);
      if (data.codMensaje == 1) {
        this.notifier.notify("success", data.mensaje);
        this.getEventoByFec(this.data.fecha_ini);
      }else{
        this.notifier.notify("error", data.mensaje);
        this.getEventoByFec(this.data.fecha_ini);
      }
    });
  }

  editEvento(dataRow: any) {
    let dialogref = this.dialog.open(DialogUpdateEvents, {
      data: {
        dataRow: dataRow,
        fecSpace: this.data.fecha_ini,
      },
    });

    dialogref.beforeClosed().subscribe((result) => {
      this.getEventoByFec(this.data.fecha_ini);
      if (result.codMensaje == 1) {
        this.notifier.notify("success", result.mensaje);
      }
    });
  }

  addEvento() {
    let dialogref = this.dialog.open(DialogAddEvents, {
      data: {
        fecSpace: this.data.fecha_ini,
      },
    });

    dialogref.beforeClosed().subscribe((result) => {
      console.log(result)
      this.getEventoByFec(this.data.fecha_ini);
      if (result.codMensaje == 1) {
        this.notifier.notify("success", result.mensaje);
      }
    });
  }
}

@Component({
  selector: "dialog-event-reupdel",
  templateUrl: "dialog-event-reupdel.html",
  styleUrls: ["./app.component.scss"],
})
export class DialogUpdateEvents implements OnInit {
  public nomEvento: any;
  public descripcion: any;
  public codCiudad: any;
  public codColor: any;
  public fecha_inicio: any;
  public hora_inicio: any;
  public fecha_fin: any;
  public hora_fin: any;
  public ciudades: any;
  public colores: any;
  private readonly notifier: NotifierService;

  constructor(
    public dialogRef: MatDialogRef<DialogUpdateEvents>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private serviceAR: ServicesApiRest,
    public notifierServices: NotifierService
  ) {
    this.nomEvento = data.dataRow.nombre_evento;
    this.descripcion = data.dataRow.descripcion;
    this.codCiudad = data.dataRow.cod_ciudad;
    this.codColor = data.dataRow.cod_color;
    this.hora_inicio = data.dataRow.fecha_ini.split(" ")[1];
    this.hora_fin = data.dataRow.fecha_fin.split(" ")[1];
    this.notifier = notifierServices;
  }

  ngOnInit() {
    this.getCiudades();
    this.getColores();
  }

  getCiudades() {
    this.serviceAR.getCiudades().subscribe((data) => {
      this.ciudades = data;
    });
  }

  getColores() {
    this.serviceAR.getColores().subscribe((data) => {
      this.colores = data;
    });
  }

  editRow() {
    let params = {
      nombre_evento: this.nomEvento,
      descripcion: this.descripcion,
      cod_ciudad: this.codCiudad,
      cod_color: this.codColor,
      fecha_ini: this.data.fecSpace + " " + this.hora_inicio,
      fecha_fin: this.data.fecSpace + " " + this.hora_fin,
    };

    this.serviceAR
      .updateEvento(params, this.data.dataRow.cod_evento)
      .subscribe((data: any) => {
        console.log(data);
        if (data.codMensaje == 1) {
          this.dialogRef.close({
            codMensaje: data.codMensaje,
            mensaje: data.mensaje,
          });
        } else {
          this.notifier.notify("error", data.mensaje);
        }
      });
  }
}

@Component({
  selector: "dialog-add-events",
  templateUrl: "dialog-add-events.html",
  styleUrls: ["./app.component.scss"],
})
export class DialogAddEvents implements OnInit {
  public nomEvento: any;
  public descripcion: any;
  public codCiudad: any;
  public codColor: any;
  public fecha_inicio: any;
  public hora_inicio: any;
  public fecha_fin: any;
  public hora_fin: any;
  public ciudades: any;
  public colores: any;
  private readonly notifier: NotifierService;

  constructor(
    public dialogRef: MatDialogRef<DialogAddEvents>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private serviceAR: ServicesApiRest,
    public notifierServices: NotifierService
  ) {
    this.notifier = notifierServices;
  }

  ngOnInit() {
    this.getCiudades();
    this.getColores();
  }

  getCiudades() {
    this.serviceAR.getCiudades().subscribe((data) => {
      this.ciudades = data;
    });
  }

  getColores() {
    this.serviceAR.getColores().subscribe((data) => {
      this.colores = data;
    });
  }

  addRow() {
    if (!this.nomEvento) {
      console.log("Digite un nombre por favor");
      this.notifier.notify("warning", "Digite un nombre por favor");
      return;
    }
    if (!this.descripcion) {
      console.log("Digite una descripcion por favor");
      this.notifier.notify("warning", "Digite una descripcion por favor");
      return;
    }
    if (!this.codCiudad) {
      console.log("Seleccione una ciudad por favor");
      this.notifier.notify("warning", "Seleccione una ciudad por favor");
      return;
    }
    if (!this.codColor) {
      console.log("Seleccione un color por favor");
      this.notifier.notify("warning", "Seleccione un color por favor");
      return;
    }
    if (!this.hora_inicio) {
      console.log("Seleccione un horario de inicio por favor");
      this.notifier.notify(
        "warning",
        "Seleccione un horario de inicio por favor"
      );
      return;
    }
    if (!this.hora_fin) {
      console.log("Seleccione un horario de finalización por favor");
      this.notifier.notify(
        "warning",
        "Seleccione un horario de finalización por favor"
      );
      return;
    }

    let params = {
      nombre_evento: this.nomEvento,
      descripcion: this.descripcion,
      cod_ciudad: this.codCiudad,
      cod_color: this.codColor,
      fecha_ini: this.data.fecSpace + " " + this.hora_inicio,
      fecha_fin: this.data.fecSpace + " " + this.hora_fin,
    };

    this.serviceAR.insertEvento(params).subscribe((data: any) => {
      console.log(data);
      if (data.codMensaje == 1) {
        this.dialogRef.close({
          codMensaje: data.codMensaje,
          mensaje: data.mensaje,
        });
      } else {
        this.notifier.notify("error", data.mensaje);
      }
    });
  }
}
