// UpdateTest.js

// @param {string} repo - GitHub 리포지토리 (예: githubkorean/Test)
// @param {string} currentVersion - 현재 스크립트 버전
async function checkForUpdates(repo, currentVersion) {
    const lastIgnored = await GM.getValue('version_ignore_time');
    const lastNoShow = await GM.getValue('version_no_show');
    const now = new Date().getTime();

    // 60초 동안 무시한 경우, 60초 동안 아무것도 표시하지 않음
    if (lastIgnored && (now - lastIgnored < 60 * 1000)) {
        const remainingTime = 60 * 1000 - (now - lastIgnored);
        console.log(`업데이트 알림이 나타나기까지 ${formatTime(remainingTime)} 남았습니다.`);
        return; 
    }

    // 24시간 동안 무시한 경우, 24시간 동안 아무것도 표시하지 않음
    if (lastNoShow && now < lastNoShow) {
        const remainingTime = lastNoShow - now;
        console.log(`업데이트 알림이 나타나기까지 ${formatTime(remainingTime)} 남았습니다.`);
        return; 
    }

    const versionUrl = `https://raw.github.com/${repo}/refs/heads/main/Version.txt`;

    GM.xmlHttpRequest({
        method: 'GET',
        url: versionUrl,
        onload: function(response) {
            if (response.status === 200) {
                const content = response.responseText.trim();
                const regex = /([0-9]+\.[0-9]+)\|?(.*)/;  // 정규식
                const match = content.match(regex);

                if (match) {
                    const version = match[1];  // 버전 정보
                    const scriptName = match[2] ? match[2].trim() : '현재 스크립트';  // 스크립트 이름

                    if (compareVersions(version, currentVersion) > 0) {
                        showVersionAlert(scriptName, version);
                    }
                }
            }
        },
        onerror: function() {
            showError('Error fetching text.');
        }
    });

    function showVersionAlert(scriptName, version) {
        const resultDiv = createResultDiv();
        resultDiv.innerHTML = `${scriptName}의 최신 버전인 ${version} 버전을 받으시겠습니까?<br><br>` + 
                              `<a href="#" id="yesLink" style="color: blue;">예</a> | ` +
                              `<a href="#" id="noLink" style="color: blue;">아니오</a> | ` +
                              `<a href="#" id="ignoreLink" style="color: blue;">무시</a>`;

        document.getElementById('yesLink').addEventListener('click', function(event) {
            event.preventDefault();
            const currentPage = window.location.href;
            const updatePage = `https://github.com/${repo}/raw/master/Scripts/${version}.user.js`;
            if (currentPage !== updatePage) {
                GM_openInTab(updatePage);
            }
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

    function showError(message) {
        const resultDiv = createResultDiv();
        resultDiv.innerText = message;
    }

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

    async function handleNoResponse(resultDiv) {
        resultDiv.style.display = 'none';
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        await GM.setValue('version_no_show', tomorrow.getTime()); // 비동기 방식
    }
    
    async function handleIgnoreResponse(resultDiv) {
        resultDiv.style.display = 'none';
        await GM.setValue('version_ignore_time', new Date().getTime()); // 비동기 방식
    }

    function formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours}시 ${minutes}분 ${seconds}초`;
    }

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

// checkForUpdates 함수 호출 부분
checkForUpdates('githubkorean/Test', '0.0'); // 리포지토리 이름과 현재 버전 넣기
