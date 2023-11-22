import { PipeTransform, Injectable } from '@nestjs/common';
import { CustomException, ECustomException } from 'src/custom-exception';
import { hashHMACSHA256 } from 'src/utils/hashUtils';
import {
  extractHeaderJWT,
  extractHeaderJWTstr,
  extractPayloadJWT,
  extractPayloadJWTstr,
  extractSignatureJWTstr,
} from 'src/utils/jwtUtils';

@Injectable()
export class JwtValidationPipe implements PipeTransform {
  transform(value: any) {
    // 1. signature 유효한지 검사
    const headerStr = extractHeaderJWTstr(value);
    const payloadStr = extractPayloadJWTstr(value);
    const signatureStr = extractSignatureJWTstr(value);
    if (
      signatureStr !==
      hashHMACSHA256(headerStr + '.' + payloadStr, process.env.JWT_SECRET_KEY)
    )
      throw new CustomException(ECustomException.JWT03);

    // 1-1. payload 추출
    const payload = extractPayloadJWT(value);

    // 2. issuer가 일치하는지 검사 (아직은 issuer만 확인)
    const issuer = process.env.LAYOVER_PUBLIC_IP;
    if (payload.iss != issuer)
      throw new CustomException(ECustomException.JWT04);

    // 3. exp를 지났는지 검사
    if (Math.floor(Date.now() / 1000) > payload.exp)
      throw new CustomException(ECustomException.JWT02);

    // jwt를 객체로 변환하여 넘겨줌
    return {
      header: extractHeaderJWT(value),
      payload: extractPayloadJWT(value),
    };
  }
}
