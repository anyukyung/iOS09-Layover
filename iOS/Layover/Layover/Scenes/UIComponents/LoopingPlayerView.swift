//
//  LoopingPlayerView.swift
//  Layover
//
//  Created by 김인환 on 11/20/23.
//  Copyright © 2023 CodeBomber. All rights reserved.
//

import UIKit
import AVFoundation

final class LoopingPlayerView: UIView {

    // MARK: - Properties

    override static var layerClass: AnyClass { AVPlayerLayer.self }

    private(set) var player: AVQueuePlayer? {
        get { playerLayer?.player as? AVQueuePlayer }
        set { playerLayer?.player = newValue }
    }

    private var looper: AVPlayerLooper?

    private var playerLayer: AVPlayerLayer? { layer as? AVPlayerLayer }

    var isPlaying: Bool {
        player?.timeControlStatus == .playing
    }

    // MARK: - View Life Cycle

    override func layoutSubviews() {
        super.layoutSubviews()
        playerLayer?.frame = bounds
        playerLayer?.videoGravity = .resizeAspectFill
    }

    // MARK: - Methods
    // TODO: - 아래쪽 메서드가 사용하기 괜찮으면 이 메서드 삭제
    func prepareVideo(with url: URL, timeRange: CMTimeRange) {
        let playerItem = AVPlayerItem(url: url)
        let player = AVQueuePlayer(playerItem: playerItem)
        looper = AVPlayerLooper(player: player, templateItem: playerItem, timeRange: timeRange)
        self.player = player
    }

    func prepareVideo(with url: URL, loopStart: TimeInterval, duration: TimeInterval) {
        let playerItem = AVPlayerItem(url: url)
        let player = AVQueuePlayer(playerItem: playerItem)
        looper = AVPlayerLooper(player: player,
                                templateItem: playerItem,
                                timeRange: CMTimeRange(start: CMTime(value: Int64(loopStart * 600),
                                                                     timescale: CMTimeScale(600)),
                                                       end: CMTime(value: Int64((loopStart + duration) * 600), timescale: 600)))
        self.player = player
    }

    func disable() {
        pause()
        player = nil
        looper = nil
    }

    func play() {
        if !isPlaying {
            player?.play()
        }
    }

    func pause() {
        if isPlaying {
            player?.pause()
        }
    }
}

#Preview {
    let view = LoopingPlayerView()
    view.prepareVideo(with: URL(string: "http://devimages.apple.com/iphone/samples/bipbop/bipbopall.m3u8")!,
                      timeRange: .init(start: .zero,
                                       end: .init(seconds: 3.0, preferredTimescale: CMTimeScale(1.0))))
    view.play()
    view.player?.isMuted = true
    return view
}