import { PipeTransform, Injectable } from '@nestjs/common';
import { CustomResponse } from 'src/response/custom-response';
import { hashHMACSHA256 } from 'src/utils/hashUtils';
import { extractHeaderJWTstr, extractPayloadJWT, extractPayloadJWTstr, extractSignatureJWTstr } from 'src/utils/jwtUtils';
import { ECustomCode } from '../response/ecustom-code.jenum';

@Injectable()
export class JwtValidationPipe implements PipeTransform {
  transform(header) {
    const [tokenType, token] = header['authorization']?.split(' ');

    // 기본적으로 헤더에 각 데이터들이 들어있는지 확인
    if (tokenType && tokenType.toLowerCase() !== 'bearer') throw new CustomResponse(ECustomCode.JWT05);
    if (!token) throw new CustomResponse(ECustomCode.JWT06);

    // 1. signature 유효한지 검사
    const headerStr = extractHeaderJWTstr(token);
    const payloadStr = extractPayloadJWTstr(token);
    const signatureStr = extractSignatureJWTstr(token);
    if (signatureStr !== hashHMACSHA256(headerStr + '.' + payloadStr, process.env.JWT_SECRET_KEY)) throw new CustomResponse(ECustomCode.JWT03);

    // 1-1. sign 검증됐으면.. payload 추출
    const payload = extractPayloadJWT(token);

    // 2. issuer가 일치하는지 검사 (아직은 issuer만 확인)
    const issuer = process.env.LAYOVER_PUBLIC_IP;
    if (payload.iss != issuer) throw new CustomResponse(ECustomCode.JWT04);

    // 3. exp를 지났는지 검사
    if (Math.floor(Date.now() / 1000) > payload.exp) throw new CustomResponse(ECustomCode.JWT02);

    // jwt 페이로드를 객체로 변환하여 넘겨줌
    return extractPayloadJWT(token);
  }
}