"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublisherTier = exports.PublisherStatus = void 0;
var PublisherStatus;
(function (PublisherStatus) {
    PublisherStatus["ACTIVE"] = "active";
    PublisherStatus["SUSPENDED"] = "suspended";
    PublisherStatus["UNDER_REVIEW"] = "under_review";
    PublisherStatus["BLOCKED"] = "blocked";
})(PublisherStatus || (exports.PublisherStatus = PublisherStatus = {}));
var PublisherTier;
(function (PublisherTier) {
    PublisherTier["PREMIUM"] = "premium";
    PublisherTier["STANDARD"] = "standard";
    PublisherTier["PROBATION"] = "probation";
    PublisherTier["BLOCKED"] = "blocked";
})(PublisherTier || (exports.PublisherTier = PublisherTier = {}));
//# sourceMappingURL=Publisher.js.map