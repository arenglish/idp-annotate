import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Store } from "@ngrx/store";
import { get } from "lodash";
import { map, Observable } from "rxjs";
import { StateService } from "src/services/state.service";
import { AnnotateActions } from "../state/annotate/annotate.actions";
import { ImageEntityActions } from "../state/entities/images.entities";
import { FullState } from "../state/main";
import { setAnnotateMode } from "../state/main/actions";

@Injectable()
export class AnnotateGuard implements CanActivate {
    constructor(private store: Store<FullState>, private state: StateService) { }

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {
        this.store.dispatch(setAnnotateMode({ active: true }))
        const spimId = parseInt(route.params['imageId'], 10)
        this.store.dispatch(AnnotateActions.requestImage({ id: spimId }))
        this.store.dispatch(ImageEntityActions.setSelectedImageId({ id: spimId }))

        return true;
    }

    canDeactivate(): boolean {
        this.store.dispatch(setAnnotateMode({ active: false }))
        return true;
    }
}