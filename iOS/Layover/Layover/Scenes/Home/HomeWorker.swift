//
//  HomeWorker.swift
//  Layover
//
//  Created by 김인환 on 11/15/23.
//  Copyright © 2023 CodeBomber. All rights reserved.
//

import UIKit
import OSLog

protocol HomeWorkerProtocol {
    func fetchPosts() async -> [Post]?
}

final class HomeWorker: HomeWorkerProtocol {

    // MARK: - Properties

    typealias Models = HomeModels

    private let provider: ProviderType
    private let postEndPointFactory: PostEndPointFactory

    init(provider: ProviderType = Provider(),
         postEndPointFactory: PostEndPointFactory = DefaultPostEndPointFactory()) {
        self.provider = provider
        self.postEndPointFactory = postEndPointFactory
    }

    // MARK: - Methods

    func fetchPosts() async -> [Post]? {
        let endPoint = postEndPointFactory.makeHomePostListEndPoint()
        do {
            let response = try await provider.request(with: endPoint)
            guard let posts = response.data else { return nil }
            return await fetchThumbnailImageData(of: posts)
        } catch {
            os_log(.error, log: .data, "Failed to fetch posts: %@", error.localizedDescription)
            return nil
        }
    }

    private func fetchThumbnailImageData(of posts: [PostDTO]) async -> [Post] {
        await withTaskGroup(of: Post.self, returning: [Post].self) { group in
            for post in posts {
                group.addTask {
                    let thumbnailImageData = try? await self.provider.request(url: post.board.videoThumbnailURL)
                    var thumbnailLoadedPost = post.toDomain()
                    thumbnailLoadedPost.thumbnailImageData = thumbnailImageData
                    return thumbnailLoadedPost
                }
            }
            var thumbnailLoadedPosts: [Post] = []
            for await thumbnailLoadedPost in group {
                thumbnailLoadedPosts.append(thumbnailLoadedPost)
            }
            return thumbnailLoadedPosts
        }
    }

}
