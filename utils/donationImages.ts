// utils/donationImages.ts
// Local image mapping for donation categories

export const donationImages = {
  'general': require('@/assets/donateimage/general.webp'),
  'food_for_life': require('@/assets/donateimage/ffl.webp'), // Note: assuming you'll rename ffl.webp.jpg to ffl.webp
  'deity_worship': require('@/assets/donateimage/deity.webp'),
  'book_distribution': require('@/assets/donateimage/books.webp'),
  'temple_maintenance': require('@/assets/donateimage/general.webp'), // Fallback to general since no specific image
  'festival_sponsorship': require('@/assets/donateimage/festival.webp'),
};

// Helper function to get image source with fallback
export const getImageSource = (imageKey: string) => {
  return donationImages[imageKey as keyof typeof donationImages] || donationImages.general;
};

// Alternative approach if you prefer to be more explicit about missing images
export const getImageSourceSafe = (imageKey: string) => {
  const imageMap = donationImages as Record<string, any>;
  
  if (imageMap[imageKey]) {
    return imageMap[imageKey];
  }
  
  console.warn(`Image not found for key: ${imageKey}, using fallback`);
  return donationImages.general;
};