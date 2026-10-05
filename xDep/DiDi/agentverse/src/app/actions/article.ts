"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function submitGuestPost(formData: FormData) {
  const title = formData.get("title") as string;
  const excerpt = formData.get("excerpt") as string;
  const body = formData.get("body") as string;
  const authorName = formData.get("authorName") as string;
  const authorEmail = formData.get("authorEmail") as string;
  const authorBio = formData.get("authorBio") as string;
  const categoryName = formData.get("categoryName") as string;
  const featuredImage = formData.get("featuredImage") as string;

  if (!title || !body || !authorName || !authorEmail) {
    throw new Error("Missing required fields");
  }

  // Generate a basic slug
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();

  // Upsert the author based on email (or just create a dummy record for guest)
  let author = await db.author.findFirst({
    where: { slug: authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
  });

  if (!author) {
    author = await db.author.create({
      data: {
        name: authorName,
        slug: authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
        bio: authorBio || 'Guest Contributor',
        expertise: 'Guest',
      }
    });
  }

  // Handle Category logic
  let category = await db.category.findFirst({
    where: { name: categoryName || 'Opinion' }
  });
  
  if (!category && categoryName) {
    category = await db.category.create({
      data: {
        name: categoryName,
        slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: `Articles in ${categoryName}`,
        contentType: 'news'
      }
    });
  }

  // Create the article as SUBMITTED (pending review)
  await db.article.create({
    data: {
      title,
      slug,
      excerpt,
      body,
      status: 'SUBMITTED',
      contentType: 'ARTICLE',
      authorId: author.id,
      categoryId: category?.id,
      featuredImage: featuredImage || null,
      readingTime: Math.ceil(body.split(' ').length / 200),
    }
  });

  revalidatePath('/admin/articles');
  revalidatePath('/news');
  
  return { success: true };
}
