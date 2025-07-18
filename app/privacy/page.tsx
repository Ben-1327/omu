import { Metadata } from 'next'
import styles from './privacy.module.css'

export const metadata: Metadata = {
  title: 'プライバシーポリシー - omu',
  description: 'omuサービスのプライバシーポリシーです',
}

export default function PrivacyPage() {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>プライバシーポリシー (Privacy Policy)</h1>
        
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. 導入</h2>
          <p>
            このプライバシーポリシーは、omu（以下「本サービス」）における個人情報の取り扱いを定めます。
            運営者Taichi Okada（個人運営）は、利用者のプライバシーを尊重し、日本法（個人情報保護法など）に準拠して情報を管理します。
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. 収集する情報</h2>
          <p>以下の情報を収集します：</p>
          <ul className={styles.list}>
            <li>ユーザー登録情報: ユーザー名、ユーザーID、メールアドレス、パスワード（ハッシュ化）</li>
            <li>プロフィール情報: 自己紹介文、ウェブサイトURL、X（旧Twitter）リンク、プロフィール画像</li>
            <li>投稿データ: 記事・プロンプト・会話履歴の内容、タイトル、説明文</li>
            <li>OAuth認証情報: Google/GitHub認証時の基本情報（ユーザー名、メールなど）</li>
            <li>利用データ: 投稿の閲覧数、いいね、フォロー関係、お気に入り</li>
            <li>システムデータ: 作成日時、更新日時、セッション情報、IPアドレス、アクセスログ</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. 情報の利用目的</h2>
          <ul className={styles.list}>
            <li>本サービスの提供（投稿共有、ユーザー認証、通知）</li>
            <li>改善・分析（匿名化データを使用したサービス向上）</li>
            <li>法令遵守、問い合わせ対応、セキュリティ対策</li>
            <li>将来的な広告配信や有料機能の実装時、利用者の嗜好分析（同意取得後）</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. 情報の共有と開示</h2>
          <ul className={styles.list}>
            <li>第三者共有: 生成AIプロバイダー（例: Google API）との連携時、必要最小限の情報を共有（同意取得）。ユーザー生成コンテンツは、共有相手に公開される可能性あり</li>
            <li>開示: 法令に基づく場合、または利用者の同意がある場合のみ</li>
            <li>投稿データは公開設定に基づき、他の利用者に表示されます。注意喚起: 投稿前に個人情報を含めないようお願いします</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. データセキュリティ</h2>
          <ul className={styles.list}>
            <li>パスワードはハッシュ化保存</li>
            <li>データ暗号化、アクセス制限、定期バックアップを実施</li>
            <li>侵害時は速やかに通知し、対応します</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. 利用者の権利</h2>
          <ul className={styles.list}>
            <li>情報アクセス、修正、削除依頼可能（メール: <a href="mailto:ff.walker1327@gmail.com" className={styles.link}>ff.walker1327@gmail.com</a>）</li>
            <li>オプトアウト: データ利用拒否（広告配信など）</li>
            <li>退会時、個人情報は削除（法令保存義務除く）</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Cookieとトラッキング</h2>
          <ul className={styles.list}>
            <li>セッション管理、利用分析にCookieを使用。拒否可能ですが、機能制限が発生する可能性あり</li>
            <li>第三者ツール（Google Analyticsなど）は使用せず、内部ログのみ</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>8. 変更</h2>
          <p>
            ポリシーを変更時は本サービス内通知。継続利用で同意とみなします。
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>9. 適用法</h2>
          <p>
            日本法準拠。GDPR準拠が必要な場合、追加権利を提供します。
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>10. 連絡先</h2>
          <p>
            お問い合わせ: <a href="mailto:ff.walker1327@gmail.com" className={styles.link}>ff.walker1327@gmail.com</a>
          </p>
        </section>

        <div className={styles.footer}>
          <p>制定日: 2025年7月19日</p>
        </div>
      </div>
    </main>
  )
}