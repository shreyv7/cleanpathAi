"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MFASignal = exports.RiskLevel = void 0;
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["CLEAN"] = "clean";
    RiskLevel["MODERATE"] = "moderate";
    RiskLevel["HIGH"] = "high";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
var MFASignal;
(function (MFASignal) {
    MFASignal["HIGH_AD_DENSITY"] = "high_ad_density";
    MFASignal["LOW_ENGAGEMENT"] = "low_engagement";
    MFASignal["POOR_CONTENT_RATIO"] = "poor_content_ratio";
    MFASignal["DOMAIN_REPUTATION"] = "domain_reputation";
    MFASignal["SUSPICIOUS_TRAFFIC"] = "suspicious_traffic";
    MFASignal["ARBITRAGE_PATTERN"] = "arbitrage_pattern";
})(MFASignal || (exports.MFASignal = MFASignal = {}));
//# sourceMappingURL=MFAClassification.js.map