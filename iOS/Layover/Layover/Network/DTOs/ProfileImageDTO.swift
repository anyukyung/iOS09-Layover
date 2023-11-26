//
//  ProfileImageDTO.swift
//  Layover
//
//  Created by kong on 2023/11/25.
//  Copyright © 2023 CodeBomber. All rights reserved.
//

import Foundation

struct ProfileImageDTO: Codable {
    let profileImage: URL

    enum CodingKeys: String, CodingKey {
        case profileImage = "profile-Image"
    }
}
