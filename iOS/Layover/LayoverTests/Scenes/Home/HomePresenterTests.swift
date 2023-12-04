//
//  HomePresenterTests.swift
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

class HomePresenterTests: XCTestCase {
    // MARK: Subject under test
    typealias Models = HomeModels
    var sut: HomePresenter!

    // MARK: - Test lifecycle

    override func setUp() {
        super.setUp()
        setupHomePresenter()
    }

    override func tearDown() {
        super.tearDown()
    }

    // MARK: - Test setup

    func setupHomePresenter() {
        sut = HomePresenter()
    }

    // MARK: - Test doubles

    class HomeDisplayLogicSpy: HomeDisplayLogic {
        func displayPosts(with viewModel: Layover.HomeModels.FetchPosts.ViewModel) {
            return
        }
        
        func displayThumbnailImage(with viewModel: Layover.HomeModels.FetchThumbnailImageData.ViewModel) {
            return
        }
        
        func routeToPlayback() {
            return
        }
        
        func routeToTagPlayList() {
            return
        }
    }

    // MARK: - Tests

}
