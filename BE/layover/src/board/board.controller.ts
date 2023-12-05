import { Body, Controller, Delete, Get, Logger, Post, Query } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { BoardService } from './board.service';
import { ECustomCode } from '../response/ecustom-code.jenum';
import { CustomResponse } from '../response/custom-response';
import { BoardPreSignedUrlDto } from './dtos/board-pre-signed-url.dto';
import { CreateBoardDto } from './dtos/create-board.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateBoardResDto } from './dtos/create-board-res.dto';
import { UploadCallbackDto } from './dtos/upload-callback.dto';
import { EncodingCallbackDto } from './dtos/encoding-callback.dto';
import { CustomHeader } from '../pipes/custom-header.decorator';
import { JwtValidationPipe } from '../pipes/jwt.validation.pipe';
import { BoardsResDto } from './dtos/boards-res.dto';
import { SWAGGER } from '../utils/swaggerUtils';
import { BOARD_SWAGGER } from './board.swagger';
import { makeUploadPreSignedUrl } from '../utils/s3Utils';
import { PreSignedUrlResDto } from '../utils/pre-signed-url-res.dto';
import { tokenPayload } from '../utils/interfaces/token.payload';

@ApiTags('게시물(영상 포함) API')
@Controller('board')
export class BoardController {
  private readonly logger: Logger = new Logger(BoardController.name);

  constructor(private readonly boardService: BoardService) {}

  @ApiOperation({
    summary: '게시글 생성 요청',
    description: '게시글에 들어갈 내용들과 함께 업로드를 요청합니다.',
  })
  @ApiResponse(BOARD_SWAGGER.CREATE_BOARD_SUCCESS)
  @ApiBearerAuth('token')
  @Post()
  async createBoard(@CustomHeader(new JwtValidationPipe()) payload: tokenPayload, @Body() createBoardDto: CreateBoardDto) {
    const savedBoard: CreateBoardResDto = await this.boardService.createBoard(
      payload.memberId,
      createBoardDto.title,
      createBoardDto.content,
      createBoardDto.latitude,
      createBoardDto.longitude,
      createBoardDto.tag,
    );
    throw new CustomResponse(ECustomCode.SUCCESS, savedBoard);
  }

  @ApiOperation({
    summary: 'presigned url 요청',
    description: 'object storage에 영상을 업로드 하기 위한 presigned url을 요청합니다.',
  })
  @ApiResponse(BOARD_SWAGGER.GET_PRESIGNED_URL_SUCCESS)
  @ApiBearerAuth('token')
  @Post('presigned-url')
  async getPreSignedUrl(@CustomHeader(new JwtValidationPipe()) payload: tokenPayload, @Body() preSignedUrlDto: BoardPreSignedUrlDto) {
    const [filename, filetype] = [uuidv4(), preSignedUrlDto.filetype];
    const bucketname = process.env.NCLOUD_S3_ORIGINAL_BUCKET_NAME;

    // 파일명 저장
    await this.boardService.saveFilenameById(preSignedUrlDto.boardId, filename);
    const preSignedUrl = makeUploadPreSignedUrl(bucketname, filename, 'video', filetype);
    throw new CustomResponse(ECustomCode.SUCCESS, new PreSignedUrlResDto(preSignedUrl));
  }

  @ApiOperation({
    summary: '홈 화면 게시글 조회',
    description: '랜덤 게시물 (최대) 10개를 조회합니다.',
  })
  @ApiResponse(BOARD_SWAGGER.GET_BOARD_SUCCESS)
  @ApiBearerAuth('token')
  @Get('home')
  async getBoardRandom() {
    const boardsRestDto: BoardsResDto[] = await this.boardService.getBoardRandom();
    throw new CustomResponse(ECustomCode.SUCCESS, boardsRestDto);
  }

  @ApiOperation({
    summary: '지도 화면 게시글 조회',
    description: '거리에 따라 지도 화면에 보여질 게시물들을 조회합니다.',
  })
  @ApiResponse(BOARD_SWAGGER.GET_BOARD_SUCCESS)
  @ApiBearerAuth('token')
  @Get('map')
  async getBoardMap(
    @CustomHeader(new JwtValidationPipe()) payload: tokenPayload,
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
  ) {
    const boardsRestDto: BoardsResDto[] = await this.boardService.getBoardMap(latitude, longitude);
    throw new CustomResponse(ECustomCode.SUCCESS, boardsRestDto);
  }

