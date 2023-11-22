//
//  SignUpModels.swift
//  Layover
//
//  Created by kong on 2023/11/15.
//  Copyright © 2023 CodeBomber. All rights reserved.
//

import UIKit

enum SignUpModels {

    // MARK: - Use Cases

    enum ValidateNickname {
        struct Request {
            var nickname: String
        }
        struct Response {
            var nicknameState: NicknameState
        }
        struct ViewModel {
            var canCheckDuplication: Bool
            var alertDescription: String?
        }
    }

    // MARK: - State Type
    enum NicknameState {
        case valid
        case lessThan2GreaterThan8
        case invalidCharacter

        var alertDescription: String? {
            switch self {
            case .valid:
                return nil
            case .lessThan2GreaterThan8:
                return "2자 이상 8자 이하로 입력해주세요."
            case .invalidCharacter:
                return "입력할 수 없는 문자입니다."
            }
        }
    }
}
