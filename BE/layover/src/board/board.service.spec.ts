import { BoardService } from './board.service';
import { Test, TestingModule } from '@nestjs/testing';
import { MemberService } from '../member/member.service';
import { TagService } from '../tag/tag.service';

describe('BoardService', () => {
  let boardService: BoardService;
  const mockBoardRepository = {
    save: jest.fn(),
  };
  const mockMemberService = {
    findMemberById: jest.fn(),
  };
  const mockTagService = {
    saveTag: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        { provide: 'BOARD_REPOSITORY', useValue: mockBoardRepository },
        { provide: MemberService, useValue: mockMemberService },
        { provide: TagService, useValue: mockTagService },
      ],
    }).compile();

    boardService = module.get<BoardService>(BoardService);
  });

  it('should be defined', () => {
    expect(boardService).toBeDefined();
  });

  it('게시글 생성 성공', async () => {
    try {
      // given
      // when
    } catch (e) {
      // then
    }
  });
});
