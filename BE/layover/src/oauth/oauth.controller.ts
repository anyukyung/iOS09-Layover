import { Post, Body, HttpStatus } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { JwtValidationPipe } from 'src/pipes/jwt.validation.pipe';
import { CustomResponse } from '../response/custom-response';
import { ECustomCode } from '../response/ecustom-code.jenum';
import { ApiOperation, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { KakaoLoginDto } from './dtos/kakao-login.dto';
import { AppleLoginDto } from './dtos/apple-login.dto';
import { KakaoSignupDto } from './dtos/kakao-signup.dto';
import { AppleSignupDto } from './dtos/apple-signup.dto';
import { TokenResDto } from './dtos/token-res.dto';
import { CustomHeader } from 'src/pipes/custom-header.decorator';

@ApiTags('OAuth API')
@Controller('oauth')
@ApiResponse({
  status: HttpStatus.BAD_REQUEST,
  description: 'client의 요청이 잘못된 경우',
  schema: {
    type: 'object',
    properties: {
      customCode: { type: 'string', example: 'OAUTH__' },
      message: { type: 'string', example: '응답코드에 맞는 메시지' },
      statusCode: { type: 'number', example: HttpStatus.BAD_REQUEST },
    },
  },
})
@ApiResponse({
  description: '예상치 못한 Http Exception',
  schema: {
    type: 'object',
    properties: {
      customCode: { type: 'string', example: 'NEST_OFFER_EXCEPTION' },
      message: { type: 'string', example: 'message from nest' },
      statusCode: { type: 'number', example: HttpStatus.NOT_FOUND },
    },
  },
})
@ApiResponse({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: '예상치 못한 서버 Exception',
  schema: {
    type: 'object',
    properties: {
      customCode: { type: 'string', example: 'INTERNAL_SERVER_ERROR' },
      message: { type: 'string', example: 'message from nest' },
      statusCode: { type: 'number', example: HttpStatus.INTERNAL_SERVER_ERROR },
    },
  },
})
export class OauthController {
  constructor(private readonly oauthService: OauthService) {}

  @ApiOperation({
    summary: '카카오 로그인',
    description: '카카오 로그인을 수행합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '카카오 로그인 성공',
    schema: {
      type: 'object',
      properties: {
        customCode: { type: 'string', example: 'SUCCESS' },
        message: { type: 'string', example: '성공' },
        statusCode: { type: 'number', example: HttpStatus.OK },
        data: { $ref: getSchemaPath(TokenResDto) },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '회원가입 되지 않은 경우',
    schema: {
      type: 'object',
      properties: {
        customCode: { type: 'string', example: 'OAUTH__' },
        message: { type: 'string', example: '응답코드에 맞는 메시지' },
        statusCode: { type: 'number', example: HttpStatus.UNAUTHORIZED },
      },
    },
  })
  @Post('kakao')
  async processKakaoLogin(@Body() kakaoLoginDto: KakaoLoginDto) {
    // memberHash 구하기
    const memberHash = await this.oauthService.getKakaoMemberHash(kakaoLoginDto.accessToken);

    // login
    const tokenResponseDto = await this.oauthService.login(memberHash);

    // return access token and refresh token
    throw new CustomResponse(ECustomCode.SUCCESS, tokenResponseDto);
  }

  @ApiOperation({
    summary: '애플 로그인',
    description: '애플 로그인을 수행합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '애플 로그인 성공',
    schema: {
      type: 'object',
      properties: {
        customCode: { type: 'string', example: 'SUCCESS' },
        message: { type: 'string', example: '성공' },
        statusCode: { type: 'number', example: HttpStatus.OK },
        data: { $ref: getSchemaPath(TokenResDto) },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '회원가입 되지 않은 경우',
    schema: {
      type: 'object',
      properties: {
        customCode: { type: 'string', example: 'OAUTH__' },
        message: { type: 'string', example: '응답코드에 맞는 메시지' },
        statusCode: { type: 'number', example: HttpStatus.UNAUTHORIZED },
      },
    },
  })
  @Post('apple')
  async processAppleLogin(@Body() appleLoginDto: AppleLoginDto) {
    // memberHash 구하기
    const memberHash = this.oauthService.getAppleMemberHash(appleLoginDto.identityToken);

    // login
    const tokenResponseDto = await this.oauthService.login(memberHash);

    // return access token and refresh token
    throw new CustomResponse(ECustomCode.SUCCESS, tokenResponseDto);
  }

  @ApiOperation({
    summary: '카카오 회원가입',
    description: '카카오 회원가입을 수행합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '카카오 회원가입 성공',
    schema: {
      type: 'object',
      properties: {
        customCode: { type: 'string', example: 'SUCCESS' },
        message: { type: 'string', example: '성공' },
        statusCode: { type: 'number', example: HttpStatus.OK },
        data: { $ref: getSchemaPath(TokenResDto) },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '회원가입 되지 않은 경우',
    schema: {
      type: 'object',
      properties: {
        customCode: { type: 'string', example: 'OAUTH__' },
        message: { type: 'string', example: '응답코드에 맞는 메시지' },
        statusCode: { type: 'number', example: HttpStatus.UNAUTHORIZED },
      },
    },
  })
  @Post('signup/kakao')
  async processKakaoSignup(@Body() kakaoSignupDto: KakaoSignupDto) {
    const [accessToken, username] = [kakaoSignupDto.accessToken, kakaoSignupDto.username];

    // memberHash 구하기
    const memberHash = await this.oauthService.getKakaoMemberHash(accessToken);

    // 닉네임 중복 확인 : MEMBER01
    if (await this.oauthService.isExistUsername(username)) {
      throw new CustomResponse(ECustomCode.MEMBER01);
    }

    // signup
    await this.oauthService.signup(memberHash, username, 'kakao');

    // token들 발급
    const tokenResponseDto = await this.oauthService.generateAccessRefreshTokens(memberHash);

    // return access token and refresh token
    throw new CustomResponse(ECustomCode.SUCCESS, tokenResponseDto);
  }

  @ApiOperation({
    summary: '애플 회원가입',
    description: '애플 회원가입을 수행합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '애플 회원가입 성공',
    schema: {
      type: 'object',
      properties: {
        customCode: { type: 'string', example: 'SUCCESS' },
        message: { type: 'string', example: '성공' },
        statusCode: { type: 'number', example: HttpStatus.OK },
        data: { $ref: getSchemaPath(TokenResDto) },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '회원가입 되지 않은 경우',
    schema: {
      type: 'object',
      properties: {
        customCode: { type: 'string', example: 'OAUTH__' },
        message: { type: 'string', example: '응답코드에 맞는 메시지' },
        statusCode: { type: 'number', example: HttpStatus.UNAUTHORIZED },
      },
    },
  })
  @Post('signup/apple')
  async processAppleSignup(@Body() appleSignupDto: AppleSignupDto) {
    const [identityToken, username] = [appleSignupDto.identityToken, appleSignupDto.username];

    // memberHash 구하기
    const memberHash = this.oauthService.getAppleMemberHash(identityToken);

    // 닉네임 중복 확인 : MEMBER01
    if (await this.oauthService.isExistUsername(username)) {
      throw new CustomResponse(ECustomCode.MEMBER01);
    }

    // signup
    await this.oauthService.signup(memberHash, username, 'apple');

    // token들 발급
    const tokenResponseDto = await this.oauthService.generateAccessRefreshTokens(memberHash);

    // return access token and refresh token
    throw new CustomResponse(ECustomCode.SUCCESS, tokenResponseDto);
  }

  @ApiOperation({
    summary: 'Access token 재발급',
    description: 'refresh token을 이용해 access token을 재발급합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '토큰 재발급 성공',
    schema: {
      type: 'object',
      properties: {
        customCode: { type: 'string', example: 'SUCCESS' },
        message: { type: 'string', example: '성공' },
        statusCode: { type: 'number', example: HttpStatus.OK },
        data: { $ref: getSchemaPath(TokenResDto) },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '리프레시 토큰 유효기간 만료',
    schema: {
      type: 'object',
      properties: {
        customCode: { type: 'string', example: 'JWT02' },
        message: { type: 'string', example: '토큰 만료기간이 경과하였습니다.' },
        statusCode: { type: 'number', example: HttpStatus.UNAUTHORIZED },
      },
    },
  })
  @Post('refresh-token')
  async renewTokens(@CustomHeader(new JwtValidationPipe()) payload) {
    // 새로운 토큰을 생성하고 이를 반환함
    const tokenResponseDto = await this.oauthService.generateAccessRefreshTokens(payload.memberHash);

    // return access token and refresh token
    throw new CustomResponse(ECustomCode.SUCCESS, tokenResponseDto);
  }
}
