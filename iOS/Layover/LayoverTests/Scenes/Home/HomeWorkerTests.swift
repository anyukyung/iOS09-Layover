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
        XCTAssertEqual(result?.count, 5)
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
