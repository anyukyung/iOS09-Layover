//
//  HomeWorkerTests.swift
//  Layover
//
//  Created by 김인환 on 12/4/23.
//  Copyright (c) 2023 CodeBomber. All rights reserved.
//
//  This file was generated by the Clean Swift Xcode Templates so
//  you can apply clean architecture to your iOS and Mac projects,
//  see http://clean-swift.com
//

@testable import Layover
import XCTest

final class HomeWorkerTests: XCTestCase {
    // MARK: Subject under test

    var sut: HomeWorker!

    // MARK: - Test lifecycle

    override func setUp() {
        super.setUp()
        setupHomeWorker()
    }

    override func tearDown() {
        super.tearDown()
    }

    // MARK: - Test setup

    func setupHomeWorker() {
        sut = HomeWorker(provider: Provider(session: .initMockSession(), authManager: StubAuthManager()))
    }

    // MARK: - Tests

    func test_fetchPost는_성공적으로_데이터를_받아오면_Post배열을_리턴한다() async throws {
        // arrange
        guard let mockFileLocation = Bundle(for: type(of: self)).url(forResource: "PostList", withExtension: "json"),
              let mockData = try? Data(contentsOf: mockFileLocation) else {
            XCTFail("Mock json 파일 로드 실패.")
            return
        }

        MockURLProtocol.requestHandler = { request in
            let response = HTTPURLResponse(url: request.url!,
                                           statusCode: 200,
                                           httpVersion: nil,
                                           headerFields: nil)
            return (response, mockData, nil)
        }
        var result: [Post]?

        // act
        result = await sut.fetchPosts()

        // assert
        XCTAssertNotNil(result)
        XCTAssertEqual(result?.count, 1)
        XCTAssertEqual(result![0].tag, Seeds.Posts.post1.tag)
        XCTAssertEqual(result![0].board.thumbnailImageURL, Seeds.Posts.post1.board.thumbnailImageURL)
        XCTAssertEqual(result![0].board.identifier, Seeds.Posts.post1.board.identifier)
        XCTAssertEqual(result![0].board.title, Seeds.Posts.post1.board.title)
        XCTAssertEqual(result![0].board.description, Seeds.Posts.post1.board.description)
        XCTAssertEqual(result![0].board.videoURL, Seeds.Posts.post1.board.videoURL)
        XCTAssertEqual(result![0].board.latitude, Seeds.Posts.post1.board.latitude)
        XCTAssertEqual(result![0].board.longitude, Seeds.Posts.post1.board.longitude)
        XCTAssertEqual(result![0].member.identifier, Seeds.Posts.post1.member.identifier)
        XCTAssertEqual(result![0].member.username, Seeds.Posts.post1.member.username)
        XCTAssertEqual(result![0].member.introduce, Seeds.Posts.post1.member.introduce)
        XCTAssertEqual(result![0].member.profileImageURL, Seeds.Posts.post1.member.profileImageURL, "fetchPost는_성공적으로_데이터를_받아오면_Post배열을_리턴한다.")
    }

    func test_fetchPost는_데이터를_받아오지_못하면_nil을_리턴한다() async {
        // arrange
        MockURLProtocol.requestHandler = { request in
            let response = HTTPURLResponse(url: request.url!,
                                           statusCode: 404,
                                           httpVersion: nil,
                                           headerFields: nil)
            return (response, nil, nil)
        }
        var result: [Post]?

        // act
        result = await sut.fetchPosts()

        // assert
        XCTAssertNil(result)
    }
}
