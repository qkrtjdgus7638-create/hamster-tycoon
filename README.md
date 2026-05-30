# 햄찌 코인 공장 MVP

먹이를 뽑고, 햄스터가 먹고, 돈을 벌고, 햄스터를 강화하는 브라우저 웹게임 MVP입니다. 백엔드 없이 `localStorage`에 저장합니다.

## 실행 방법

의존성 설치가 필요 없습니다.

```bash
python3 -m http.server 5173
```

또는 `npm`을 사용한다면 아래 명령으로도 실행할 수 있습니다.

```bash
npm start
```

브라우저에서 아래 주소를 엽니다.

```text
http://localhost:5173
```

## GitHub Pages 배포

이 저장소를 GitHub에 올린 뒤 GitHub 저장소의 `Settings > Pages`에서 아래처럼 설정합니다.

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/ (root)`

저장하면 잠시 뒤 아래 형식의 주소로 공개됩니다.

```text
https://계정명.github.io/저장소명/
```

## 구현 범위

- 메인 화면
- 먹이 뽑기와 자동 섭취
- 햄스터 레벨, 등급, 경험치, 강화 수치 표시
- 강화 비용, 성공률, 실패 시 하락 규칙
- 먹이 도감
- 희귀 이상 먹이 획득 기록
- 랭킹 확장을 위한 `rankingSeed` 데이터 구조
- 브라우저 `localStorage` 저장과 초기화

## 테스트

핵심 공식 테스트를 실행합니다.

```bash
npm test
```

## 파일 구조

```text
.
├── index.html
├── README.md
└── src
    ├── js
    │   ├── app.js        # 앱 시작점과 이벤트 연결
    │   ├── data.js       # 먹이/햄스터/강화 기준 데이터
    │   ├── formulas.js   # 경험치, 보상, 강화 비용 공식
    │   ├── game.js       # 게임 액션 처리
    │   ├── storage.js    # localStorage 저장/로드
    │   └── ui.js         # 화면 렌더링
    └── styles
        └── main.css
```

## 확장 메모

- 이미지와 애니메이션은 `ui.js`의 햄스터/먹이 표시 영역을 컴포넌트화해서 교체하면 됩니다.
- 서버 저장은 `storage.js`를 API 클라이언트로 바꾸면 게임 로직을 유지할 수 있습니다.
- 랭킹은 현재 `rankingSeed`의 `bestLevel`, `bestUpgrade`, `totalEarnedMoney`를 서버에 전송하는 방식으로 붙일 수 있습니다.
- 결제 기능은 재화 지급 로직을 `game.js` 액션으로 추가하고, 검증은 서버에서 처리하는 구조가 적합합니다.
