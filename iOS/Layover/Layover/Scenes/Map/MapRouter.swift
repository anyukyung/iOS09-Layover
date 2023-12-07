//
//  MapRouter.swift
//  Layover
//
//  Created by 황지웅 on 11/29/23.
//  Copyright © 2023 CodeBomber. All rights reserved.
//

import Foundation

protocol MapRoutingLogic {
    func routeToPlayback()
    func routeToEditVideo()
}

protocol MapDataPassing {
    var dataStore: MapDataStore? { get }
}

final class MapRouter: MapRoutingLogic, MapDataPassing {

    // MARK: - Properties

    weak var viewController: MapViewController?
    var dataStore: MapDataStore?

    // MARK: - Routing

    func routeToPlayback() {
        let playbackViewController: PlaybackViewController = PlaybackViewController()
        guard let source = dataStore,
              let destination = playbackViewController.router?.dataStore
        else { return }
        destination.parentView = .other
        destination.index = source.postPlayStartIndex
        destination.posts = source.posts
        viewController?.navigationController?.pushViewController(playbackViewController, animated: true)
    }

    func routeToEditVideo() {
        let nextViewController = EditVideoViewController()
        guard let source = dataStore,
              var destination = nextViewController.router?.dataStore,
              let videoURL = source.selectedVideoURL
        else { return }

        // Data Passing
        destination.videoURL = videoURL
        nextViewController.hidesBottomBarWhenPushed = true
        viewController?.navigationController?.pushViewController(nextViewController, animated: true)
    }
}