import { db } from './index';
import { properties, residentServices, stores, adBanners, newsArticles, users } from './schema';
import { eq } from 'drizzle-orm';

export async function syncPropertyToSql(prop: any) {
  try {
    await db.insert(properties).values({
      id: prop.id,
      title: prop.title || '',
      slug: prop.slug || prop.id,
      project: prop.project || 'ocean-park-1',
      subdivision: prop.subdivision || '',
      type: prop.type || 'can-ho',
      listingType: prop.listingType || 'sale',
      price: prop.price || '0',
      priceUnit: prop.priceUnit || 'tỷ',
      area: prop.area ? String(prop.area) : '0',
      bedrooms: prop.bedrooms ? Number(prop.bedrooms) : null,
      bathrooms: prop.bathrooms ? Number(prop.bathrooms) : null,
      direction: prop.direction || '',
      location: prop.location || '',
      description: prop.description || '',
      images: prop.images || [],
      authorPhone: prop.authorPhone || '',
      authorName: prop.authorName || '',
      authorAvatar: prop.authorAvatar || '',
      authorZalo: prop.authorZalo || '',
      authorId: prop.authorId || '',
      status: prop.status || 'approved',
      vipTier: prop.vipTier || 'free',
      featured: Boolean(prop.featured),
      views: prop.views ? Number(prop.views) : 0,
    }).onConflictDoUpdate({
      target: properties.id,
      set: {
        title: prop.title,
        price: prop.price,
        status: prop.status,
        updatedAt: new Date(),
      }
    });
  } catch (err) {
    console.error(`[CloudSQL Sync Property Error ${prop.id}]`, err);
  }
}

export async function syncResidentServiceToSql(serv: any) {
  try {
    await db.insert(residentServices).values({
      id: serv.id,
      name: serv.name,
      category: serv.category,
      phone: serv.phone,
      zalo: serv.zalo,
      avatar: serv.avatar,
      experience: serv.experience,
      rating: serv.rating ? String(serv.rating) : '5.0',
      reviewCount: serv.reviewCount ? Number(serv.reviewCount) : 0,
      pricing: serv.pricing,
      location: serv.location,
      kycVerified: serv.kycVerified !== false,
      status: serv.status || 'active',
      description: serv.description,
    }).onConflictDoUpdate({
      target: residentServices.id,
      set: {
        name: serv.name,
        phone: serv.phone,
        status: serv.status,
      }
    });
  } catch (err) {
    console.error(`[CloudSQL Sync Service Error ${serv.id}]`, err);
  }
}

export async function syncStoreToSql(store: any) {
  try {
    await db.insert(stores).values({
      id: store.id,
      name: store.name,
      category: store.category,
      phone: store.phone,
      zalo: store.zalo,
      avatar: store.avatar,
      coverImage: store.coverImage,
      address: store.address,
      rating: store.rating ? String(store.rating) : '5.0',
      verified: store.verified !== false,
      vipLevel: store.vipLevel || 'basic',
      status: store.status || 'approved',
      description: store.description,
      ownerId: store.ownerId,
    }).onConflictDoUpdate({
      target: stores.id,
      set: {
        name: store.name,
        phone: store.phone,
        status: store.status,
      }
    });
  } catch (err) {
    console.error(`[CloudSQL Sync Store Error ${store.id}]`, err);
  }
}

export async function syncNewsArticleToSql(article: any) {
  try {
    await db.insert(newsArticles).values({
      id: article.id,
      title: article.title || '',
      slug: article.slug || article.id,
      summary: article.summary || '',
      content: article.content || '',
      imageUrl: article.image || article.imageUrl || '',
      author: article.author || 'Ban Quản Trị',
      category: article.category || 'Thị Trường',
      status: article.status || 'published',
      views: article.views ? Number(article.views) : 0,
    }).onConflictDoUpdate({
      target: newsArticles.id,
      set: {
        title: article.title,
        summary: article.summary,
        content: article.content,
        imageUrl: article.image || article.imageUrl,
        status: article.status,
      }
    });
  } catch (err) {
    console.error(`[CloudSQL Sync News Error ${article.id}]`, err);
  }
}

export async function syncAdBannerToSql(ad: any) {
  try {
    await db.insert(adBanners).values({
      id: ad.id,
      title: ad.title || '',
      imageUrl: ad.imageUrl || ad.image || '',
      targetUrl: ad.targetUrl || ad.link || '',
      position: ad.position || 'home_hero',
      status: ad.status || 'active',
      startDate: ad.startDate || '',
      endDate: ad.endDate || '',
      clicks: ad.clicks || ad.clickCount ? Number(ad.clicks || ad.clickCount) : 0,
    }).onConflictDoUpdate({
      target: adBanners.id,
      set: {
        title: ad.title,
        imageUrl: ad.imageUrl || ad.image,
        targetUrl: ad.targetUrl || ad.link,
        status: ad.status,
      }
    });
  } catch (err) {
    console.error(`[CloudSQL Sync Ad Error ${ad.id}]`, err);
  }
}
