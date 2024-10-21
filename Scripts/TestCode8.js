// CheckUpdate.js
console.log('CheckUpdate.js가 로드되었습니다.');

// @param {string} repo - GitHub 리포지토리 (예: githubkorean/Test)
// @param {string} currentVersion - 현재 스크립트 버전
async function checkForUpdates(repo, currentVersion) {
    // 현재 버전과 리포지토리 정보
    const now = new Date().getTime();
    const lastIgnored = await GM.getValue('version_ignore_time');
    const lastNoShow = await GM.getValue('version_no_show');

    // 남은 시간 확인
    console.log('현재 시간:', now);

    // 1분 동안 무시한 경우, 아무것도 표시하지 않음
    if (lastIgnored && (now - lastIgnored < 1 * 60 * 1000)) {
        return; 
    }

    // 다음날 표시할 시간인지 확인
    if (lastNoShow && now < lastNoShow) {
        return; 
    }

    // 버전 정보 파일 URL
    const versionUrl = `https://raw.githubusercontent.com/${repo}/main/Version.txt`;

    // 페이지 로드 시 텍스트 가져오기
    GM.xmlHttpRequest({
        method: 'GET',
        url: versionUrl,
        onload: function(response) {
            if (response.status === 200) {
                const content = response.responseText.trim();
                
                // 정규식 수정
                const regex = /^(\d+\.\d+)\|?(.*)$/;  // 버전과 스크립트 이름을 분리
                const match = content.match(regex);

                if (match) {
                    const version = match[1]; // 첫 번째 그룹만 추출 (버전)
                    const scriptName = match[2] ? match[2].trim() : '현재 스크립트'; // 두 번째 그룹 (이름)

                    // 버전 비교
                    if (compareVersions(version, currentVersion) > 0) {
                        showVersionAlert(scriptName, version);
                    }
                } else {
                    console.error('응답 내용에서 버전 정보 추출 실패.');
                }
            } else {
                showError('버전 정보를 가져오는 중 오류가 발생했습니다.');
            }
        },
        onerror: function() {
            showError('버전 정보 요청 중 오류 발생.');
        }
    });

    // 메시지 표시 함수
    function showVersionAlert(scriptName, version) {
        const resultDiv = createResultDiv();
        resultDiv.innerHTML = `${scriptName}의 최신 버전인 ${version} 버전을 받으시겠습니까?<br><br>` + 
                              `<a href="#" id="yesLink" style="color: blue;">예</a> | ` +
                              `<a href="#" id="noLink" style="color: blue;">아니오</a> | ` +
                              `<a href="#" id="ignoreLink" style="color: blue;">무시</a>`;

        document.getElementById('yesLink').addEventListener('click', function(event) {
            event.preventDefault();
            GM_openInTab(`https://github.com/${repo}/raw/master/Scripts/${version}.user.js`);
            resultDiv.style.display = 'none';
        });

        document.getElementById('noLink').addEventListener('click', function(event) {
            event.preventDefault();
            handleNoResponse(resultDiv);
        });

        document.getElementById('ignoreLink').addEventListener('click', function(event) {
            event.preventDefault();
            handleIgnoreResponse(resultDiv);
        });
    }

    // 에러 메시지 표시 함수
    function showError(message) {
        const resultDiv = createResultDiv();
        resultDiv.innerText = message;
    }

    // 결과를 표시할 요소 생성
    function createResultDiv() {
        const resultDiv = document.createElement('div');
        resultDiv.style.position = 'fixed';
        resultDiv.style.left = '10px';
        resultDiv.style.bottom = '10px';
        resultDiv.style.backgroundColor = '#f0f0f0';
        resultDiv.style.color = 'black';
        resultDiv.style.border = '1px solid black';
        resultDiv.style.padding = '10px';
        resultDiv.style.zIndex = '9999';
        document.body.appendChild(resultDiv);
        return resultDiv;
    }

    // "아니오" 클릭 처리 함수
    function handleNoResponse(resultDiv) {
        resultDiv.style.display = 'none';
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        GM.setValue('version_no_show', tomorrow.getTime());
    }

    // "무시" 클릭 처리 함수
    function handleIgnoreResponse(resultDiv) {
        resultDiv.style.display = 'none';
        GM.setValue('version_ignore_time', new Date().getTime());
    }

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

// 현재 스크립트 버전과 리포지토리 설정
const currentVersion = '0.0'; // 현재 버전 설정
const repo = 'githubkorean/Violentmonkey-UpdateChecker'; // 리포지토리 설정

// 업데이트 확인 함수 호출
checkForUpdates(repo, currentVersion);
