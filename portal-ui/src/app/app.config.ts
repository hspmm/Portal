import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { environment} from '../environments/environment';
import {IAppConfig  } from './app-config.model';
@Injectable()
export class AppConfig {
  static settings: IAppConfig;
  private http: HttpClient;
  constructor(private handler: HttpBackend) {
   this.http = new HttpClient(handler);
  }
  load() {
    const jsonFile = `assets/config.${environment.name}.json`;
    return new Promise<void>((resolve, reject) => {
            this.http.get(jsonFile).toPromise().then((response: IAppConfig) => {
               AppConfig.settings = <IAppConfig> response;
               resolve();
            }).catch((response: any) => {
               reject(`Could not load file '${jsonFile}': ${JSON.stringify(response)}`);
            });
        });
    }
}

