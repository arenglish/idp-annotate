import { Pipe, PipeTransform } from "@angular/core";
import { environment } from "src/environments/environment";

@Pipe({ name: 'serverAssetPrefix' })
export class ServerAssetPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return value ? getServerAssetUrl(value) : '';
  }
}

export function getServerAssetUrl(assetPath: string): string {
  if (assetPath.includes('data:image')) {
    return assetPath
  }
  return `${environment.serverAssetsPath}/${assetPath}`
}