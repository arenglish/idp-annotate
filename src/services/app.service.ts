import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { GenerateMasksPOST, GetSpim, GetSpims, GetTissueClasses } from "src/models/Requests";
import { environment } from "src/environments/environment";
import { from, map, switchMap } from "rxjs";
import { Mask } from "src/models/Database";
import { get } from "lodash";
import { COLORS } from "src/models/color-styles";
import { SEGMENTATION_METHODS } from "src/models/segmentation";

@Injectable()
export class AppService {
    constructor(private http: HttpClient) { }

    getTissueClasses() {
        return this.http.get<GetTissueClasses>(environment.urls.tissueClasses)
    }

    getSpims() {
        // return this.http.get<GetSpims>('/assets/data/spims.json').pipe(map(res => {
        return this.http.get<GetSpims>(environment.urls.spims).pipe(map(res => {
            return {
                ...res,
                spims: res.spims.map(s => {
                    return {
                        ...s,
                        id: s.pk!,
                        masks: get(s, 'masks', []).map((m, idx) => {
                            return { ...m, color: COLORS[idx] }
                        })
                    }
                })
            }
        }))
    }

    getSpim(spimId: number) {
        // return this.http.get<GetSpim>(`/assets/data/spim_${spimId}.json`).pipe(map(res => {
        return this.http.get<GetSpim>(environment.urls.spim.replace('{spimId}', spimId.toString())).pipe(map(res => {
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

    deleteSpim(spimId: number) {
        return this.http.delete(environment.urls.spim.replace('{spimId}', spimId.toString()) + '/delete')
    }

    deleteMask(maskId: number) {
        return this.http.delete(environment.urls.mask.replace('{maskId}', maskId.toString()) + '/delete')
    }

    updateMask(mask: Mask, spimId: number) {
        return from(fetch(mask.bitmap)).pipe(
            switchMap(res => {
                return from(res.blob())
            }),
            switchMap(maskFile => {
                const form = new FormData()
                form.append('maskFile', maskFile)
                return this.http.post<Mask>(environment.urls.mask.replace('{maskId}', mask.id.toString()) + '/update/' + (mask.name || ''), maskFile)
            })
        )
    }

    generateSegmentedMasks(spimId: number, segmentType?: SEGMENTATION_METHODS) {
        return this.http.post<GenerateMasksPOST>(segmentType ? environment.urls.autosegWithType.replace('{spimId}', spimId.toString()).replace('{typeId}', segmentType.toString()) : environment.urls.autoseg.replace('{spimId}', spimId.toString()), {}).pipe(
            map(res => {
                return {
                    ...res,
                    masks: res.masks.map((m, idx) => {
                        return {
                            ...m,
                            color: COLORS[idx]
                        }
                    })
                }
            })
        )
    }

    createMask(mask: Mask, spimId: number) {
        return from(fetch(mask.bitmap)).pipe(
            switchMap(res => {
                return from(res.blob())
            }),
            switchMap(maskFile => {
                const form = new FormData()
                form.append('maskFile', maskFile)
                return this.http.post<Mask>(environment.urls.spim.replace('{spimId}', spimId.toString()) + '/createmask', maskFile)
            })
        )
    }


}