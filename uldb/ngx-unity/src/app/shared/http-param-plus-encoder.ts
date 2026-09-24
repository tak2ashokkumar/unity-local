import { HttpParameterCodec, HttpParams } from '@angular/common/http';

export class HttpParamPlusEncoder implements HttpParameterCodec {
  encodeKey(key: string): string {
    return encodeURIComponent(key);
  }

  encodeValue(value: string): string {
    return encodeURIComponent(value);
  }

  decodeKey(key: string): string {
    return decodeURIComponent(key);
  }

  decodeValue(value: string): string {
    return decodeURIComponent(value);
  }
}

export function cloneHttpParamsWithPlusEncoder(params?: HttpParams | null): HttpParams {
  let encodedParams = new HttpParams({ encoder: new HttpParamPlusEncoder() });
  if (!params) {
    return encodedParams;
  }

  params.keys().forEach((key: string) => {
    (params.getAll(key) || []).forEach((value: string) => {
      encodedParams = encodedParams.append(key, value);
    });
  });

  return encodedParams;
}
