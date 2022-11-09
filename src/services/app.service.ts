import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { GetSpim, GetSpims } from "src/models/Requests";
import { environment } from "src/environments/environment";
import { map } from "rxjs";

@Injectable()
export class AppService {
    constructor(private http: HttpClient) { }

    getSpims() {
        return this.http.get<GetSpims>('/assets/data/spims.json').pipe(map(res => {
            // return this.http.get<GetSpims>(environment.urls.spims).pipe(map(res => {
            return {
                ...res,
                spims: res.spims.map(s => {
                    return {
                        ...s,
                        id: s.pk!
                    }
                })
            }
        }))
    }

    getSpim(spimId: number) {
        return this.http.get<GetSpim>(`/assets/data/spim_${spimId}.json`).pipe(map(res => {
            // return this.http.get<GetSpim>(environment.urls.spim.replace('{spimId}', spimId.toString())).pipe(map(res => {
            return {
                ...res,
                id: spimId,
                masks: res.masks.map(m => {
                    return {
                        ...m,
                        id: m.pk!
                    }
                })
            }
        }))
    }
}