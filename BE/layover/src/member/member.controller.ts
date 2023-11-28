import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { CheckUsernameDto } from './dtos/check-username.dto';
import { MemberService } from './member.service';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { CheckUsernameResDto } from './dtos/check-username-res.dto';
import { CustomResponse } from 'src/response/custom-response';
import { ECustomCode } from 'src/response/ecustom-code.jenum';
import { UsernameResDto } from './dtos/username-res.dto';
import { UsernameDto } from './dtos/username.dto';
import { CustomHeader } from 'src/pipes/custom-header.decorator';
import { JwtValidationPipe } from 'src/pipes/jwt.validation.pipe';
import { IntroduceDto } from './dtos/introduce.dto';
import { IntroduceResDto } from './dtos/introduce-res.dto';
import { DeleteMemberResDto } from './dtos/delete-member-res.dto';
import { ProfilePresignedUrlDto } from './dtos/profile-presigned-url.dto';
import { ProfilePresignedUrlResDto } from './dtos/profile-presigned-url-res.dto';
import { MemberInfosResDto } from './dtos/member-infos-res.dto';
import { SWAGGER } from 'src/utils/swaggerUtils';

@ApiTags('Member API')
@Controller('member')
@ApiResponse(SWAGGER.SERVER_CUSTOM_RESPONSE)
@ApiResponse(SWAGGER.HTTP_ERROR_RESPONSE)
@ApiResponse(SWAGGER.INTERNAL_SERVER_ERROR_RESPONSE)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @ApiOperation({
    summary: '닉네임 검증(중복)',
    description: '닉네임 검증을 수행합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '닉네임 검증 결과',
    schema: {
      type: 'object',
      properties: {
        customCode: { type: 'string', example: 'SUCCESS' },
        message: { type: 'boolean', example: '성공' },
        statusCode: { type: 'number', example: HttpStatus.OK },
        data: { $ref: getSchemaPath(CheckUsernameResDto) },
      },
    },
  })
  @Post('check-username')
  async checkUsername(@Body() usernameDto: CheckUsernameDto) {
    const isValid = !(await this.memberService.isExistUsername(usernameDto.username));
    throw new CustomResponse(ECustomCode.SUCCESS, new CheckUsernameResDto(isValid));
  }

  @ApiOperation({
    summary: '닉네임 수정',
    description: '닉네임 수정을 수행합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '닉네임 수정 결과',
    schema: {
      type: 'object',
      properties: {
        customCode: { type: 'string', example: 'SUCCESS' },
        message: { type: 'boolean', example: '성공' },
        statusCode: { type: 'number', example: HttpStatus.OK },
        data: { $ref: getSchemaPath(UsernameResDto) },
      },
    },
  })
  @ApiResponse(SWAGGER.ACCESS_TOKEN_TIMEOUT_RESPONSE)
  @ApiHeader(SWAGGER.AUTHORIZATION_HEADER)
  @Patch('username')
  async updateUsername(@CustomHeader(new JwtValidationPipe()) payload, @Body() usernameDto: UsernameDto) {
    const id = payload.memberId;
    const username = usernameDto.username;
    // 중복 검증
    if (await this.memberService.isExistUsername(username)) {
      throw new CustomResponse(ECustomCode.MEMBER01);
    }

    // db에 반영
    await this.memberService.updateUsername(id, username);

    // 응답
    throw new CustomResponse(ECustomCode.SUCCESS, new UsernameResDto(username));
  }

  @ApiOperation({
    summary: '자기소개 수정',
    description: '자기소개 수정을 수행합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '자기소개 수정 결과',
    schema: {
      type: 'object',
      properties: {
        customCode: { type: 'string', example: 'SUCCESS' },
        message: { type: 'boolean', example: '성공' },
        statusCode: { type: 'number', example: HttpStatus.OK },
        data: { $ref: getSchemaPath(IntroduceResDto) },
      },
    },
  })
  @ApiResponse(SWAGGER.ACCESS_TOKEN_TIMEOUT_RESPONSE)
  @ApiHeader(SWAGGER.AUTHORIZATION_HEADER)
  @Patch('introduce')
  async updateIntroduce(@CustomHeader(new JwtValidationPipe()) payload, @Body() introduceDto: IntroduceDto) {
    const id = payload.memberId;
    const introduce = introduceDto.introduce;

    // db에 반영
    await this.memberService.updateIntroduce(id, introduce);

    // 응답
    throw new CustomResponse(ECustomCode.SUCCESS, new IntroduceResDto(introduce));
  }

  @ApiOperation({
    summary: '회원 탈퇴(삭제)',
    description: '회원 삭제를 수행합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '삭제된 회원 정보(닉네임)',
    schema: {
      type: 'object',
      properties: {
        customCode: { type: 'string', example: 'SUCCESS' },
        message: { type: 'boolean', example: '성공' },
        statusCode: { type: 'number', example: HttpStatus.OK },
        data: { $ref: getSchemaPath(DeleteMemberResDto) },
      },
    },
  })
  @ApiResponse(SWAGGER.ACCESS_TOKEN_TIMEOUT_RESPONSE)
  @ApiHeader(SWAGGER.AUTHORIZATION_HEADER)
  @Delete()
  async deleteMember(@CustomHeader(new JwtValidationPipe()) payload) {
    const id = payload.memberId;

    // 삭제될 유저 정보 가져오기
    const memberInfo = await this.memberService.selectUsername(id);

    // db에 반영
    await this.memberService.deleteMember(id);

    // 응답
    throw new CustomResponse(ECustomCode.SUCCESS, new DeleteMemberResDto(memberInfo));
  }

  @ApiOperation({
    summary: '프로필 이미지 업로드용 presigned url 요청',
    description: '프로필 이미지 업로드용 presigned url을 응답으로 줍니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '프로필 이미지 업로드용 presigned url',
    schema: {
      type: 'object',
      properties: {
        customCode: { type: 'string', example: 'SUCCESS' },
        message: { type: 'boolean', example: '성공' },
        statusCode: { type: 'number', example: HttpStatus.OK },
        data: { $ref: getSchemaPath(ProfilePresignedUrlResDto) },
      },
    },
  })
  @ApiResponse(SWAGGER.ACCESS_TOKEN_TIMEOUT_RESPONSE)
  @ApiHeader(SWAGGER.AUTHORIZATION_HEADER)
  @Post('profile-image/presigned-url')
  async getUploadProfilePresignedUrl(@CustomHeader(new JwtValidationPipe()) payload, @Body() body: ProfilePresignedUrlDto) {
    const id = payload.memberId;

    // 프로필 사진 업로드할 presigned url 생성하기
    const member = await this.memberService.findMemberById(id);
    const filename = member.username;
    const filetype = body.filetype;
    const bucketname = process.env.NCLOUD_S3_PROFILE_BUCKET_NAME;
    const { preSignedUrl } = this.memberService.makeUploadPreSignedUrl(bucketname, filename, 'image', filetype);

    // db에 반영
    const key = `${filename}.${filetype}`;
    await this.memberService.updateProfileImage(id, key);

    // 응답
    throw new CustomResponse(ECustomCode.SUCCESS, new ProfilePresignedUrlResDto(preSignedUrl));
  }

  @ApiOperation({
    summary: '회원(본인) 정보 요청',
    description: '회원(본인) 정보들(닉네임, 자기소개, 프로필 이미지 url)을 응답으로 줍니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '회원(본인) 정보들',
    schema: {
      type: 'object',
      properties: {
        customCode: { type: 'string', example: 'SUCCESS' },
        message: { type: 'boolean', example: '성공' },
        statusCode: { type: 'number', example: HttpStatus.OK },
        data: { $ref: getSchemaPath(MemberInfosResDto) },
      },
    },
  })
  @ApiResponse(SWAGGER.ACCESS_TOKEN_TIMEOUT_RESPONSE)
  @ApiHeader(SWAGGER.AUTHORIZATION_HEADER)
  @Get()
  async getMemberInfos(@CustomHeader(new JwtValidationPipe()) payload) {
    const id = payload.memberId;
    const member = await this.memberService.findMemberById(id);

    const username = member.username;
    const introduce = member.introduce;
    const profileImageKey = member.profile_image_key;

    const bucketname = process.env.NCLOUD_S3_PROFILE_BUCKET_NAME;
    let preSignedUrl: string;
    if (profileImageKey !== 'default') {
      ({ preSignedUrl } = this.memberService.makeDownloadPresignedUrl(bucketname, member.profile_image_key));
    } else {
      ({ preSignedUrl } = this.memberService.makeDownloadPresignedUrl(bucketname, 'default.jpeg')); // 기본 이미지 사용!
    }

    // 응답
    throw new CustomResponse(ECustomCode.SUCCESS, new MemberInfosResDto(id, username, introduce, preSignedUrl));
  }

  @ApiOperation({
    summary: '회원(타인) 정보 요청',
    description: '회원(타인) 정보들(닉네임, 자기소개, 프로필 이미지 url)을 응답으로 줍니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '회원(타인) 정보들',
    schema: {
      type: 'object',
      properties: {
        customCode: { type: 'string', example: 'SUCCESS' },
        message: { type: 'boolean', example: '성공' },
        statusCode: { type: 'number', example: HttpStatus.OK },
        data: { $ref: getSchemaPath(MemberInfosResDto) },
      },
    },
  })
  @ApiResponse(SWAGGER.ACCESS_TOKEN_TIMEOUT_RESPONSE)
  @ApiHeader(SWAGGER.AUTHORIZATION_HEADER)
  @Get(':id')
  async getOtherMemberInfos(@CustomHeader(new JwtValidationPipe()) payload, @Param('id') id: number) {
    const member = await this.memberService.findMemberById(id);
    if (member === null) throw new CustomResponse(ECustomCode.MEMBER02);

    const username = member.username;
    const introduce = member.introduce;
    const profileImageKey = member.profile_image_key;

    const bucketname = process.env.NCLOUD_S3_PROFILE_BUCKET_NAME;
    let preSignedUrl: string;
    if (profileImageKey !== 'default') {
      ({ preSignedUrl } = this.memberService.makeDownloadPresignedUrl(bucketname, member.profile_image_key));
    } else {
      ({ preSignedUrl } = this.memberService.makeDownloadPresignedUrl(bucketname, 'default.jpeg')); // 기본 이미지 사용!
    }

    // 응답
    throw new CustomResponse(ECustomCode.SUCCESS, new MemberInfosResDto(id, username, introduce, preSignedUrl));
  }
}