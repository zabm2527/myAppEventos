import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class ServicesApiRest {
  private url = "http://localhost:9000/api";

  constructor(private httpclient: HttpClient) {}

  public getCiudades() {
    let urlcomplete = this.url + "/ciudades";

    return this.httpclient.get(urlcomplete);
  }

  public getColores() {
    let urlcomplete = this.url + "/colores";

    return this.httpclient.get(urlcomplete);
  }

  public getAllEventos() {
    let urlcomplete = this.url + "/allEventos";

    return this.httpclient.get(urlcomplete);
  }

  public getEventoByCod(cod_evento: any) {
    let urlcomplete = this.url + "/eventoByCod";
    let param = { cod_evento: cod_evento };

    return this.httpclient.post(urlcomplete, param);
  }

  public getEventoByFec(fecha_ini: any) {
    let urlcomplete = this.url + "/eventoByFec";
    let param = { fecha_ini: fecha_ini };

    return this.httpclient.post(urlcomplete, param);
  }

  public deleteEvento(cod_evento: any) {
    let urlcomplete = this.url + "/deleteEvento";
    let param = { cod_evento: cod_evento };

    return this.httpclient.post(urlcomplete, param);
  }

  public updateEvento(params: any, cod_evento: any) {
    let urlcomplete = this.url + "/updateEvento/"+cod_evento;

    return this.httpclient.post(urlcomplete, params);
  }

  public insertEvento(params: any) {
    let urlcomplete = this.url + "/insertEvento";

    return this.httpclient.post(urlcomplete, params);
  }
}
