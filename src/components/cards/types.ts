export interface CardData {
    cardType: 'HeroCard' | 'ListCard' | 'BusinessCard' | 'ArticleCard' | 'AlertCard' | 'NavigationCard' | 'ProductCard' | 'ProfileCard' | 'MapCard' | 'GalleryCard' | 'ReservationCard' | string;
    title?: string;
    subtitle?: string;
    content?: string;
    badge?: string;
    imageUrl?: string;
    buttonText?: string;
    buttonAction?: string;
    buttonUrl?: string;
    listItems?: Array<{ title: string; subtitle?: string; icon?: string }>;
    contactName?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
    website?: string;
    lat?: number | string;
    lon?: number | string;
    stopName?: string;
    suggestedBlocks?: string[];
    price?: string;
    oldPrice?: string;
    locationTitle?: string;
    imageUrls?: string[];
}
