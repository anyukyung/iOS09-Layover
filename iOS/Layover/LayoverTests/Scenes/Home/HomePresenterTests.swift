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

final class HomePresenterTests: XCTestCase {
    // MARK: - Subject under test
    var sut: HomePresenter!

    typealias Models = HomeModels

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

    final class HomeDisplayLogicSpy: HomeDisplayLogic {
        var displayPostsCalled = false
        var displayPostsReceivedViewModel: Models.FetchPosts.ViewModel!
        var displayThumbnailImageCalled = false
        var displayThumbnailImageReceivedViewModel: Models.FetchThumbnailImageData.ViewModel!
        var routeToPlaybackCalled = false
        var routeToTagPlayListCalled = false

        func displayPosts(with viewModel: Layover.HomeModels.FetchPosts.ViewModel) {
            displayPostsCalled = true
            displayPostsReceivedViewModel = viewModel
        }

        func routeToPlayback() {
            routeToPlaybackCalled = true
        }

        func routeToTagPlayList() {
            routeToTagPlayListCalled = true
        }
    }

    // MARK: - Tests

    func test_presentPosts는_데이터를_받아오면_뷰의_displayPosts를_실행하여_올바른_값을_전달한다() {
        // arrange
        let spy = HomeDisplayLogicSpy()
        sut.viewController = spy
        let response = Models.FetchPosts.Response(posts: [Seeds.Posts.post1])

        // act
        sut.presentPosts(with: response)

        // assert
        XCTAssertTrue(spy.displayPostsCalled, "presentPosts는 displayPosts를 실행하지 못했다.")
        XCTAssertEqual(spy.displayPostsReceivedViewModel.displayedPosts.count, 1, "presentPosts는 올바른 갯수의 데이터를 전달하지 못했다.")
        XCTAssertEqual(spy.displayPostsReceivedViewModel.displayedPosts[0].tags, Seeds.Posts.post1.tag, "presentPosts는 올바른 데이터를 전달하지 못했다.")
        XCTAssertEqual(spy.displayPostsReceivedViewModel.displayedPosts[0].title, Seeds.Posts.post1.board.title, "presentPosts는 올바른 데이터를 전달하지 못했다.")
        XCTAssertEqual(spy.displayPostsReceivedViewModel.displayedPosts[0].thumbnailImageURL, Seeds.Posts.post1.board.thumbnailImageURL, "presentPosts는 올바른 데이터를 전달하지 못했다.")
        XCTAssertEqual(spy.displayPostsReceivedViewModel.displayedPosts[0].videoURL, Seeds.Posts.post1.board.videoURL, "presentPosts는 올바른 데이터를 전달하지 못했다.")
    }

    func test_presentPosts는_데이터의_썸네일_이미지_URL이_nil인_경우_뷰에게_해당_데이터를_전달하지_않는다() {
        // arrange
        let spy = HomeDisplayLogicSpy()
        sut.viewController = spy
        let response = Models.FetchPosts.Response(posts: [Seeds.Posts.thumbnailImageNilPost])

        // act
        sut.presentPosts(with: response)

        // assert
        XCTAssertTrue(spy.displayPostsCalled, "presentPosts는 displayPosts를 실행하지 못했다.")
        XCTAssertEqual(spy.displayPostsReceivedViewModel.displayedPosts.count, 0, "썸네일 이미지 URL이 nil인 데이터가 뷰에게 전달되었다.")
    }

    func test_presentPosts는_데이터의_비디오_URL이_nil인_경우_뷰에게_해당_데이터를_전달하지_않는다() {
        // arrange
        let spy = HomeDisplayLogicSpy()
        sut.viewController = spy
        let response = Models.FetchPosts.Response(posts: [Seeds.Posts.videoURLNilPost])

        // act
        sut.presentPosts(with: response)

        // assert
        XCTAssertTrue(spy.displayPostsCalled, "presentPosts는 displayPosts를 실행하지 못했다.")
        XCTAssertEqual(spy.displayPostsReceivedViewModel.displayedPosts.count, 0, "비디오 URL이 nil인 데이터가 뷰에게 전달되었다.")
    }

    func test_presentPlaybackScene은_뷰의_routeToPlayback을_실행한다() {
        // arrange
        let spy = HomeDisplayLogicSpy()
        sut.viewController = spy

        // act
        sut.presentPlaybackScene(with: Models.PlayPosts.Response())

        // assert
        XCTAssertTrue(spy.routeToPlaybackCalled, "presentPlaybackScene은 routeToPlayback을 실행하지 못했다.")
    }

    func test_presentTagPlayList는_뷰의_routeToTagPlayList를_실행한다() {
        // arrange
        let spy = HomeDisplayLogicSpy()
        sut.viewController = spy

        // act
        sut.presentTagPlayList(with: Models.ShowTagPlayList.Response())

        // assert
        XCTAssertTrue(spy.routeToTagPlayListCalled, "presentTagPlayListScene은 routeToTagPlayList를 실행하지 못했다.")
    }

}
