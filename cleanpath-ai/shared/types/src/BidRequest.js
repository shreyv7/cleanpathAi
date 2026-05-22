"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdPosition = exports.AdFormat = exports.DeviceType = void 0;
var DeviceType;
(function (DeviceType) {
    DeviceType["MOBILE"] = "mobile";
    DeviceType["DESKTOP"] = "desktop";
    DeviceType["TABLET"] = "tablet";
    DeviceType["CTV"] = "ctv";
    DeviceType["UNKNOWN"] = "unknown";
})(DeviceType || (exports.DeviceType = DeviceType = {}));
var AdFormat;
(function (AdFormat) {
    AdFormat["BANNER"] = "banner";
    AdFormat["NATIVE"] = "native";
    AdFormat["VIDEO"] = "video";
    AdFormat["INTERSTITIAL"] = "interstitial";
})(AdFormat || (exports.AdFormat = AdFormat = {}));
var AdPosition;
(function (AdPosition) {
    AdPosition["ABOVE_FOLD"] = "above_fold";
    AdPosition["BELOW_FOLD"] = "below_fold";
    AdPosition["SIDEBAR"] = "sidebar";
    AdPosition["FOOTER"] = "footer";
    AdPosition["HEADER"] = "header";
})(AdPosition || (exports.AdPosition = AdPosition = {}));
//# sourceMappingURL=BidRequest.js.map