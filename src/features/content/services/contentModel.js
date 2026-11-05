// Preserve Firestore's structured content; adapt legacy author/date field shapes
// at the repository boundary instead of rewriting published article bodies.
export function normalizeBlogPost(post) {
  return {
    ...post,
    author: typeof post.author === 'string' ? post.author : post.author?.name || 'SkinID Advisory',
    date: post.date || post.publishedAt || '',
    image: post.image || post.cover || '',
    featuredProductIds: post.featuredProductIds || post.relatedProductIds || []
  };
}
