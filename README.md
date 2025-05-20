# 이벤트 보상 시스템 (MSA 기반)

## 1. 프로젝트 개요

본 프로젝트는 다양한 조건과 보상을 설정할 수 있는 유연한 이벤트 보상 시스템을 마이크로서비스 아키텍처(MSA)로 구축한 것입니다. 사용자는 등록된 이벤트의 조건을 달성하고 보상을 요청할 수 있으며, 관리자는 이벤트 및 보상 요청 현황을 효과적으로 관리할 수 있습니다. 확장성과 유지보수성을 고려하여 각 기능을 독립된 서비스로 분리하고, 효율적인 통신 방식을 고민하여 설계했습니다.

**주요 기능:**
* **이벤트 관리:** 이벤트 생성, 조회, 기간 및 상태(활성/비활성) 관리
* **보상 관리:** 이벤트별 다양한 보상(포인트, 아이템, 쿠폰 등) 설정 및 수량 관리
* **조건 설정:** 유연한 이벤트 조건 설정 (예: 로그인 일수, 친구 초대 수 등)
* **보상 요청 및 처리:** 사용자의 이벤트 조건 달성 여부 검증 및 보상 지급 요청 처리
* **요청 이력 관리:** 사용자의 보상 요청 이력 및 관리자의 보상 요청 이력 조회 및 상태별 이벤트별 필터링

## 2. 기술 스택

* **Backend:** NestJS (TypeScript), Node 18
* **Database:** MongoDB (Mongoose ODM)
* **API Gateway:** NestJS
* **Microservice Communication:** TCP (using `@nestjs/microservices`)
  * (고민) 내부 서비스 간 통신을 axios를 통한 HTTP 통신으로 고려하였지만, TCP라는 HTTP에 비해 상대적으로 가볍고 빠른 통신을 위해 `@nestjs/microservices` 사용
* **Authentication:** JWT (Access Token, Refresh Token with HTTPOnly Cookie, Redis)
* **Containerization:** Docker, Docker Compose
* **API Documentation:** Swagger (OpenAPI) (Only auth)

## 3. 아키텍처

본 시스템은 API Gateway 패턴을 적용한 마이크로서비스 아키텍처로 구성됩니다.

* **API Gateway:** 모든 클라이언트 요청의 단일 진입점. 인증(JWT 검증), 인가(역할 기반 접근 제어), 라우팅, 요청/응답 변환 수행.
* **Auth Service:** 사용자 인증(로그인, 회원가입), JWT 발급 및 재발급, 사용자 정보 관리.
* **Event Service:** 이벤트 생성/조회, 이벤트 조건 및 보상 관리, 보상 요청 처리 및 이력 관리.
    * (고민) 초기에는 이벤트와 보상 요청 처리를 단일 서비스로 구성했으나, 향후 보상 지급 로직이 복잡해지거나 외부 시스템 연동이 많아질 경우 `RewardService`로 분리하는 방안도 고려했습니다. 현재는 Event 서비스 내에 `EventsModule`과 `RewardClaimsModule`로 논리적 분리.
* **데이터베이스:** 각 주요 서비스(Auth, Event)는 독립적인 MongoDB 데이터베이스를 사용하여 서비스 간 결합도를 낮춤.

## 4. 주요 설계 결정 및 고민 사항

### 4.1. 이벤트 설계
* **데이터 모델의 유연성:** 이벤트 `조건(conditions)`과 `보상(rewards)`은 다양한 유형(로그인 일수, 특정 아이템 지급 등)을 수용할 수 있도록 `type`, `value`, `unit` 등의 필드를 가진 객체 배열 형태로 설계했습니다. 이를 통해 새로운 조건이나 보상 유형 추가 시 스키마 변경을 최소화하고 유연하게 확장할 수 있도록 했습니다.

### 4.2. 조건 검증 방식 (Event Service - RewardClaimsService)
* **중앙 집중 검증:** 사용자가 보상을 요청(`POST /api/v1/reward-claims/events/:eventId/`)하면, `RewardClaimsService`에서 해당 이벤트의 모든 조건을 순차적으로 검증합니다.
  * **(고민) 자동화된 조건 검증 로직:** 조건의 다양성을 부여하다 보니 조건 검증 로직 구현에 어려움이 많았습니다. <br>
  `checkSingleCondition` 메소드 내 `switch` 문은 조건 타입을 확인하고 해당 조건을 검증 로직을 구현했습니다. 로그인 연속 횟수 `LOGIN_STREAK`는 구현이 되었지만, 친구 초대나 레벨 달성이라는 조건은 현재 시스템 상에서는 구현하기 어려움이 많았습니다. 이는 추후 시스템 확장에 있어 구현되어야 할 것 같습니다.
* **MSA 간 통신:** `LOGIN_STREAK` 같은 조건은 Event 서비스에서 다른 마이크로서비스인 Auth 서비스의 데이터가 필요합니다. 이를 위해 Gateway에서 주입된 `userContext`를 활용하고, Event 서비스 내에서 `ClientProxy` (`@nestjs/microservices` TCP 통신)를 사용하여 해당 서비스의 메시지 패턴을 호출, 필요한 정보를 조회하여 검증을 수행합니다.
    

