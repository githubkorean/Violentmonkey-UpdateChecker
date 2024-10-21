// ==UserScript==
// @name          업데이트 테스트 0.0
// @namespace     https://github.com/githubkorean/Violentmonkey-UpdateChecker
// @supportURL    https://github.com/githubkorean/Violentmonkey-UpdateChecker
// @homepageURL   https://github.com/githubkorean/Violentmonkey-UpdateChecker
// @match         *://*/*
// @version       0.0
// @description   테스트용 0.0버전 스크립트
// @icon          https://www.google.com/s2/favicons?sz=256&domain_url=github.com
// @author        mickey90427 <mickey90427@naver.com>
// @require       https://github.com/githubkorean/Violentmonkey-UpdateChecker/raw/refs/heads/main/Scripts/Updater.js
// @grant         GM.setValue
// @grant         GM.getValue
// @grant         GM.xmlHttpRequest
// @grant         GM_openInTab
// @license       MIT
// ==/UserScript==

(function() {
    'use strict';
    checkForUpdates('githubkorean/Violentmonkey-UpdateChecker', GM_info.script.version);
})();
