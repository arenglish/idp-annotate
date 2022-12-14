import { Injectable } from "@angular/core";
import { CanActivate } from "@angular/router";
import { Store } from "@ngrx/store";
import { StateService } from "src/services/state.service";
import { ImageEntityActions } from "../state/entities/images.entities";
import { FullState } from "../state/main";

@Injectable()
export class BrowseComponentGuard implements CanActivate {
    constructor(private store: Store<FullState>, private state: StateService) { }

    canActivate(): boolean {
        this.store.dispatch(ImageEntityActions.requestImages())
        return true;
    }
}