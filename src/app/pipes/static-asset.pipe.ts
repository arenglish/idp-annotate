import { Pipe, PipeTransform } from "@angular/core";
import { environment } from "src/environments/environment";

@Pipe({ name: 'dbStaticAsset' })
export class GetDbStaticAssetPrefix implements PipeTransform {
  transform(value: string): string {
    return getStaticAssetUrl(value);
  }
}

export function getStaticAssetUrl(assetPath: string): string {
  return `${environment.apiUrl}/${environment.staticAssetsPath}/${assetPath}`
}