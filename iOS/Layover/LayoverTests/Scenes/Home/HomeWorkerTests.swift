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

class HomeWorkerTests: XCTestCase
{
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
        sut = HomeWorker()
    }

    // MARK: - Test doubles

    // MARK: - Tests
  
    func testSomething() {
        // Given

        // When

        // Then
    }
}
