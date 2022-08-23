FROM node:alpine
# 앱 디렉터리 생성
WORKDIR /home/vkn1234/crowcial

# 앱 의존성 설치
# 가능한 경우(npm@5+) package.json과 package-lock.json을 모두 복사하기 위해
# 와일드카드를 사용
COPY package*.json ./

RUN npm install
RUN npm install -g nodemon
# 프로덕션을 위한 코드를 빌드하는 경우
# RUN npm ci --only=production

# 앱 소스 추가
COPY . .

EXPOSE 65004
CMD [ "npm", "start" ]
