//
//  PlaybackCell.swift
//  Layover
//
//  Created by 황지웅 on 11/24/23.
//  Copyright © 2023 CodeBomber. All rights reserved.
//

import UIKit

final class PlaybackCell: UICollectionViewCell {
    let playbackView: PlaybackView = PlaybackView()

    override init(frame: CGRect) {
        super.init(frame: frame)
        configure()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        configure()
    }

    func setPlaybackContents(info: PlaybackModels.PlaybackInfo) {
        playbackView.descriptionView.titleLabel.text = info.title
        playbackView.descriptionView.setText(info.content)
        playbackView.profileLabel.text = info.profileName
        playbackView.tagStackView.resetTagStackView()
        info.tag.forEach { tag in
            playbackView.tagStackView.addTag(tag)
        }
    }

    func addAVPlayer(url: URL) {
        playbackView.resetPlayer()
        playbackView.addAVPlayer(url: url)
    }

    private func configure() {
        playbackView.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(playbackView)
        NSLayoutConstraint.activate([
            playbackView.topAnchor.constraint(equalTo: contentView.topAnchor),
            playbackView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor),
            playbackView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
            playbackView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor)
        ])
    }
}