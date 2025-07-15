# ER図（Entity-Relationship Diagram）

以下はMermaid記法で記述したER図。Markdownビューアでレンダリング可能。エンティティ: User (is_admin追加), Post (記事/プロンプト/会話の共通基盤), Like, Follow, Favorite, Tag。

```mermaid
erDiagram
    USER {
        int id PK
        string username
        string email
        string password_hash
        boolean is_admin "true for administrators"
    }
    POST {
        int id PK
        int user_id FK
        string type "article | prompt | conversation"
        string title
        text content
        string platform "for conversation: ChatGPT | Claude | Gemini | X"
        datetime created_at
        datetime updated_at
    }
    TAG {
        int id PK
        string name
    }
    LIKE {
        int id PK
        int user_id FK
        int post_id FK
    }
    FOLLOW {
        int id PK
        int follower_id FK
        int followed_id FK
    }
    FAVORITE {
        int id PK
        int user_id FK
        int post_id FK
    }
    POST_TAG {
        int post_id FK
        int tag_id FK
    }

    USER ||--o{ POST : "creates"
    USER ||--o{ LIKE : "gives"
    USER ||--o{ FOLLOW : "follows"
    USER ||--o{ FAVORITE : "favorites"
    POST ||--o{ LIKE : "receives"
    POST ||--o{ FAVORITE : "is_favorited"
    POST ||--o{ POST_TAG : "has"
    TAG ||--o{ POST_TAG : "assigned_to"
    }