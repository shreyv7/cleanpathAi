"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockReason = exports.DecisionType = void 0;
var DecisionType;
(function (DecisionType) {
    DecisionType["ALLOW"] = "allow";
    DecisionType["BLOCK"] = "block";
    DecisionType["BID_MODIFIER"] = "bid_modifier";
    DecisionType["REROUTE"] = "reroute";
})(DecisionType || (exports.DecisionType = DecisionType = {}));
var BlockReason;
(function (BlockReason) {
    BlockReason["MFA_HIGH_RISK"] = "mfa_high_risk";
    BlockReason["INVALID_PUBLISHER"] = "invalid_publisher";
    BlockReason["RATE_LIMIT_EXCEEDED"] = "rate_limit_exceeded";
    BlockReason["INVALID_REQUEST"] = "invalid_request";
    BlockReason["FRAUD_DETECTED"] = "fraud_detected";
    BlockReason["POLICY_VIOLATION"] = "policy_violation";
})(BlockReason || (exports.BlockReason = BlockReason = {}));
//# sourceMappingURL=EdgeDecision.js.map