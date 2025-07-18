import { Metadata } from 'next'
import styles from './terms.module.css'

export const metadata: Metadata = {
  title: '利用規約 - omu',
  description: 'omuサービスの利用規約です',
}

export default function TermsPage() {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>利用規約 (Terms of Service)</h1>
        
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. 導入</h2>
          <p>
            この利用規約（以下「本規約」）は、omu（以下「本サービス」）の利用に関する条件を定めます。
            本サービスは、生成AIに関する記事、プロンプト、会話履歴の投稿、画像アップロード、ユーザー認証を提供するプラットフォームです。
            利用者は本規約に同意の上、本サービスを利用するものとします。同意しない場合、本サービスを利用できません。
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. 定義</h2>
          <ul className={styles.list}>
            <li>「利用者」: 本サービスを利用する個人</li>
            <li>「コンテンツ」: 利用者が投稿する記事、プロンプト、会話履歴、画像など</li>
            <li>「運営者」: Taichi Okada（個人運営）</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. サービスの内容</h2>
          <p>
            運営者は、利用者に対し、生成AI関連のコンテンツ投稿、共有、閲覧機能を提供します。
            将来的に広告表示や有料機能（例: 広告非表示、プレミアム機能）を追加する可能性があります。
            利用者は、コンテンツの作成・共有に責任を持ちます。
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. 利用者の義務</h2>
          <ul className={styles.list}>
            <li>利用者は、18歳以上であること</li>
            <li>違法、害悪、差別的、著作権侵害、プライバシー侵害コンテンツの投稿を禁止</li>
            <li>生成AIコンテンツの人間による確認を推奨し、誤情報拡散を避ける</li>
            <li>画像アップロード時は、自身の権利を有するものに限る</li>
            <li>OAuth認証（Google/GitHub）を使用する場合、正確な情報を提供</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. 知的財産権</h2>
          <p>
            利用者が投稿したコンテンツの権利は利用者に帰属しますが、運営者は本サービスの運営・宣伝・改善のために
            非独占的、譲渡可能、無償のライセンスを取得します。生成AIによる創作物の権利は、利用者が責任を負います。
            運営者は、コンテンツの削除権を保有します。
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. 責任の制限</h2>
          <p>
            運営者は、本サービスの可用性、コンテンツの正確性、生成AIの出力品質を保証しません。
            損害賠償責任は、直接損害に限り、100円以内に制限されます。間接損害（逸失利益など）は免責とします。
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. 終了と停止</h2>
          <p>
            運営者は、違反時に予告なくアカウントを停止・削除できます。利用者はいつでも退会可能。
            退会後、コンテンツは運営者の判断で削除されます。
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>8. 適用法と紛争解決</h2>
          <p>
            本規約は日本法に準拠します。紛争は東京地方裁判所を第一審専属管轄裁判所とします。
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>9. 変更</h2>
          <p>
            運営者は本規約を変更可能。変更は本サービス内通知後適用。継続利用で同意とみなします。
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