### 4.3. API 구조 및 Gateway 역할
* **Gateway의 명확한 책임:** Gateway는 인증/인가(JWT, RolesGuard), 라우팅, 기본적인 요청 유효성 검사 및 마이크로서비스로의 요청 전달에 집중합니다. 실제 비즈니스 로직은 각 백엔드 서비스가 담당합니다.
  * **(고민) Refresh Token 검증 위치:** Gateway에서 JWT 토큰 검증에 있어 Refresh Token 을 통해 Access Token을 재발급하는 로직에서 Refresh Token 검증을 어디서 해야할지에 대해 고민을 많이 했습니다.<br>
  Access Token이 탈취되었을 때를 가정하여 고민을 한 결과, Refresh Token의 유효성 검증이 Gateway에서 이루어 지려면 key를 가지고 있어야 하기 때문에 캡슐화된 Auth 서비스에서 Refresh Token을 검증하는 것이 더 안전할 것이라고 생각했습니다.
    * `refreshToken`은 보안 강화를 위해 HTTPOnly, Secure, SameSite 속성을 가진 쿠키로 전달하고, Access Token은 응답 본문으로 전달합니다.

## 5. 개선 사항 및 추후계획
* **예외처리 미흡**<br>
서비스 로직에서 RpcException을 통해 예외를 처리하고자 했으나, 클라이언트에 의도한 HTTP 응답 코드와 메시지가 전달되지 않고 모두 `Internal Server Error`로 응답되는 문제가 발생했습니다. 이는 예외 핸들링이 전파 과정에서 적절히 매핑되지 않았기 때문으로 보이며, 향후 `ExceptionFilter`를 커스터마이징하거나 예외 전달 방식(`throw`)을 보다 명확히 분리하여 개선이 필요합니다.
* **API 명세 미완성**<br>
Swagger를 통한 API 명세 작업을 일부만 완료하였고, 전체 API에 대한 스펙 정리 및 설명이 부족한 상태입니다. 향후 모든 API 엔드포인트에 대해 명확한 입력/출력 및 응답 예시 등을 포함하여 명세를 보완할 예정입니다.
* **테스트 코드 미작성**<br>
핵심 기능에 대한 테스트 코드(Jest 기반 단위 테스트 및 통합 테스트)를 작성하지 못하였습니다. 비즈니스 로직의 신뢰성과 안정성을 확보하기 위해 추후 테스트 코드 작성이 필요합니다.
* **클린 코드 적용 부족**<br>
서비스 내부 로직이 길고 복잡해진 부분이 있으며, 일부 메서드는 단일 책임 원칙(SRP)을 위반하고 있습니다. 향후 리팩토링을 통해 코드의 가독성과 유지보수성을 개선하고, 보다 클린한 구조로 정리할 계획입니다.

## 6. 실행 방법

### Prerequisites
* Node.js
* Docker
* Docker Compose

### API 명세
`http://localhost:3000/docs`

### 환경 설정
1.  최상단 디렉토리의 루트(`docker-compose.yml`과 같은 위치)에 `.env` 파일을 생성합니다.
2.  `.env` 파일 내의 각 환경 변수 (DB 연결 정보, JWT 시크릿 키, 서비스 포트 등)를 로컬 환경에 맞게 수정합니다.
   ```env
    # MongoDB env
    MONGO_HOST=mongodb
    MONGO_PORT=27017
    MONGO_USER=root
    MONGO_PASSWORD=root
    AUTH_DB_NAME=auth
    EVENT_DB_NAME=event

    # JWT Secret & Expires Time (보안을 위해 Access Token과 Refresh Token의 비밀키를 각각 다르게 하였음)
    JWT_ACCESS_SECRET=d3cdb5baf67b251c2b7c07f50792e23b8420cf2f51d973d4938ea178dfca2f60614f0d2477d881e8507554071bced22a9904bed6f7b03a529dd4ebb0a5bff025
    JWT_REFRESH_SECRET=143ea445ef40a08a03c76009b15c0e305137e1a6daf3a3e8454546447bdc87d5d2e9bed0cfc2d49998de698f21c44c18354d3de6c213888bd501643fc3448393
    ACCESS_TOKEN_EXPIRES_IN=3600
    REFRESH_TOKEN_EXPIRES_IN=604800

    # Password Salt
    PASSWORD_SALT_ROUNDS=10

    # Redis env
    REDIS_HOST=redis
    REDIS_PORT=6379

    # TCP Host & Port for Microservice communication
    AUTH_SERVICE_HOST=auth
    AUTH_SERVICE_PORT=30011
    EVENT_SERVICE_HOST=event
    EVENT_SERVICE_PORT=30021
   ``` 

### 빌드 및 실행
```bash
# 프로젝트 루트 디렉토리에서 실행
docker-compose up --build