import PostForm from '@/components/posts/PostForm'
import styles from './new-post.module.css'

export default function NewPostPage() {
  return (
    <div className={styles.container}>
      <PostForm />
    </div>
  )
}