  @ApiResponse(BOARD_SWAGGER.GET_BOARD_SUCCESS)
  @ApiBearerAuth('token')
  @Get('tag')
  @ApiOperation({
    summary: '태그별 게시글 조회',
    description: '태그에 따라 게시물들을 조회합니다.',
  })
  async getBoardTag(@CustomHeader(new JwtValidationPipe()) payload: tokenPayload, @Query('tag') tag: string, @Query('page') page: string) {
    const boardsRestDto: BoardsResDto[] = await this.boardService.getBoardTag(tag, parseInt(page));
    throw new CustomResponse(ECustomCode.SUCCESS, boardsRestDto);
  }

  @ApiResponse(BOARD_SWAGGER.GET_BOARD_SUCCESS)
  @ApiBearerAuth('token')
  @ApiQuery(SWAGGER.MEMBER_ID_QUERY_STRING)
  @Get('profile')
  @ApiOperation({
    summary: '프로필 게시글 조회',
    description: '나 또는 타인의 게시물을 조회합니다.',
  })
  async getBoardProfile(
    @CustomHeader(new JwtValidationPipe()) payload: tokenPayload,
    @Query('memberId') memberId: string,
    @Query('page') page: string,
  ) {
    let id = -1;

    if (memberId !== undefined) {
      // memberId가 존재하면 타인의 프로필을 조회하는 것이다.
      id = parseInt(memberId);
    } else {
      // memberId가 존재하지 않으면 내 프로필을 조회하는 것이다.
      id = payload.memberId;
    }

    const boardsRestDto: BoardsResDto[] = await this.boardService.getBoardProfile(id, parseInt(page));
    throw new CustomResponse(ECustomCode.SUCCESS, boardsRestDto);
  }

  @ApiBearerAuth('token')
  @Delete()
  @ApiOperation({
    summary: '게시물 삭제',
    description: '사용자가 원하는 게시물을 삭제합니다.',
  })
  async deleteBoard(@CustomHeader(new JwtValidationPipe()) payload: tokenPayload, @Query('boardId') boardId: string) {
    await this.boardService.deleteBoard(boardId);
    throw new CustomResponse(ECustomCode.SUCCESS);
  }

  @ApiOperation({
    summary: '원본 영상 업로드 완료 콜백',
    description: '클라이언트를 통해 원본 영상이 업로드 되면 호출됩니다.',
  })
  @Post('/upload-callback')
  async uploadCallback(@Body() uploadCallbackRequestDto: UploadCallbackDto) {
    this.logger.log(`[upload-callback] filename: ${uploadCallbackRequestDto.filename}`);
    throw new CustomResponse(ECustomCode.SUCCESS);
  }

  @ApiOperation({
    summary: '인코딩 완료 콜백',
    description: '인코딩 상태에 따라 호출되어지며, 인코딩 상태를 갱신하며, 인코딩된 영상의 hls link를 db에 저장합니다.',
  })
  @Post('/encoding-callback')
  async encodingCallback(@Body() encodingCallbackRequestDto: EncodingCallbackDto) {
    this.logger.log(`[encoding-callback] filePath: ${encodingCallbackRequestDto.filePath}`);
    const regExp = /^\/layover-station\/(.*?)(_AVC.*?)\.mp4$/;
    const filename = encodingCallbackRequestDto.filePath.match(regExp)[1];

    //파일명으로 파일을 찾고 해당 파일의 status 를 갱신해준다.
    switch (encodingCallbackRequestDto.status) {
      case 'RUNNING':
        this.logger.log(`[encoding-callback] status: **RUNNING**`);
        await this.boardService.setStatusByFilename(filename, 'RUNNING');
        break;
      case 'FAILURE':
        this.logger.log(`[encoding-callback] status: **FAILURE**`);
        await this.boardService.setStatusByFilename(filename, 'FAILURE');
        break;
      case 'COMPLETE':
        this.logger.log(`[encoding-callback] status: **COMPLETE**`);
        await this.boardService.setStatusByFilename(filename, 'COMPLETE');
        await this.boardService.setEncodedVideoUrl(filename);
        break;
    }
    throw new CustomResponse(ECustomCode.SUCCESS);
  }
}
