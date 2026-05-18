팀플 앱 테스트 방법입니다.

1. 먼저 PC에 Git, Node.js, VS Code가 설치되어 있어야 합니다.

2. 명령 프롬프트(cmd)를 열고 바탕화면으로 이동합니다.

```bash
cd Desktop
```

3. 깃허브 파일을 받습니다.

```bash
git clone https://github.com/2BSame/travel-route-app.git
```

4. 프로젝트 폴더로 들어갑니다.

```bash
cd travel-route-app
```

5. 필요한 라이브러리를 설치합니다.

```bash
npm install
```

6. 앱을 실행합니다.

```bash
npx expo start
```

7. 실행 후 QR 코드가 나오면 휴대폰에서 확인할 수 있습니다.

휴대폰으로 테스트하려면 **Expo Go** 앱을 설치해야 합니다. Android는 Google Play, iPhone은 App Store에서 `Expo Go`를 검색해서 설치하면 됩니다. Expo 공식 설명에서도 Expo Go로 휴대폰에서 앱을 실행해볼 수 있다고 안내하고 있습니다. ([Expo][1])

8. Expo Go 설치가 귀찮으면 PC 브라우저로도 간단히 볼 수 있습니다.

`npx expo start` 실행 후 터미널에서 키보드로

```text
w
```

를 누르면 웹 브라우저에서 실행됩니다.

단, 최종 확인은 휴대폰 Expo Go로 하는 것이 더 좋습니다.

[1]: https://expo.dev/?utm_source=chatgpt.com "Expo"
