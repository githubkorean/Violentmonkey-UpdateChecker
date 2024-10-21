// TestCode2.js
console.log('CheckUpdate.js가 로드되었습니다.');

// @param {string} repo - GitHub 리포지토리 (예: githubkorean/Test)
// @param {string} currentVersion - 현재 스크립트 버전
async function checkForUpdates(repo, currentVersion) {
    console.log('리포지토리:', repo);
    console.log('현재 버전:', currentVersion);
    
    // 무시한지 1분이 지났는지 확인
    const lastIgnored = await GM.getValue('version_ignore_time');
    const lastNoShow = await GM.getValue('version_no_show');
    const now = new Date().getTime();

    console.log('마지막 무시 시간:', lastIgnored);
    console.log('마지막 표시 시간:', lastNoShow);
    console.log('현재 시간:', now);

    // 1분 동안 무시한 경우, 아무것도 표시하지 않음
    if (lastIgnored && (now - lastIgnored < 1 * 60 * 1000)) {
        console.log('1분 동안 무시됨. 업데이트 확인 종료.');
        return; 
    }

    // 다음날 표시할 시간인지 확인
    if (lastNoShow && now < lastNoShow) {
        console.log('다음날 표시할 시간 아님. 업데이트 확인 종료.');
        return; 
    }

    // 버전 정보 파일 URL
    const versionUrl = `https://raw.githubusercontent.com/${repo}/main/Version.txt`;
    console.log('버전 정보 URL:', versionUrl);

    // 페이지 로드 시 텍스트 가져오기
    GM.xmlHttpRequest({
        method: 'GET',
        url: versionUrl,
        onload: function(response) {
            console.log('응답 상태:', response.status);
            if (response.status === 200) {
                const content = response.responseText.trim();
                console.log('응답 내용:', content);
                
                const regex = /(\S+)\|?(.*)/;
                const match = content.match(regex);

                if (match) {
                    const version = match[1];
                    const scriptName = match[2] ? match[2].trim() : '현재 스크립트';
                    console.log('가져온 버전:', version);
                    console.log('스크립트 이름:', scriptName);

                    // 버전 비교
                    if (compareVersions(version, currentVersion) > 0) {
                        showVersionAlert(scriptName, version);
                    } else {
                        console.log('최신 버전입니다.');
                    }
                } else {
                    console.log('응답 내용에서 버전 정보 추출 실패.');
                }
            } else {
                console.error('응답 오류:', response.status);
                showError('버전 정보를 가져오는 중 오류가 발생했습니다.');
            }
        },
        onerror: function() {
            console.error('네트워크 요청 중 오류 발생.');
            showError('버전 정보 요청 중 오류 발생.');
        }
    });

    // ... 나머지 코드 생략 (showVersionAlert, showError, createResultDiv 등)

    // 버전 비교 함수
    function compareVersions(version1, version2) {
        const v1Parts = version1.split('.').map(Number);
        const v2Parts = version2.split('.').map(Number);
        
        for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
            const v1 = v1Parts[i] || 0;
            const v2 = v2Parts[i] || 0;
            if (v1 > v2) return 1;
            if (v1 < v2) return -1;
        }
        return 0;
    }
}
